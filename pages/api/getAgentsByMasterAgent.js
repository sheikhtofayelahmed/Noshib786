import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { masterAgent } = req.body;

    if (!masterAgent || masterAgent.trim() === "") {
      return res.status(400).json({ message: "Missing Master Agent" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    // Fetch only active agents assigned to the given masterAgent
    const agents = await db
      .collection("agents")
      .find({ active: true, masterAgent: masterAgent.trim() })
      .toArray();

    res.status(200).json({ agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
