import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId, percentage } = req.body;

  if (!agentId || typeof percentage !== "object") {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Update agent's percentage field
    const updated = await db
      .collection("agents")
      .updateOne({ agentId }, { $set: { percentage } });

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: "Agent not found or no change" });
    }

    return res
      .status(200)
      .json({ message: "Percentages updated successfully" });
  } catch (error) {
    console.error("Update percentages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
