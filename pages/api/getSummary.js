// pages/api/getSummary.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { agentId, date } = req.query;

  if (!agentId || !date) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const collection = db.collection("game_summaries");

    const summary = await collection.findOne({ agentId, date });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found" });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    res.status(500).json({ error: "Server error" });
  }
}
