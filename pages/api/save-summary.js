import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { agentId, gameDate, cal } = req.body;
  if (!agentId || !gameDate || !cal) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    // Separate joma and other calculation fields
    const { joma, ...otherCalFields } = cal;

    // Prepare $set fields under calculation
    const calFields = {};
    for (const key in otherCalFields) {
      calFields[`calculation.${key}`] = otherCalFields[key];
    }

    // Update the document
    const result = await db.collection("summaries").updateOne(
      { agentId, gameDate },
      {
        $set: calFields,
        $push: { "calculation.joma": joma },
        $currentDate: { lastUpdated: true }, // ⏱️ MongoDB sets this to ISODate
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Calculation and joma updated" });
  } catch (error) {
    console.error("Save Summary Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
