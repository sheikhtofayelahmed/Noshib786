// pages/api/deleteAllGamersInput.js

import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const deleteResult = await db.collection("gamersInput").deleteMany({});

    return res.status(200).json({
      message: `Deleted ${deleteResult.deletedCount} documents from gamersInput`,
    });
  } catch (err) {
    console.error("Error deleting gamersInput:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
