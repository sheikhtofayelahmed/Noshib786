// pages/api/moveGamerToPlayer.js

import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { gamerId } = req.body;

  if (!gamerId) {
    return res.status(400).json({ message: "gamerId is required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Find all documents in gamersInput with this gamerId
    const docs = await db.collection("gamersInput").find({ gamerId }).toArray();

    if (docs.length === 0) {
      return res
        .status(404)
        .json({ message: "No documents found for this gamerId" });
    }

    // Insert all docs into playersInput
    // Optionally remove _id so MongoDB generates new ones
    const docsToInsert = docs.map(({ _id, ...rest }) => rest);

    const insertResult = await db
      .collection("playersInput")
      .insertMany(docsToInsert);

    // Remove from gamersInput (to "move" not just copy)
    await db.collection("gamersInput").deleteMany({ gamerId });

    return res.status(200).json({
      message: `Successfully moved ${insertResult.insertedCount} documents`,
    });
  } catch (err) {
    console.error("Error moving gamer data:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
