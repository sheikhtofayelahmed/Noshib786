import clientPromise from "lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { masterAgentId, password } = req.body;

    if (!masterAgentId || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    const masterAgent = await db
      .collection("masterAgents")
      .findOne({ masterAgentId });

    if (!masterAgent) {
      return res.status(404).json({ error: "Master Agent not found" });
    }

    if (password.trim() !== masterAgent.password.trim()) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Set masterAgentId cookie (accessible on client)
    const idCookie = serialize("masterAgentId", masterAgentId, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 3,
      path: "/",
      sameSite: "Lax",
    });

    // Set auth cookie (server only)
    const authCookie = serialize("masterAgent-auth", "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 3,
      path: "/",
      sameSite: "Lax",
    });

    res.setHeader("Set-Cookie", [idCookie, authCookie]);
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login API error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
}
