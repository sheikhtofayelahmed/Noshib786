import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Sort by createdAt in descending order
    const latest = await db
      .collection("winning_numbers")
      .find({})
      .sort({ createdAt: -1 }) // Newest based on timestamp
      .limit(1)
      .toArray();

    if (!latest.length) {
      return res.status(404).json({ error: "No winning data found" });
    }

    const { threeUp, downGame, gameDate, winStatus, createdAt } = latest[0];

    return res.status(200).json({
      threeUp: threeUp || "",
      downGame: downGame || "",
      gameDate: gameDate || "",
      winStatus: typeof winStatus === "boolean" ? winStatus : false,
      createdAt: createdAt || null,
    });
  } catch (error) {
    console.error("Error fetching latest win data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
