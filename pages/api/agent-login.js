import clientPromise from "lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      agentId,
      password,
      loginAs = "agent",
      subAgentId,
      subAgentPassword,
    } = req.body;

    if (!agentId || !password) {
      return res.status(400).json({ error: "Missing agentId or password" });
    }

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const agent = await db
      .collection("agents")
      .findOne({ agentId, active: true });

    if (!agent) {
      return res.status(401).json({ error: "Agent not found or inactive" });
    }

    if (password !== agent.password) {
      return res.status(401).json({ error: "Incorrect agent password" });
    }

    if (loginAs === "subagent") {
      if (!agent.hasSubAgents || !Array.isArray(agent.subAgents)) {
        return res.status(403).json({ error: "Agent has no subagents" });
      }

      if (!subAgentId || !subAgentPassword) {
        return res.status(400).json({ error: "Missing subagent credentials" });
      }

      const subagent = agent.subAgents.find((sa) => sa.id === subAgentId);

      if (!subagent || subagent.password !== subAgentPassword) {
        return res.status(401).json({ error: "Invalid subagent credentials" });
      }
    }

    // Build cookie value (optional enhancement)
    const authValue = `${loginAs}:${agentId}`;
    const cookie = serialize("agent-auth", authValue, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 hour
      secure: process.env.NODE_ENV === "production",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      agentId: agent.agentId,
      name: agent.name,
      loginAs,
      subAgentId: loginAs === "subagent" ? subAgentId : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
