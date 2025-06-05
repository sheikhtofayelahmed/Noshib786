import clientPromise from "lib/mongodb";

// Get all permutations of a string (e.g., 123 → [132, 213, 231, 312, 321])
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
  perms.delete(str); // remove original if we only want RUMBLEs
  return [...perms];
}

export default async function handler(req, res) {
  try {
    const { threeUp, downGame, agentId } = req.body;

    if (
      !threeUp ||
      !downGame ||
      !/^\d{3}$/.test(threeUp) ||
      !/^\d{2}$/.test(downGame)
    ) {
      return res.status(400).json({ error: "Invalid or missing query params" });
    }

    if (agentId && typeof agentId !== "string") {
      return res.status(400).json({ error: "Invalid agentId" });
    }

    // Winning Numbers
    const str3D = threeUp;
    const permutations3D = getPermutations(str3D);
    const str2D = downGame;
    const reversed2D = downGame.split("").reverse().join("");
    const singleDigit = (
      threeUp
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0) % 10
    ).toString();

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const pipeline = [
      { $unwind: "$entries" },
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
      ...(agentId ? [{ $match: { agentId } }] : []),
    ];

    const docs = await db
      .collection("playersInput")
      .aggregate(pipeline)
      .toArray();

    const results = [];

    for (const doc of docs) {
      const { agentId, name, voucher, number, slots } = doc;
      if (!number || !slots.length) continue;

      const amount = (index) => slots[index] || 0;
      const matchTypes = [];

      // STR3D
      if (number.length === 3 && number === str3D && amount(0) > 0) {
        matchTypes.push({ type: "STR3D", amount: amount(0) });
      }

      // RUMBLE3D
      if (
        number.length === 3 &&
        permutations3D.includes(number) &&
        amount(1) > 0
      ) {
        matchTypes.push({ type: "RUMBLE3D", amount: amount(1) });
      }

      // STR2D
      if (number.length === 2 && number === str2D && amount(0) > 0) {
        matchTypes.push({ type: "STR2D", amount: amount(0) });
      }

      // RUMBLE2D
      if (number.length === 2 && number === reversed2D && amount(1) > 0) {
        matchTypes.push({ type: "RUMBLE2D", amount: amount(1) });
      }

      // SINGLE
      if (number.length === 1 && number === singleDigit && amount(0) > 0) {
        matchTypes.push({ type: "SINGLE", amount: amount(0) });
      }

      if (matchTypes.length > 0) {
        results.push({
          agentId,
          name,
          voucher,
          number,
          slots,
          wins: matchTypes,
        });
      }
    }

    const totalWins = {
      STR3D: 0,
      RUMBLE3D: 0,
      SINGLE: 0,
      DOWN: 0,
    };

    for (const entry of results) {
      for (const win of entry.wins) {
        if (win.type === "STR2D" || win.type === "RUMBLE2D") {
          totalWins.DOWN += win.amount;
        } else if (totalWins.hasOwnProperty(win.type)) {
          totalWins[win.type] += win.amount;
        }
      }
    }

    res.status(200).json({
      agentId,
      totalWins,
      results,
    });
  } catch (err) {
    console.error("Error in winning analysis:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
