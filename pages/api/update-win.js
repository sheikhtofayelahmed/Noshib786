import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { threeUp, downGame, gameDate, winStatus } = req.body;

  if (!threeUp || !downGame || !gameDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db.collection("winning_numbers").updateOne(
      { gameDate }, // Look for existing entry with same gameDate
      {
        $set: {
          threeUp,
          downGame,
          winStatus,
        },
        $setOnInsert: {
          gameDate,
          createdAt: new Date(),
        },
      },
      { upsert: true } // Insert if not found
    );

    return res.status(200).json({
      message: result.upsertedCount
        ? "New winning entry created"
        : "Winning entry updated",
      upsertedId: result.upsertedId || null,
    });
  } catch (error) {
    console.error("Error saving winning data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}