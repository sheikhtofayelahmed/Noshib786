import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("game_summaries");

    const result = await collection.deleteMany({}); // delete all documents

    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Failed to delete summaries", error);
    res.status(500).json({ error: "Server error" });
  }
}
