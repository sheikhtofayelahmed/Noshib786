import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method Not Allowed. This endpoint only accepts POST requests.",
    });
  }

  const {
    voucher,
    agentId,
    agentName,
    name,
    data,
    amountPlayed,
    cPercentages,
    percentages,
  } = req.body;
  const serverTime = new Date();

  if (!voucher || !agentId || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      message:
        "Invalid payload. Missing 'voucher', 'agentId', or empty/invalid 'data' array.",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const gameStatus = await db
      .collection("gameStatus")
      .findOne({}, { sort: { updatedAt: -1 } });

    const targetDateTime = gameStatus?.targetDateTime
      ? new Date(gameStatus.targetDateTime)
      : null;
    const isGameOn = gameStatus?.isGameOn ?? false;

    // 🎯 Sanitize and validate object-formatted entries
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
      .filter((entry) => entry.input.num); // Require at least a num to save

    if (entries.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid entries after sanitization." });
    }

    const waitingResult = await db.collection("waitingSavePlayer").insertOne({
      voucher,
      agentId,
      agentName,
      name,
      entries,
      time: serverTime,
      amountPlayed,
      cPercentages,
      percentages,
      submissionTime: serverTime,
      gameStatusAtSubmission: {
        isGameOn,
        targetDateTime: targetDateTime ? targetDateTime.toISOString() : null,
      },
      status: "pending",
    });

    return res.status(202).json({
      message: "✅ Player data submitted to 'waiting' list.",
      waitingEntryId: waitingResult.insertedId,
    });
  } catch (error) {
    console.error("❌ Waiting list DB error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}
