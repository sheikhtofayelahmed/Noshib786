import clientPromise from "lib/mongodb";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { masterAgentId, password, name } = req.body;

  // Basic validation
  if (!masterAgentId || !password || !name) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Check for duplicate masterAgentId
    const existing = await db
      .collection("masterAgents")
      .findOne({ masterAgentId: masterAgentId.trim() });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Master Agent ID already exists" });
    }

    // Hash the password before storing
    // const hashedPassword = await bcrypt.hash(password.trim(), 10); // 10 salt rounds

    const newMasterAgent = {
      masterAgentId: masterAgentId.trim(),
      password: password.trim(),
      name: name.trim(),
    };

    await db.collection("masterAgents").insertOne(newMasterAgent);

    return res
      .status(201)
      .json({ message: "Agent added", masterAgent: newMasterAgent });
  } catch (error) {
    console.error("Add agent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
