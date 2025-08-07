// pages/api/deleteAgentVouchers.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { gamerId } = req.query;
  if (!gamerId) {
    return res.status(400).json({ message: "Missing gamerId in query" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db.collection("gamersInput").deleteMany({ gamerId });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        message: `✅ Deleted ${result.deletedCount} vouchers.`,
        count: result.deletedCount,
      });
    } else {
      return res.status(404).json({
        message: "No vouchers found for this gamerId.",
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
