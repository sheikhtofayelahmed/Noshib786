import clientPromise from "lib/mongodb";

// Generate all permutations except the original
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

    const permutations3D = getPermutations(threeUp);
    console.log(permutations3D);

    const reversed2D = downGame.split("").reverse().join("");
    const singleDigits = threeUp.split("");

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const agents = await db
      .collection("agents")
      .find({ active: true })
      .toArray();
    const summaries = [];

    for (const agent of agents) {
      const { agentId, percentages, name } = agent;
      if (!agentId || !percentages) continue;

      const players = await db
        .collection("playersInput")
        .find({ agentId })
        .toArray();

      const wins = [];

      for (const player of players) {
        for (const entry of player.entries || []) {
          const input = entry.input || {};
          const number = input.num;
          const str = parseInt(input.str || 0);
          const rumble = parseInt(input.rumble || 0);

          if (!number) continue;

          const winDetails = [];

          if (number === threeUp && str > 0) {
            winDetails.push({ type: "STR3D", amount: str });
          }
          if (
            number.length === 3 &&
            (number === threeUp || permutations3D.includes(number)) &&
            rumble > 0
          ) {
            winDetails.push({ type: "RUMBLE3D", amount: rumble });
          }
          if (number.length === 2 && number === downGame && str > 0) {
            winDetails.push({ type: "STR2D", amount: str });
          }
          if (number.length === 2 && number === reversed2D && rumble > 0) {
            winDetails.push({ type: "RUMBLE2D", amount: rumble });
          }
          if (number.length === 1 && singleDigits.includes(number) && str > 0) {
            winDetails.push({ type: "SINGLE", amount: str });
          }

          if (winDetails.length > 0) {
            wins.push({
              agentId,
              name: player.name,
              voucher: player.voucher,
              number,
              entry,
              winDetails,
            });
          }
        }
      }

      const totalWins = { STR3D: 0, RUMBLE3D: 0, SINGLE: 0, DOWN: 0 };
      for (const w of wins) {
        for (const result of w.winDetails) {
          if (["STR2D", "RUMBLE2D"].includes(result.type)) {
            totalWins.DOWN += result.amount;
          } else if (totalWins.hasOwnProperty(result.type)) {
            totalWins[result.type] += result.amount;
          }
        }
      }

      const recent = await db
        .collection("playersInput")
        .find({ agentId })
        .sort({ time: -1 })
        .toArray();

      const totalAmounts = recent.reduce(
        (acc, p) => {
          acc.ThreeD += p.amountPlayed?.ThreeD || 0;
          acc.TwoD += p.amountPlayed?.TwoD || 0;
          acc.OneD += p.amountPlayed?.OneD || 0;
          return acc;
        },
        { ThreeD: 0, TwoD: 0, OneD: 0 }
      );
      let afterThreeD = 0;
      let afterTwoD = 0;
      let afterOneD = 0;

      for (const p of recent) {
        const pPercent = p.percentages || { oneD: 0, twoD: 0, threeD: 0 };

        afterThreeD += Math.floor(
          (p.amountPlayed?.ThreeD || 0) * (1 - pPercent.threeD / 100)
        );
        afterTwoD += Math.floor(
          (p.amountPlayed?.TwoD || 0) * (1 - pPercent.twoD / 100)
        );
        afterOneD += Math.floor(
          (p.amountPlayed?.OneD || 0) * (1 - pPercent.oneD / 100)
        );
      }
      const totalSTR = Math.floor(totalWins.STR3D * percentages.str);
      const totalRUMBLE = Math.floor(totalWins.RUMBLE3D * percentages.rumble);
      const totalDOWN = Math.floor(totalWins.DOWN * percentages.down);
      const totalSINGLE = Math.floor(totalWins.SINGLE * percentages.single);

      const totalGame = afterThreeD + afterTwoD + afterOneD;
      let totalWin = totalSTR + totalRUMBLE + totalDOWN + totalSINGLE;

      let underPercentage = 0;
      let Expense = 0;

      if (totalWin < totalGame) {
        if (agent.tenPercent) {
          underPercentage = Math.floor(totalWin * (agent.tenPercentAmt / 100));
          totalWin += underPercentage;
        }
        if (agent.expense) {
          Expense = Number(agent.expenseAmt) || 0;
          totalWin += Expense;
        }
      }

      const WL = totalGame - totalWin;

      const summary = {
        agentId,
        name,
        percentages,
        totalAmounts,
        totalWins,
        afterThreeD,
        afterTwoD,
        afterOneD,
        afterSTR: totalWins.STR3D,
        afterRUMBLE: totalWins.RUMBLE3D,
        afterDOWN: totalWins.DOWN,
        afterSINGLE: totalWins.SINGLE,
        totalGame,
        totalWin,
        expense: agent.expense,
        tenPercent: agent.tenPercent,
        tenPercentAmt: agent.tenPercentAmt,
        underPercentage,
        Expense,
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
