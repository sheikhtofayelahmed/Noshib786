import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("thai-agent-lottery");

  if (req.method === "GET") {
    try {
      const statusDoc = await db.collection("gameStatus").findOne({});
      res.status(200).json({
        isGameOn: statusDoc?.isGameOn || false,
        targetDateTime: statusDoc?.targetDateTime || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    try {
      const { isGameOn, targetDateTime } = req.body;

      const updateFields = {};

      if (typeof isGameOn === "boolean") {
        updateFields.isGameOn = isGameOn;
      }

      if (targetDateTime !== undefined) {
        if (isNaN(Date.parse(targetDateTime))) {
          return res
            .status(400)
            .json({ error: "Invalid targetDateTime value" });
        }
        updateFields.targetDateTime = targetDateTime;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      await db
        .collection("gameStatus")
        .updateOne({}, { $set: updateFields }, { upsert: true });

      res.status(200).json({
        isGameOn: updateFields.isGameOn ?? false,
        targetDateTime: updateFields.targetDateTime ?? null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
