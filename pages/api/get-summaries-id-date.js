// /pages/api/get-summary.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId, gameDate } = req.query;

  if (!agentId || !gameDate) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const summary = await db
      .collection("summaries")
      .findOne({ agentId, gameDate });

    if (!summary) {
      return res.status(404).json({ message: "Summary not found" });
    }

    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
