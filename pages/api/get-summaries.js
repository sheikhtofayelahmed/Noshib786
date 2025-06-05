import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const collection = db.collection("game_summaries");

    // Fetch all summaries - you can add filters/pagination later
    const summaries = await collection.find({}).toArray();

    res.status(200).json({ success: true, summaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
