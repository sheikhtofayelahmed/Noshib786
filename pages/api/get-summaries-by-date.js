import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { gameDate } = req.body;

  if (!gameDate) {
    return res.status(400).json({ message: "Missing gameDate field" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const summaries = await db
      .collection("summaries")
      .find({ gameDate })
      .toArray();

    if (!summaries.length) {
      return res.status(404).json({ message: "No summaries found" });
    }

    res.status(200).json({ success: true, summaries });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
