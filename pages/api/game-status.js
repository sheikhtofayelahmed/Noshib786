import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("thai-agent-lottery");

  if (req.method === "GET") {
    try {
      const statusDoc = await db.collection("gameStatus").findOne({});
      res.status(200).json({ isGameOn: statusDoc?.isGameOn || false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    try {
      const { isGameOn } = req.body;
      if (typeof isGameOn !== "boolean") {
        return res.status(400).json({ error: "Invalid isGameOn value" });
      }

      await db
        .collection("gameStatus")
        .updateOne({}, { $set: { isGameOn } }, { upsert: true });

      res.status(200).json({ message: "Game status updated", isGameOn });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
