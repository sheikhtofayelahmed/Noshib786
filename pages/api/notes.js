// pages/api/agent-notes.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const { agentId, note } = req.body;

    if (!agentId || typeof note !== "string" || note.trim() === "") {
      return res.status(400).json({ message: "Invalid input" });
    }

    await db.collection("notes").updateOne(
      { agentId },
      {
        $push: {
          notes: {
            text: note,
            time: new Date(),
          },
        },
      },
      { upsert: true }
    );

    return res.status(200).json({ message: "Note added successfully." });
  } catch (error) {
    console.error("Error adding note:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
