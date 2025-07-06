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

    for (const player of players) {
      const entries = player.entries || [];
      const cPercent = player.percentages || { oneD: 0, twoD: 0, threeD: 0 };

      for (const entry of entries) {
        const num = entry.input?.num || "";
        const str = entry.input?.str || 0;
        const rumble = entry.input?.rumble || 0;
        const amount = str + rumble;
        if (!num || typeof amount !== "number") continue;

        if (num.length === 1) {
          grandTotals.OneD += amount * ((100 - cPercent.oneD) / 100);
          const payout = amount * 1;
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
      oneD:grandTotals.OneD,
      twoD:grandTotals.TwoD,
      threeD:grandTotals.ThreeD,
      total: Math.round(
        grandTotals.OneD + grandTotals.TwoD + grandTotals.ThreeD
      ),
    };

    const multipliers = {
      threeD: { str: 400, rumble: 80 },
      twoD: 60,
      single: 1,
    };

    const threeD = [];
    const twoD = [];

    for (const [num, data] of Object.entries(numberStats)) {
      if (data.length === 3) {
        const strPayout = data.str * multipliers.threeD.str;

        const perms = getPermutations(num);
        let rumbleSum = 0;
        for (const permNum of perms) {
          if (numberStats[permNum]) {
            rumbleSum += numberStats[permNum].rumble;
          }
        }
        const rumblePayout = rumbleSum * multipliers.threeD.rumble;

        const digits = [...new Set(num.split(""))];
        const singleSum = digits.reduce((sum, d) => {
          return sum + (singleDigitPayouts[d] ? singleDigitPayouts[d] * 3 : 0);
        }, 0);

        const payout = strPayout + rumblePayout + singleSum;
        const game=finalTotals.threeD+ finalTotals.oneD
        const PL = game- payout;
        const pl = (PL * 100) / finalTotals.total;

        threeD.push({
          number: num,
          str: data.str,
          rumble: data.rumble,
          strPayout,
          rumblePayout,
          singleSum,
          payout,
          total: game,
          PL,
          profitLoss: pl.toFixed(3), // 3 decimals as string
        });
      } else if (data.length === 2) {
        const strPayout = data.str * multipliers.twoD;
        const rumblePayout = data.rumble * multipliers.twoD;
        const payout = strPayout + rumblePayout;
        const game=finalTotals.twoD
        const PL = game- payout;
        const pl = (PL * 100) / finalTotals.total;
        twoD.push({
          number: num,
          str: data.str,
          rumble: data.rumble,
          strPayout,
          rumblePayout,
          payout,
          total: game,
          PL,
          profitLoss: pl.toFixed(3), // 3 decimals as string
        });
      }
    }

    return res.status(200).json({ threeD, twoD });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
