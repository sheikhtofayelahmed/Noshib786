// pages/api/listAgentIds.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const agentIds = await db.collection("playersInput").distinct("agentId");

    res.status(200).json({ agentIds });
  } catch (err) {
    console.error("Error fetching agentIds:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
