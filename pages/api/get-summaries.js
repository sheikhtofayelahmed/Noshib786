import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const summaries = await db
      .collection("summaries")
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    res.status(200).json({ success: true, summaries });
  } catch (error) {
    console.error("Fetch error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch summaries" });
  }
}
