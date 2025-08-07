import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { gamerId } = req.query;

  if (!gamerId) {
    return res.status(400).json({ message: "Missing gamerId in query" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Step 1: Find gamer by gamerId
    const gamer = await db.collection("gamers").findOne({ gamerId });

    if (!gamer || !gamer.agentId) {
      return res.status(404).json({ message: "Gamer or associated agent not found" });
    }

    // Step 2: Use agentId from gamer to find agent info
    const agent = await db.collection("agents").findOne({ agentId: gamer.agentId });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.status(200).json({ agent });
  } catch (error) {
    console.error("Error fetching agent by gamerId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}