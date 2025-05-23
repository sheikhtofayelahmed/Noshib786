import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { voucher, agentId, name, time, data, amountPlayed } = req.body;

  if (
    !voucher ||
    !agentId ||
    !time ||
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Invalid payload, missing or malformed data" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // 🔒 Check game status from DB (assuming you store it in a collection called 'gameStatus')
    const gameStatus = await db
      .collection("gameStatus")
      .findOne({}, { sort: { updatedAt: -1 } });

    if (!gameStatus || !gameStatus.isGameOn) {
      return res
        .status(403)
        .json({ message: "Game is not active. Submission blocked." });
    }

    const entries = data
      .map((entry) => ({
        input: entry.input.trim(),
      }))
      .filter((entry) => entry.input.length > 0);

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid entries to save" });
    }

    const playerResult = await db.collection("playersInput").insertOne({
      voucher,
      agentId,
      name,
      time: new Date(time),
      entries,
      amountPlayed,
    });

    return res.status(200).json({
      message: "Player and entries saved successfully",
      playerId: playerResult.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
