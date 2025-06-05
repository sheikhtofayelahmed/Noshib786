import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date, threeUp, downGame } = req.body;
    if (!date || !threeUp || !downGame) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Format the date
    const gameDate = new Date(date);
    const day = gameDate.getDate().toString().padStart(2, "0");
    const month = (gameDate.getMonth() + 1).toString().padStart(2, "0");
    const year = gameDate.getFullYear();

    const threeUpFormatted = threeUp.toString().padStart(3, "0");
    const downGameFormatted = downGame.toString().padStart(2, "0");

    const formattedKey = `${day} ${month} ${year} ${threeUpFormatted} ${downGameFormatted}`;

    // Get all player entries
    const playersInputs = await db
      .collection("playersInput")
      .find({})
      .toArray();

    if (playersInputs.length === 0) {
      return res
        .status(200)
        .json({ message: "No player entries found to move" });
    }

    // Prepare document for history
    const historyEntry = {
      [formattedKey]: playersInputs.map(({ _id, ...rest }) => rest),
    };

    // Save to history
    await db.collection("history").insertOne(historyEntry);

    // Clear the player inputs
    await db.collection("playersInput").deleteMany({});

    res.status(200).json({
      message: `Moved ${playersInputs.length} entries under "${formattedKey}"`,
    });
  } catch (error) {
    console.error("Error saving to history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
