// pages/api/admin/getPendingPlayers.js
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method Not Allowed. This endpoint only accepts GET requests.",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Find all documents in 'waitingSavePlayer' where status is 'pending'
    const pendingPlayers = await db
      .collection("waitingSavePlayer")
      .find({ status: "pending" }) // Filter by status
      .sort({ submissionTime: 1 }) // Sort by oldest first, so admins process chronologically
      .toArray();

    // Send the array of pending players
    return res.status(200).json(pendingPlayers);
  } catch (error) {
    console.error("Backend error in /api/admin/getPendingPlayers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
