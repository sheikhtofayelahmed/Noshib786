import clientPromise from "lib/mongodb";

// RUMBLE generator
function getPermutations(str) {
  if (str.length <= 1) return [str];
  const perms = new Set();
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const rest = str.slice(0, i) + str.slice(i + 1);
    for (const perm of getPermutations(rest)) {
      perms.add(char + perm);
    }
  }
  perms.delete(str); // exclude original if needed
  return [...perms];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { gameDate, threeUp, downGame } = req.body;

    if (
      !threeUp ||
      !downGame ||
      !/^\d{3}$/.test(threeUp) ||
      !/^\d{2}$/.test(downGame)
    ) {
      return res.status(400).json({ error: "Invalid or missing query params" });
    }

    const str3D = threeUp;
    const permutations3D = getPermutations(str3D);
    const str2D = downGame;
    const reversed2D = str2D.split("").reverse().join("");
    const singleDigits = str3D.split("");

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // 1. Get only active agents
    const agents = await db
      .collection("agents")
      .find({ active: true })
      .toArray();

    const summaries = [];

    for (const agent of agents) {
      const { agentId, percentages, name } = agent;
      if (!agentId || !percentages) continue;

      // 2. Fetch player entries for this agent
      const pipeline = [
        { $unwind: "$entries" },
        { $match: { agentId } },
        {
          $project: {
            agentId: 1,
            name: 1,
            voucher: 1,
            input: "$entries.input",
          },
        },
        {
          $addFields: {
            splitInput: { $split: ["$input", "."] },
          },
        },
        {
          $project: {
            agentId: 1,
            name: 1,
            voucher: 1,
            number: { $arrayElemAt: ["$splitInput", 0] },
            slots: {
              $map: {
                input: { $slice: ["$splitInput", 1, 10] },
                as: "val",
                in: { $toInt: "$$val" },
              },
            },
          },
        },
      ];

      const docs = await db
        .collection("playersInput")
        .aggregate(pipeline)
        .toArray();

      const results = [];

      for (const doc of docs) {
        const { name, voucher, number, slots } = doc;
        if (!number || !slots.length) continue;

        const amount = (i) => slots[i] || 0;
        const wins = [];

        if (number.length === 3 && number === str3D && amount(0) > 0) {
          wins.push({ type: "STR3D", amount: amount(0) });
        }
        if (
          number.length === 3 &&
          permutations3D.includes(number) &&
          amount(1) > 0
        ) {
          wins.push({ type: "RUMBLE3D", amount: amount(1) });
        }
        if (number.length === 2 && number === str2D && amount(0) > 0) {
          wins.push({ type: "STR2D", amount: amount(0) });
        }
        if (number.length === 2 && number === reversed2D && amount(1) > 0) {
          wins.push({ type: "RUMBLE2D", amount: amount(1) });
        }
        if (
          number.length === 1 &&
          singleDigits.includes(number) &&
          amount(0) > 0
        ) {
          wins.push({ type: "SINGLE", amount: amount(0) });
        }

        if (wins.length > 0) {
          results.push({ agentId, name, voucher, number, slots, wins });
        }
      }

      // 3. Compute totalWins and amountPlayed from vouchers
      const totalWins = { STR3D: 0, RUMBLE3D: 0, SINGLE: 0, DOWN: 0 };
      for (const entry of results) {
        for (const win of entry.wins) {
          if (win.type === "STR2D" || win.type === "RUMBLE2D") {
            totalWins.DOWN += win.amount;
          } else if (totalWins.hasOwnProperty(win.type)) {
            totalWins[win.type] += win.amount;
          }
        }
      }

      // Optional: pull last 20 vouchers to compute totalAmountPlayed
      const recentPlays = await db
        .collection("playersInput")
        .find({ agentId })
        .sort({ time: -1 })
        .toArray();

      const totalAmounts = recentPlays.reduce(
        (acc, p) => {
          acc.ThreeD += p.amountPlayed?.ThreeD || 0;
          acc.TwoD += p.amountPlayed?.TwoD || 0;
          acc.OneD += p.amountPlayed?.OneD || 0;
          return acc;
        },
        { ThreeD: 0, TwoD: 0, OneD: 0 }
      );

      // 4. Apply percentages
      const afterThreeD = Math.floor(
        totalAmounts.ThreeD * (1 - percentages.threeD / 100)
      );
      const afterTwoD = Math.floor(
        totalAmounts.TwoD * (1 - percentages.twoD / 100)
      );
      const afterOneD = Math.floor(
        totalAmounts.OneD * (1 - percentages.oneD / 100)
      );
      const afterSTR = Math.floor(totalWins.STR3D * percentages.str);
      const afterRUMBLE = Math.floor(totalWins.RUMBLE3D * percentages.rumble);
      const afterDOWN = Math.floor(totalWins.DOWN * percentages.down);
      const afterSINGLE = Math.floor(totalWins.SINGLE * percentages.single);

      const totalGame = afterThreeD + afterTwoD + afterOneD;
      let totalWin = afterSTR + afterRUMBLE + afterDOWN + afterSINGLE;
      if (totalWin < totalGame) {
        if (agent.tenPercent) {
          totalWin += Math.floor(totalWin * (agent.tenPercentAmt / 100));
        }
        if (agent.expense) {
          totalWin += Number(agent.expenseAmt);
        }
      }
      const WL = totalGame - totalWin;

      const summary = {
        agentId,
        name,
        totalAmounts,
        totalWins,
        afterThreeD,
        afterTwoD,
        afterOneD,
        afterSTR,
        afterRUMBLE,
        afterDOWN,
        afterSINGLE,
        totalGame,
        totalWin,
        WL,
        gameDate,
        threeUp,
        downGame,
        createdAt: new Date(),
      };

      summaries.push(summary);
      await db.collection("summaries").insertOne(summary);
    }

    res.status(200).json({ message: "All summaries completed", summaries });
  } catch (error) {
    console.error("Batch summary error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
