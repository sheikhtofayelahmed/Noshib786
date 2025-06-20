// pages/api/addAgent.js or src/app/api/addAgent/route.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    agentId,
    password,
    name,
    percentages,
    cPercentages,
    subAgents,
    expense,
    tenPercent,
    expenseAmt,
    tenPercentAmt,
  } = req.body;
  if (
    !agentId ||
    !password ||
    !name ||
    !percentages ||
    !cPercentages ||
    !subAgents
  ) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Check duplicate agentId
    const existingAgent = await db.collection("agents").findOne({ agentId });
    if (existingAgent) {
      return res.status(409).json({ message: "Agent ID already exists" });
    }
    const cleanedSubAgents = subAgents.filter((n) => n.trim() !== "");
    const hasSubAgents = cleanedSubAgents.length > 0;
    const newAgent = {
      agentId,
      password,
      name,
      percentages,
      cPercentages,
      subAgents,
      expense,
      tenPercent,
      expenseAmt,
      tenPercentAmt,
      hasSubAgents,
      active: true,
    };
    await db.collection("agents").insertOne(newAgent);

    return res.status(201).json({ message: "Agent added", agent: newAgent });
  } catch (error) {
    console.error("Add agent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
