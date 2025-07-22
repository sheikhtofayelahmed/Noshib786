import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agentId, gameDate, threeUp, downGame } = req.body;

  if (!agentId || !gameDate || !threeUp || !downGame) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const gameKey = `${gameDate} ${threeUp} ${downGame}`;

    console.log(gameKey)
    const doc = await db
      .collection("history")
      .findOne({ [gameKey]: { $exists: true } });
    const players =
      doc?.[gameKey]?.filter((player) => player.agentId === agentId) || [];
    return res.status(200).json({ players });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
