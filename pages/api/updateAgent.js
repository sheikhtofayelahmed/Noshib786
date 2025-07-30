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
    const db = client.db("noshib786");

    // Check for duplicate agentId if it's changed
    if (oldAgentId !== agentId) {
      const exists = await db.collection("agents").findOne({ agentId });
      if (exists) {
        return res.status(409).json({ message: "Agent ID already exists." });
      }
    }

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
