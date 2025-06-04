import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { voucher, agentId, name, SAId, data, amountPlayed } = req.body;

  // 🔒 Use server-side time only (don't trust client-sent time)
  const serverTime = new Date();

  // Validate required fields
  if (!voucher || !agentId || !Array.isArray(data) || data.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid payload, missing or malformed data" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Get the latest game status
    const gameStatus = await db
      .collection("gameStatus")
      .findOne({}, { sort: { updatedAt: -1 } });

    // 🔒 Enforce both game switch and time cutoff
    if (
      !gameStatus ||
      !gameStatus.isGameOn ||
      (gameStatus.targetDateTime &&
        serverTime > new Date(gameStatus.targetDateTime))
    ) {
      return res.status(403).json({
        message: "⛔ Game is not active or time is up. Submission blocked.",
      });
    }

    // Sanitize inputs
    const entries = data
      .map((entry) => ({ input: entry.input?.trim() || "" }))
      .filter((entry) => entry.input.length > 0);

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid entries to save" });
    }

    // Save to database
    const playerResult = await db.collection("playersInput").insertOne({
      voucher,
      agentId,
      name,
      SAId,
      time: serverTime, // 🔐 Save only trusted server timestamp
      entries,
      amountPlayed,
    });

    return res.status(200).json({
      message: "✅ Player and entries saved successfully",
      playerId: playerResult.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
