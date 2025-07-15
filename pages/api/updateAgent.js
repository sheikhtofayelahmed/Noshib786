import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      oldAgentId,
      agentId,
      name,
      password,
      percentages,
      subAgents,
      cPercentages,
      expense = false,
      tenPercent = false,
      expenseAmt = 0,
      tenPercentAmt = 0,
    } = req.body;

    // Validate required fields
    if (
      !oldAgentId ||
      !agentId ||
      !name ||
      !password ||
      typeof percentages !== "object" ||
      typeof cPercentages !== "object"
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Check for duplicate agentId if it's changed
    if (oldAgentId !== agentId) {
      const exists = await db.collection("agents").findOne({ agentId });
      if (exists) {
        return res.status(409).json({ message: "Agent ID already exists." });
      }
    }

    // Clean subagents input
    const cleanedSubAgents = Array.isArray(subAgents)
      ? subAgents
          .filter(
            (sa) =>
              sa &&
              typeof sa === "object" &&
              typeof sa.id === "string" &&
              typeof sa.password === "string" &&
              sa.id.trim().length > 0 &&
              sa.password.trim().length > 0
          )
          .map((sa) => ({
            id: sa.id.trim(),
            password: sa.password.trim(),
          }))
      : [];

    const hasSubAgents = cleanedSubAgents.length > 0;

    // Update agent document
    const result = await db.collection("agents").updateOne(
      { agentId: oldAgentId },
      {
        $set: {
          agentId: agentId.trim(),
          name: name.trim(),
          password: password.trim(),
          percentages,
          cPercentages,
          subAgents: cleanedSubAgents,
          hasSubAgents,
          expense,
          expenseAmt,
          tenPercent,
          tenPercentAmt,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Agent not found." });
    }

    return res.status(200).json({ message: "✅ Agent updated successfully." });
  } catch (err) {
    console.error("Update agent error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
