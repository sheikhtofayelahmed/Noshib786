import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ message: "agentId is required." });
    }

    const agentData = await db.collection("notes").findOne({ agentId });

    return res.status(200).json({ notes: agentData?.notes || [] });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
