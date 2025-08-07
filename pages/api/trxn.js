import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("noshib786");
  const collection = db.collection("trxn");

  if (req.method === "POST") {
    const { trxnNumber, amount, method, gamerId } = req.body;

    if (!trxnNumber || !amount || !gamerId || !gamerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTrxn = {
      trxnNumber,
      amount: parseFloat(amount),
      gamerId,
      method,
      date: new Date().toISOString(),
    };

    const result = await collection.insertOne(newTrxn);
    return res
      .status(201)
      .json({ success: true, insertedId: result.insertedId });
  }

  if (req.method === "GET") {
    const { gamerId } = req.query;

    if (!gamerId) {
      return res.status(400).json({ error: "Missing gamerId" });
    }

    const trxns = await collection
      .find({ gamerId })
      .sort({ date: -1 })
      .toArray();
    return res.status(200).json(trxns);
  }

  res.status(405).end(); // Method Not Allowed
}
