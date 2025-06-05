import clientPromise from "../../lib/mongodb";
// No need for ObjectId import if you're not explicitly creating them here,
// but good to keep if you might need it elsewhere in the file.
// import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // 1. Method Check: Ensure only POST requests are allowed.
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({
        message:
          "Method Not Allowed. This endpoint only accepts POST requests.",
      });
  }

  const { voucher, agentId, name, data, amountPlayed } = req.body;

  // 2. Server-Side Timestamp: Always use the server's time.
  const serverTime = new Date();

  // 3. Basic Payload Validation: Essential data must be present.
  if (!voucher || !agentId || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      message:
        "Invalid payload. Missing 'voucher', 'agentId', or 'data' array is empty/invalid.",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // 4. Fetch Latest Game Status (for context in the waiting entry, not for routing this request)
    const gameStatusCollection = db.collection("gameStatus");
    const gameStatus = await gameStatusCollection.findOne(
      {},
      { sort: { updatedAt: -1 } }
    );

    // Safely parse game status details for the waiting entry.
    const targetDateTime = gameStatus?.targetDateTime
      ? new Date(gameStatus.targetDateTime)
      : null;
    const isGameOn = gameStatus?.isGameOn ?? false;

    // 5. Sanitize Input Entries for Saving:
    // This process is independent of where it's saved, always sanitize.
    const sanitizedEntries = data
      .map((entry) => ({ input: entry.input?.trim() || "" }))
      .filter((entry) => entry.input.length > 0);

    // If, after sanitization, there are no valid entries, return a 400.
    if (sanitizedEntries.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid entries to save after sanitization." });
    }

    // 6. Save to 'waitingSavePlayer' Collection:
    // All submissions now go here by default.
  

    const waitingResult = await db.collection("waitingSavePlayer").insertOne({
      voucher,
      agentId,
      name,
      entries: sanitizedEntries, // Use sanitized data
      amountPlayed, // Include amountPlayed as it's part of the original submission
      submissionTime: serverTime, // Use a generic name, as it's the time of *this* submission
      gameStatusAtSubmission: {
        // Context of game status when this submission was made
        isGameOn: isGameOn,
        targetDateTime: targetDateTime ? targetDateTime.toISOString() : null,
      },
      // Add a status field to track its review state (e.g., 'pending', 'approved', 'rejected')
      status: "pending", // Default status for new waiting entries
      // You might also add a `processedBy` or `processedAt` field, which would be populated later by admin action.
    });

    // 7. Respond with 202 Accepted:
    // This status indicates that the request has been accepted for processing,
    // but the processing is not yet complete (it's in a queue for admin review).
    return res.status(202).json({
      message:
        "✅ Player data submitted for review and saved to 'waiting' list.",
      waitingEntryId: waitingResult.insertedId,
    });
  } catch (error) {
    // 8. Centralized Error Handling: Catch any database or unexpected errors.
    console.error(
      "Database or processing error during waiting list submission:",
      error
    );
    // Return a generic 500 error to the client for security.
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
}
