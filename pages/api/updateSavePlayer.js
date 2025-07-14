import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb"; // adjust if your MongoDB connection is named differently

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { _id, voucher, agentId, name, SAId, data, amountPlayed } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const collection = db.collection("playersInput");

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) }, // target by _id
      {
        $set: {
          voucher,
          agentId,
          name,
          SAId,
          entries: data,
          amountPlayed,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Player updated successfully." });
    } else {
      res.status(404).json({ message: "Voucher not found." });
    }
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
