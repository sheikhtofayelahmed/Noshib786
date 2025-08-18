import clientPromise from "lib/mongodb";

function getPermutations(numStr) {
  if (numStr.length !== 3) return [];

  const perms = new Set();

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      for (let k = 0; k < 3; k++) {
        if (i === k || j === k) continue;
        const perm = numStr[i] + numStr[j] + numStr[k];
        if (perm !== numStr) perms.add(perm);
      }
    }
  }

  return [...perms];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { gameDate, threeUp, downGame, gamerId } = req.body;

    if (
      !threeUp ||
      !downGame ||
      !gamerId ||
      !/^\d{3}$/.test(threeUp) ||
      !/^\d{2}$/.test(downGame)
    ) {
      return res.status(400).json({ error: "Invalid or missing query params" });
    }

    const permutations3D = getPermutations(threeUp);
    const reversed2D = downGame.split("").reverse().join("");
    const singleDigits = threeUp.split("");

    const client = await clientPromise;
    const db = client.db("noshib786");

    const players = await db
      .collection("playersInput")
      .find({ gamerId })
      .toArray();
    const wins = [];

    for (const player of players) {
      const pPercent = player.cPercentages || {};
      for (const entry of player.entries || []) {
        const { num: number, str = 0, rumble = 0 } = entry.input || {};
        const winDetails = [];

        if (!number) continue;

      // Case 1: Exact match → STR + RUMBLE
if (number === threeUp) {
  if (str > 0) {
    winDetails.push({ type: "STR3D", amount: str });
  }
  if (rumble > 0) {
    winDetails.push({ type: "RUMBLE3D", amount: rumble });
  }
}

// Case 2: Permutations (excluding original) → only RUMBLE
if (number.length === 3 && permutations3D.includes(number) && rumble > 0) {
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
            gamerId,
            name: player.name,
            voucher: player.voucher,
            number,
            entry,
            winDetails,
            percentages: pPercent,
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

    const examplePercent = players[0]?.percentages || {};
    const totalSTR = totalWins.STR3D * (examplePercent.str || 0);
    const totalRUMBLE = totalWins.RUMBLE3D * (examplePercent.rumble || 0);
    const totalDOWN = totalWins.DOWN * (examplePercent.down || 0);
    const totalSINGLE = totalWins.SINGLE * (examplePercent.single || 0);

    let totalWin = totalSTR + totalRUMBLE + totalDOWN + totalSINGLE;

    const summary = {
      gamerId,
      percentages: examplePercent,
      totalWins,
      afterSTR: totalSTR,
      afterRUMBLE: totalRUMBLE,
      afterDOWN: totalDOWN,
      afterSINGLE: totalSINGLE,
      totalWin,
      gameDate,
      threeUp,
      downGame,
      createdAt: new Date(),
    };

    res.status(200).json({ message: "All summaries completed", summary });
  } catch (error) {
    console.error("Batch summary error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
