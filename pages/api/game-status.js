import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("noshib786");
  const collection = db.collection("gameStatus");

  if (req.method === "GET") {
    try {
      const statusDoc = await collection.findOne({});

      res.status(200).json({
        isGameOn: statusDoc?.isGameOn || false,
        targetDateTime: statusDoc?.targetDateTime || null,
        upcomingEndTime: statusDoc?.upcomingEndTime || null,
      });
    } catch (error) {
      console.error("GET error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  else if (req.method === "POST") {
    try {
      const { isGameOn, targetDateTime } = req.body;

      const updateFields = {};

      if (typeof isGameOn === "boolean") {
        updateFields.isGameOn = isGameOn;
      }

      if (targetDateTime !== undefined) {
        const parsedTime = new Date(targetDateTime);
        if (isNaN(parsedTime.getTime())) {
          return res.status(400).json({ error: "Invalid targetDateTime value" });
        }

        updateFields.targetDateTime = parsedTime.toISOString();

        // 👇 Automatically calculate upcomingEndTime (target + 30 minutes)
        const upcomingEnd = new Date(parsedTime.getTime() + 30 * 60 * 1000);
        updateFields.upcomingEndTime = upcomingEnd.toISOString();
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      await collection.updateOne({}, { $set: updateFields }, { upsert: true });

      // ✅ Return updated data
      const updatedDoc = await collection.findOne({});

      res.status(200).json({
        isGameOn: updatedDoc?.isGameOn || false,
        targetDateTime: updatedDoc?.targetDateTime || null,
        upcomingEndTime: updatedDoc?.upcomingEndTime || null,
      });
    } catch (error) {
      console.error("POST error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}