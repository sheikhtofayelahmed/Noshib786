import clientPromise from "lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { agentId, password } = req.body;

    if (!agentId || !password) {
      return res.status(400).json({ error: "Missing agentId or password" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    const agent = await db
      .collection("agents")
      .findOne({ agentId, active: true });

    if (!agent) {
      return res.status(401).json({ error: "Agent not found or inactive" });
    }

    if (password !== agent.password) {
      return res.status(401).json({ error: "Incorrect agent password" });
    }

    // Set cookie with agent ID
    const cookie = serialize("agent-auth", agentId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      agentId: agent.agentId,
      name: agent.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
