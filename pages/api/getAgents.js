// Example for /api/getAgents.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // ❗ Only fetch active agents
    const agents = await db
      .collection("agents")
      .find({ active: true })
      .toArray();

    res.status(200).json({ agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
