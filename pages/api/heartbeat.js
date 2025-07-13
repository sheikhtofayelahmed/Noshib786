import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "Missing agentId" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db
      .collection("agents")
      .updateOne({ agentId }, { $set: { lastSeen: new Date() } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Agent not found" });
    }

    return res.status(200).json({ message: "Heartbeat updated" });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
