import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Fetch the single winning_numbers document to get the game date
    const winningDoc = await db.collection("winning_numbers").findOne({});
    if (!winningDoc || !winningDoc.date) {
      return res.status(400).json({ error: "Winning numbers date not found" });
    }

    const gameDate = new Date(winningDoc.date); // convert to Date object

    // Get all playersInput entries
    const playersInputs = await db
      .collection("playersInput")
      .find({})
      .toArray();

    if (playersInputs.length === 0) {
      return res
        .status(200)
        .json({ message: "No player entries found to move" });
    }

    // Add gameDate and movedAt to each document and remove _id
    const historyDocs = playersInputs.map(({ _id, ...rest }) => ({
      ...rest,
      gameDate,
    }));

    // Insert into history collection
    await db.collection("history").insertMany(historyDocs);

    // Delete all documents from playersInput
    await db.collection("playersInput").deleteMany({});

    res.status(200).json({
      message: "Moved all entries to history successfully",
      movedCount: playersInputs.length,
    });
  } catch (error) {
    console.error("Error moving entries to history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
