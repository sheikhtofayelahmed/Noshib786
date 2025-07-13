import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ message: "Missing agentId" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const result = await db.collection("agents").deleteOne({ agentId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: `Agent with ID "${agentId}" not found` });
    }

    return res
      .status(200)
      .json({ message: `Agent with ID "${agentId}" deleted successfully` });
  } catch (error) {
    console.error("Delete agent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
