import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    oldAgentId,
    agentId,
    name,
    password,
    percentages,
    subAgents,
    cPercentages,
    expense,
    tenPercent,
  } = req.body;
  console.log(expense, tenPercent);
  // Basic validation
  if (
    !oldAgentId ||
    !agentId ||
    !name ||
    !password ||
    typeof percentages !== "object"
  ) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // If agentId changed, check if new one already exists
    if (agentId !== oldAgentId) {
      const existing = await db.collection("agents").findOne({ agentId });
      if (existing) {
        return res.status(409).json({ message: "Agent ID already exists." });
      }
    }
    const cleanedSubAgents = subAgents.filter((n) => n.trim() !== "");
    const hasSubAgents = cleanedSubAgents.length > 0;
    // Update the agent
    const result = await db.collection("agents").updateOne(
      { agentId: oldAgentId },
      {
        $set: {
          agentId,
          name,
          password,
          percentages,
          subAgents,

          cPercentages,
          expense,
          tenPercent,
          hasSubAgents,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Agent not found." });
    }

    return res.status(200).json({ message: "Agent updated successfully." });
  } catch (err) {
    console.error("Update agent error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
