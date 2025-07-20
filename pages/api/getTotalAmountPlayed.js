import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const recent = await db
      .collection("playersInput")
      .find({})
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
      const pPercent = p.percentages || { threeD: 0, twoD: 0, oneD: 0 };
      afterThreeD +=
        (p.amountPlayed?.ThreeD || 0) * (1 - pPercent.threeD / 100);
      afterTwoD += (p.amountPlayed?.TwoD || 0) * (1 - pPercent.twoD / 100);
      afterOneD += (p.amountPlayed?.OneD || 0) * (1 - pPercent.oneD / 100);
    }

    const finalTotals = {
      OneD: afterOneD.toFixed(1),
      TwoD: afterTwoD.toFixed(1),
      ThreeD: afterThreeD.toFixed(1),
      total: (afterOneD + afterTwoD + afterThreeD).toFixed(1),
    };

    return res.status(200).json({ totals: finalTotals });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
