import clientPromise from "lib/mongodb"; // your MongoDB connection utility

import { serialize } from "cookie";

export default async function handler(req, res) {
  try {
    const { agentId, password } = req.body; // get data from POST body

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery"); // specify your DB name

    const agent = await db
      .collection("agents")
      .findOne({ agentId, active: true });

    if (!agent) {
      return res.status(401).json({ error: "Agent not found or inactive" });
    }

    // For now, plain text compare (better to hash passwords later)
    if (password !== agent.password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const cookie = serialize("agent-auth", agentId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1, // 1 hours
      secure: process.env.NODE_ENV === "production",
    });

    res.setHeader("Set-Cookie", cookie);
    // Success: return agent info without password
    return res.status(200).json({
      agentId: agent.agentId,
      name: agent.name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
