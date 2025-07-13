import clientPromise from "lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  try {
    const { agentId, password, loginAs = "agent", subAgentId } = req.body;

    const client = await clientPromise;
    const db = client.db("noshib786");

    // Find the main agent first
    const agent = await db
      .collection("agents")
      .findOne({ agentId, active: true });

    if (!agent) {
      return res.status(401).json({ error: "Agent not found or inactive" });
    }

    if (password !== agent.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    if (loginAs === "subagent") {
      if (!agent.hasSubAgents) {
        return res.status(403).json({ error: "This agent has no subagents" });
      }
      if (!subAgentId || !agent.subAgents.includes(subAgentId)) {
        return res.status(403).json({ error: "Invalid or missing subAgentId" });
      }
      // Optionally: fetch subagent info from db if you store more details
    }

    // Set cookie as before, you could also add loginAs info if you want
    const cookie = serialize("agent-auth", agentId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1,
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
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
