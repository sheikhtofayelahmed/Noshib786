import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  const serverKey = req.headers["x-server-key"];
  const secret = process.env.INTERNAL_API_SECRET;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (serverKey !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const collection = db.collection("gameStatus");

    const now = new Date();

    const result = await collection.updateMany(
      {
        isGameOn: true,
        targetDateTime: { $lt: now }, // use Date object, not string
      },
      {
        $set: { isGameOn: false },
      }
    );

    return res.status(200).json({ updatedGames: result.modifiedCount });
  } catch (err) {
    console.error("Error in checkGameStatus:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
