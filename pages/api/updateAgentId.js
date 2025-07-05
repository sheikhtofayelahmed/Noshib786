import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { oldAgentId, newAgentId } = req.body;

//   if (!oldAgentId || !newAgentId) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const result = await db
      .collection("playersInput")
      .updateMany({ agentId: "NAJIM TAHLIA" }, { $set: { agentId: "NAJIMTAHLIA" } });

    return res.status(200).json({
      message: "Agent ID updated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
