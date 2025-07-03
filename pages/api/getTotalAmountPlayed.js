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

    let grandTotals = { OneD: 0, TwoD: 0, ThreeD: 0 };

    for (const player of players) {
      const entries = player.entries || [];
      const cPercent = player.cPercentages || { oneD: 0, twoD: 0, threeD: 0 };

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
        } else {
          grandTotals.ThreeD += amount * ((100 - cPercent.threeD) / 100);
        }
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

    return res.status(200).json({ totals: finalTotals });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
