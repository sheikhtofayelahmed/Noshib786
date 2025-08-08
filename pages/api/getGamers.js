// Example for /api/getgamers.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { agentId } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // ❗ Only fetch active gamers
    const gamers = await db.collection("gamers").find({ agentId }).toArray();
    res.status(200).json({ gamers });
  } catch (error) {
    console.error("Error fetching gamers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
