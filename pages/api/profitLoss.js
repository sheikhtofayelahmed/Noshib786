import clientPromise from "lib/mongodb";

function getPermutations(num) {
  const digits = num.split("");
  const results = new Set();

  function permute(arr, l, r) {
    if (l === r) results.add(arr.join(""));
    else {
      for (let i = l; i <= r; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]];
        permute(arr, l + 1, r);
        [arr[l], arr[i]] = [arr[i], arr[l]];
      }
    }
  }

  permute(digits, 0, digits.length - 1);
  return Array.from(results);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const players = await db
      .collection("playersInput")
      .find({})
      .sort({ time: -1 })
      .toArray();

    let grandTotals = { OneD: 0, TwoD: 0, ThreeD: 0 };
    const numberStats = {};
    const singleDigitPayouts = {};
    const numberAgents = {}; // Track which agents submitted each number

    for (const player of players) {
      const entries = player.entries || [];
      const cPercent = player.percentages || { oneD: 0, twoD: 0, threeD: 0 };

      for (const entry of entries) {
        const num = entry.input?.num || "";
        const str = entry.input?.str || 0;
        const rumble = entry.input?.rumble || 0;
        const amount = str + rumble;
        if (!num || typeof amount !== "number") continue;

        // Track agentId for this number
        if (!numberAgents[num]) numberAgents[num] = {};

        if (!numberAgents[num][player.agentId]) {
          numberAgents[num][player.agentId] = { str: 0, rumble: 0 };
        }

        numberAgents[num][player.agentId].str += str;
        numberAgents[num][player.agentId].rumble += rumble;
        if (num.length === 1) {
          grandTotals.OneD += amount * ((100 - cPercent.oneD) / 100);
          const payout = amount;
          singleDigitPayouts[num] = (singleDigitPayouts[num] || 0) + payout;
        } else if (num.length === 2) {
          grandTotals.TwoD += amount * ((100 - cPercent.twoD) / 100);
        } else if (num.length === 3) {
          grandTotals.ThreeD += amount * ((100 - cPercent.threeD) / 100);
        }

        if (!numberStats[num]) {
          numberStats[num] = { str: 0, rumble: 0, length: num.length };
        }
        numberStats[num].str += str;
        numberStats[num].rumble += rumble;
      }
    }

    const finalTotals = {
      oneD: Number(grandTotals.OneD.toFixed(1)),
      twoD: Number(grandTotals.TwoD.toFixed(1)),
      threeD: Number(grandTotals.ThreeD.toFixed(1)),
      total: Number(
        (grandTotals.OneD + grandTotals.TwoD + grandTotals.ThreeD).toFixed(1)
      ),
    };

    const multipliers = {
      threeD: { str: 400, rumble: 80 },
      twoD: 60,
      single: 3,
    };

    const threeD = [];
    const twoD = [];

    for (const [num, data] of Object.entries(numberStats)) {
      const agents = Object.entries(numberAgents[num] || {}).map(
        ([id, stats]) => ({
          id,
          str: Number(stats.str.toFixed(1)),
          rumble: Number(stats.rumble.toFixed(1)),
        })
      );
      if (data.length === 3) {
        const strPayout = data.str * multipliers.threeD.str;

        const perms = getPermutations(num);
        let rumbleSum = 0;
        for (const permNum of perms) {
          if (permNum !== num && numberStats[permNum]) {
            rumbleSum += numberStats[permNum].rumble;
          }
        }

        const rumblePayout =
          (data.rumble + rumbleSum) * multipliers.threeD.rumble;

        const digits = [...new Set(num.split(""))];

        const singleDetails = digits.map((d) => ({
          digit: d,
          amount: singleDigitPayouts[d]
            ? Number(singleDigitPayouts[d].toFixed(1))
            : 0,
        }));

        const singleSum = singleDetails.reduce(
          (sum, obj) => sum + obj.amount * multipliers.single,
          0
        );

        const payout = strPayout + rumblePayout + singleSum;
        const game = finalTotals.threeD + finalTotals.oneD;
        const PL = game - payout;
        const pl = (PL * 100) / game;
        threeD.push({
          number: num,
          str: Number(data.str.toFixed(1)),
          rumble: Number((data.rumble + rumbleSum).toFixed(1)),
          strPayout: Number(strPayout.toFixed(1)),
          rumblePayout: Number(rumblePayout.toFixed(1)),
          singleDetails,
          singleSum: Number(singleSum.toFixed(1)),
          payout: Number(payout.toFixed(1)),
          total: Number(game.toFixed(1)),
          PL: Number(PL.toFixed(1)),
          profitLoss: Number(pl.toFixed(1)), // now a number with 1 decimal
          agents,
        });
      } else if (data.length === 2) {
        const strPayout = data.str * multipliers.twoD;

        const reversed = num.split("").reverse().join("");

        // Only add rumble from the reverse, NOT from num itself
        const reverseRumble =
          reversed !== num ? numberStats[reversed]?.rumble || 0 : 0;

        const rumblePayout = reverseRumble * multipliers.twoD;

        const payout = strPayout + rumblePayout;
        const game = finalTotals.twoD;
        const PL = game - payout;
        const pl = (PL * 100) / game;

        twoD.push({
          number: num,
          str: Number(data.str.toFixed(1)),
          rumble: Number(reverseRumble.toFixed(1)), // show only reverse rumble
          strPayout: Number(strPayout.toFixed(1)),
          rumblePayout: Number(rumblePayout.toFixed(1)),
          payout: Number(payout.toFixed(1)),
          total: Number(game.toFixed(1)),
          PL: Number(PL.toFixed(1)),
          profitLoss: Number(pl.toFixed(1)),
          agents,
        });
      }
    }

    return res.status(200).json({ threeD, twoD, finalTotals });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
