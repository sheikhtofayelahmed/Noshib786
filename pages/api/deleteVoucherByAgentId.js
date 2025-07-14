// pages/api/deleteAgentVouchers.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { agentId } = req.query;

  if (!agentId) {
    return res.status(400).json({ message: "Missing agentId in query" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const result = await db.collection("playersInput").deleteMany({ agentId });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        message: `✅ Deleted ${result.deletedCount} vouchers.`,
        count: result.deletedCount,
      });
    } else {
      return res.status(404).json({
        message: "No vouchers found for this agentId.",
        count: 0,
      });
    }
  } catch (err) {
    console.error("Deletion error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}
