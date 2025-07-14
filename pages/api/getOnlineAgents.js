import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const oneMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);

    const onlineAgents = await db
      .collection("agents")
      .find({ lastSeen: { $gte: oneMinutesAgo } })
      .toArray();

    return res.status(200).json({ agents: onlineAgents });
  } catch (error) {
    console.error("Get online agents error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
