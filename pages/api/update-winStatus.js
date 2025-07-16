import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { gameDate, winStatus } = req.body;

  if (typeof winStatus !== "boolean" || !gameDate) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db.collection("winning_numbers").updateOne(
      { gameDate }, // match specific gameDate
      {
        $set: { winStatus },
      },
      { upsert: false } // only update existing document
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ error: "No record found for given gameDate" });
    }

    return res.status(200).json({
      result,
      updated: {
        gameDate,
        winStatus,
      },
      message: "Win status updated successfully",
    });
  } catch (error) {
    console.error("Error updating win status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
