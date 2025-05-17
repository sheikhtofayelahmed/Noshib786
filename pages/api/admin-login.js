import bcrypt from "bcrypt";
import clientPromise from "/lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const admin = await db.collection("admins").findOne({ username: "admin" });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Set auth cookie manually using Node.js 'res'
    const cookie = serialize("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
