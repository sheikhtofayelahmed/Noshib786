// pages/api/next-game.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("noshib786");
  const collection = db.collection("nextGame");

  if (req.method === "GET") {
    const doc = await collection.findOne({});
    return res.status(200).json({ nextGame: doc?.nextGame || "" });
  }

  if (req.method === "POST") {
    const { nextGame } = req.body;
    if (!nextGame)
      return res.status(400).json({ error: "nextGame is required" });

    await collection.updateOne({}, { $set: { nextGame } }, { upsert: true });

    return res.status(200).json({ message: "Updated successfully", nextGame });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
