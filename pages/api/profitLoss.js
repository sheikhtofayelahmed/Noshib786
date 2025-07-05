import clientPromise from "lib/mongodb";

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

    const multipliers = {
      threeD: { str: 400, rumble: 80 },
      twoD: 60,
      oneD: 3,
    };

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
        } else if (num.length === 2) {
          grandTotals.TwoD += amount * ((100 - cPercent.twoD) / 100);
        } else if (num.length === 3) {
          grandTotals.ThreeD += amount * ((100 - cPercent.threeD) / 100);
        }

        if (!numberStats[num]) {
          numberStats[num] = {
            number: num,
            str: 0,
            rumble: 0,
            type: num.length === 3 ? "3D" : num.length === 2 ? "2D" : "1D",
          };
        }

        numberStats[num].str += str;
        numberStats[num].rumble += rumble;
      }
    }

    const finalTotals = {
      OneD: Math.round(grandTotals.OneD),
      TwoD: Math.round(grandTotals.TwoD),
      ThreeD: Math.round(grandTotals.ThreeD),
      total: Math.round(
        grandTotals.OneD + grandTotals.TwoD + grandTotals.ThreeD
      ),
    };

    // Calculate single digit payouts
    for (const [num, data] of Object.entries(numberStats)) {
      if (data.type === "1D") {
        singleDigitPayouts[num] =
          (data.str + data.rumble) * multipliers.oneD;
      }
    }

    const threeD = [];
    const twoD = [];

    for (const [num, data] of Object.entries(numberStats)) {
      if (data.type === "3D") {
        let payout =
          data.str * multipliers.threeD.str +
          data.rumble * multipliers.threeD.rumble;

        // Add unique single digit payouts (3 & 4 for 344, but 4 only once)
        const digits = [...new Set(num.split(""))];
        for (const d of digits) {
          if (singleDigitPayouts[d]) {
            payout += singleDigitPayouts[d];
          }
        }

        const pl = (finalTotals.total - payout) / 100;

        threeD.push({
          number: num,
          str: data.str,
          rumble: data.rumble,
          payout,
          pl: Math.round(pl),
        });

      } else if (data.type === "2D") {
        const payout = (data.str + data.rumble) * multipliers.twoD;
        const pl = (finalTotals.total - payout) / 100;

        twoD.push({
          number: num,
          str: data.str,
          rumble: data.rumble,
          payout,
          pl: Math.round(pl),
        });
      }
    }

    // Sort by profit/loss descending
    threeD.sort((a, b) => b.pl - a.pl);
    twoD.sort((a, b) => b.pl - a.pl);

    res.status(200).json({
      threeD,
      twoD,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
              }
