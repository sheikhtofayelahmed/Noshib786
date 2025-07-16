import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Fetch and sort all records by createdAt descending
    const allWins = await db
      .collection("winning_numbers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (!allWins.length) {
      return res.status(404).json({ error: "No winning data found" });
    }

    const formatted = allWins.map((entry) => ({
      threeUp: entry.threeUp || "",
      downGame: entry.downGame || "",
      gameDate: entry.gameDate || "",
      winStatus: typeof entry.winStatus === "boolean" ? entry.winStatus : false,
      createdAt: entry.createdAt || null,
    }));

    return res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Error fetching all win data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
