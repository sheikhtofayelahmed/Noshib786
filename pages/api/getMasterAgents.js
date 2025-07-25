import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Fetch all agents
    const masterAgents = await db.collection("masterAgents").find({}).toArray();

    res.status(200).json({ masterAgents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
