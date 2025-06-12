import clientPromise from "lib/mongodb"; // adjust the path if needed

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const collection = db.collection("game_summaries");

    const { agentId, date, summary, joma } = req.body;

    // joma must be an object: { joma, jomaDate }
    if (
      !agentId ||
      !date ||
      !summary ||
      !joma ||
      typeof joma.joma !== "number" ||
      !joma.jomaDate
    ) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const jomaAmount = joma.joma;
    const jomaDate = joma.jomaDate;

    // Check for existing entry
    const existing = await collection.findOne({ agentId, date });

    if (!existing) {
      // First time submission → insert everything
      await collection.insertOne({
        agentId,
        date,
        summary,
        joma: [{ amount: jomaAmount, date: jomaDate }],
        uploadedAt: new Date(),
      });

      return res.status(200).json({ success: true, message: "Inserted" });
    }

    // If already exists → append to joma array, don't change summary
    await collection.updateOne(
      { agentId, date },
      {
        $push: {
          joma: { amount: jomaAmount, date: jomaDate },
        },
      }
    );

    return res.status(200).json({ success: true, message: "Updated" });
  } catch (err) {
    console.error("❌ Failed to save/update summary", err);
    res.status(500).json({ error: "Server error" });
  }
}
