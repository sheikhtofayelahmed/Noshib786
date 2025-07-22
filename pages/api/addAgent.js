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
    expenseAmt,
    tenPercent,
    tenPercentAmt,
    masterAgent = "Admin", // Optional field with default
  } = req.body;

  // Basic validation
  if (
    !agentId ||
    !password ||
    !name ||
    typeof percentages !== "object" ||
    typeof cPercentages !== "object" ||
    !Array.isArray(subAgents)
  ) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Check for duplicate agentId
    const existing = await db
      .collection("agents")
      .findOne({ agentId: agentId.trim() });
    if (existing) {
      return res.status(409).json({ message: "Agent ID already exists" });
    }

    // Clean and validate subAgents
    const cleanedSubAgents = subAgents
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
      }));

    const hasSubAgents = cleanedSubAgents.length > 0;

    // Construct agent document
    const newAgent = {
      agentId: agentId.trim(),
      password: password.trim(),
      name: name.trim(),
      percentages,
      cPercentages,
      subAgents: cleanedSubAgents,
      hasSubAgents,
      expense,
      expenseAmt,
      tenPercent,
      tenPercentAmt,
      active: true,
      lastSeen: new Date(),
      masterAgent: masterAgent.trim(), // Add this field
    };

    await db.collection("agents").insertOne(newAgent);

    return res.status(201).json({ message: "Agent added", agent: newAgent });
  } catch (error) {
    console.error("Add agent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
