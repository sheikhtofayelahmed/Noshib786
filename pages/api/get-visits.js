// pages/api/get-visits.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const visits = await db
      .collection("visitorStats")
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    res.status(200).json({ visits });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch visits" });
  }
}
