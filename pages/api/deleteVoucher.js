// pages/api/deleteVoucher.js
import { ObjectId } from "mongodb";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const { _id } = req.body;

  if (!_id) return res.status(400).json({ message: "Missing _id" });

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const result = await db
      .collection("playersInput")
      .deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Voucher deleted." });
    } else {
      res.status(404).json({ message: "Voucher not found." });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
