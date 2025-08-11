// pages/api/moveGamerToPlayer.js

import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { gamerId, voucher } = req.body;

  if (!gamerId || !voucher) {
    return res
      .status(400)
      .json({ message: "gamerId and voucher are required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const gameStatus = await db
      .collection("gameStatus")
      .findOne({}, { sort: { updatedAt: -1 } });

    if (
      !gameStatus ||
      !gameStatus.isGameOn ||
      (gameStatus.targetDateTime &&
        serverTime > new Date(gameStatus.targetDateTime))
    ) {
      return res.status(403).json({
        message: "⛔ Game is not active or time is up. Submission blocked.",
      });
    }
    // Find the specific document to move
    const doc = await db
      .collection("gamersInput")
      .findOne({ gamerId, voucher });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Insert into playersInput (omit _id to avoid conflict)
    const { _id, ...docToInsert } = doc;
    await db.collection("playersInput").insertOne(docToInsert);

    // Delete the same document from gamersInput
    await db.collection("gamersInput").deleteOne({ _id });

    return res.status(200).json({ message: "Successfully moved 1 document" });
  } catch (err) {
    console.error("Error moving gamer data:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
