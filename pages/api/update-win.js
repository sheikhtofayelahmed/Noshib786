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
      {}, // find the single document
      {
        $set: {
          threeUp,
          downGame,
          gameDate,
          winStatus,
        },
      },
      { upsert: true } // if it doesn't exist, create it
    );

    return res
      .status(200)
      .json({ message: "Winning numbers updated successfully" });
  } catch (error) {
    console.error("Error updating winning numbers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
