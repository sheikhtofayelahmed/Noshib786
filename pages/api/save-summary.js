import clientPromise from "lib/mongodb"; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db(); // or db("your_db_name") if you need to specify
    const collection = db.collection("game_summaries");

    const { agentId, date, summary } = req.body;

    const existing = await collection.findOne({ agentId, date });

    if (existing) {
      return res.status(200).json({ message: "Already exists" });
    }

    await collection.insertOne({
      agentId,
      date,
      ...summary,
      uploadedAt: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to save summary", err);
    res.status(500).json({ error: "Server error" });
  }
}
