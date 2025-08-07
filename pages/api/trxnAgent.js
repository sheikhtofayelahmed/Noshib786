import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Method Not Allowed
  }

  const client = await clientPromise;
  const db = client.db("noshib786");
  const collection = db.collection("trxn");

  const { gamerId } = req.query;

  if (!gamerId) {
    return res.status(400).json({ error: "Missing gamerId" });
  }

  try {
    const latestTrxn = await collection
      .find({ gamerId })
      .sort({ date: -1 })
      .limit(1)
      .toArray();

    return res.status(200).json(latestTrxn[0] || null);
  } catch (error) {
    console.error("Error fetching latest transaction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
