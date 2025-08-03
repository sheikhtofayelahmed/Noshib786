import clientPromise from "lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { gamerId, password } = req.body;

    if (!gamerId || !password) {
      return res.status(400).json({ error: "Missing gamerId or password" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    const gamer = await db.collection("gamers").findOne({ gamerId });

    if (!gamer) {
      return res.status(401).json({ error: "gamer not found or inactive" });
    }

    if (password !== gamer.password) {
      return res.status(401).json({ error: "Incorrect gamer password" });
    }

    // Set cookie with gamer ID
    const cookie = serialize("gamer-auth", gamerId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({
      gamerId: gamer.gamerId,
      name: gamer.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
