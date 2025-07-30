import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const collection = db.collection("tips");

    if (req.method === "GET") {
      const tipsDoc = await collection.findOne({});
      return res.status(200).json(tipsDoc?.tips || []);
    }

    if (req.method === "POST") {
      const { tips } = req.body;
      if (!Array.isArray(tips)) {
        return res.status(400).json({ error: "Invalid tips data" });
      }

      // Store tips in a single document
      await collection.updateOne({}, { $set: { tips } }, { upsert: true });
      return res.status(200).json({ message: "Tips saved" });
    }

    // If method is not GET or POST
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Tips API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
