import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    voucher,
    agentId,
    gamerId,
    agentName,
    name,
    data, // Array of { input: { num, str, rumble } }
    amountPlayed,
    cPercentages,
    percentages, // { OneD, TwoD, ThreeD }
  } = req.body;

  const serverTime = new Date();

  // Basic payload validation
  if (
    !voucher ||
    !agentId ||
    !gamerId ||
    !Array.isArray(data) ||
    data.length === 0 ||
    !amountPlayed
  ) {
    return res.status(400).json({ message: "Invalid or incomplete payload" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const gameStatus = await db
      .collection("gameStatus")
      .findOne({}, { sort: { updatedAt: -1 } });

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

    // Validate and sanitize entries
    const entries = data
      .map((entry) => {
        const input = entry.input || {};
        return {
          input: {
            num: String(input.num || "").trim(),
            str: Number(input.str) || 0,
            rumble: Number(input.rumble) || 0,
          },
        };
      })
      .filter((entry) => entry.input.num); // keep entries with a valid num

    if (entries.length === 0) {
      return res.status(400).json({ message: "No valid entries to save" });
    }

    const savedPlayer = await db.collection("gamersInput").insertOne({
      voucher,
      agentId,
      gamerId,
      agentName,
      name,
      time: serverTime,
      entries,
      amountPlayed,
      cPercentages,
      percentages,
    });

    return res.status(200).json({
      message: "✅ Player and entries saved successfully",
      playerId: savedPlayer.insertedId,
    });
  } catch (err) {
    console.error("❌ Error saving player:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
