// pages/api/admin/rejectPlayer.js
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed." });
  }

  const { playerId } = req.body; // Expecting the _id of the player to reject

  if (!playerId) {
    return res
      .status(400)
      .json({ message: "Player ID is required for rejection." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Update the status in the waiting collection
    const result = await db.collection("waitingSavePlayer").updateOne(
      { _id: new ObjectId(playerId), status: "pending" }, // Only reject pending ones
      {
        $set: {
          status: "rejected",
          processedAt: new Date(),
          // processedBy: 'admin_user_id', // Add if you have admin authentication
        },
      }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Pending player not found or already processed." });
    }

    return res.status(200).json({
      message: "Player rejected successfully.",
    });
  } catch (error) {
    console.error("Backend error in /api/admin/rejectPlayer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
