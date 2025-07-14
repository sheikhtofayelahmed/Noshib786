// pages/api/admin/approvePlayer.js
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed." });
  }

  const { playerId } = req.body; // Expecting the _id of the player to approve

  if (!playerId) {
    return res
      .status(400)
      .json({ message: "Player ID is required for approval." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // 1. Find the player in the waiting collection
    // We fetch the entire document to get all its data for insertion into the primary collection.
    const waitingPlayer = await db.collection("waitingSavePlayer").findOne({
      _id: new ObjectId(playerId),
      // Optional: Add status: 'pending' here if you want to strictly only approve pending items
      // status: 'pending'
    });

    if (!waitingPlayer) {
      // If not found, it might have been already processed or doesn't exist
      return res.status(404).json({
        message: "Player not found in waiting list or already processed.",
      });
    }

    // Prepare data for the primary collection.
    // We use a spread operator to copy all fields from waitingPlayer,
    // and explicitly remove _id because MongoDB will generate a new one for the new collection.
    const {
      _id,
      submissionTime,
      gameStatusAtSubmission,
      status,
      ...playerDataForPrimary
    } = waitingPlayer;

    // 2. Insert into the primary collection (playersInput)
    const primaryResult = await db.collection("playersInput").insertOne({
      ...playerDataForPrimary, // All other relevant fields
      approvedAt: new Date(), // Timestamp of approval
      originalWaitingId: _id, // Optional: Keep a reference to the original waiting entry's ID
      // You might add an `approvedBy` field here (e.g., admin user ID)
    });

    // 3. **CRITICAL CHANGE: Delete the player from the waiting collection**
    const deleteResult = await db.collection("waitingSavePlayer").deleteOne({
      _id: new ObjectId(playerId),
    });

    if (deleteResult.deletedCount === 0) {
      // This scenario is unlikely if findOne above succeeded, but good for robustness
      console.warn(
        `Player with ID ${playerId} was found but not deleted from waitingSavePlayer.`
      );
      // You might want to rollback the insert to primary here, or log for manual intervention
      // For simplicity, we'll proceed, but a transaction might be considered for atomicity.
    }

    return res.status(200).json({
      message: "Player approved and successfully moved to primary collection.",
      primaryRecordId: primaryResult.insertedId,
    });
  } catch (error) {
    console.error("Backend error in /api/admin/approvePlayer:", error);
    // Consider more granular error handling, e.g., if insert succeeds but delete fails.
    return res.status(500).json({ message: "Internal server error." });
  }
}
