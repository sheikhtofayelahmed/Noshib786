import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId } = req.body;
  if (!agentId) {
    return res.status(400).json({ message: "Missing agentId" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const players = await db
      .collection("waitingSavePlayer")
      .find({ agentId })
      .sort({ time: -1 })
      .toArray();

    return res.status(200).json({ players });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
