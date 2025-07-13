// pages/api/deleteAgentVouchers.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { agentId } = req.query;

  if (!agentId) return res.status(400).json({ message: "Missing agentId" });

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db.collection("playersInput").deleteMany({ agentId });

    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ message: `Deleted ${result.deletedCount} vouchers.` });
    } else {
      res.status(404).json({ message: "No vouchers found for agentId." });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
