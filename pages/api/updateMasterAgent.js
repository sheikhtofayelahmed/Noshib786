import clientPromise from "../../lib/mongodb";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { oldMasterAgentId, masterAgentId, name, password } = req.body;

    // Validate required fields
    if (!oldMasterAgentId || !masterAgentId || !name || !password) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    // Check for duplicate agentId if it's changed
    if (oldMasterAgentId !== masterAgentId) {
      const exists = await db
        .collection("masterAgents")
        .findOne({ masterAgentId });
      if (exists) {
        return res
          .status(409)
          .json({ message: "Master Agent ID already exists." });
      }
    }

    // Hash the new password before updating
    // const hashedPassword = await bcrypt.hash(password.trim(), 10); // 10 salt rounds

    // Update agent document
    const result = await db.collection("masterAgents").updateOne(
      { masterAgentId: oldMasterAgentId },
      {
        $set: {
          masterAgentId: masterAgentId.trim(),
          name: name.trim(),
          password: password.trim(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Master Agent not found." });
    }

    return res
      .status(200)
      .json({ message: "✅ Master Agent updated successfully." });
  } catch (err) {
    console.error("Update Master Agent error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
