import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const win = await db.collection("winning_numbers").findOne({});

    if (!win) {
      return res.status(404).json({ error: "No winning data found" });
    }

    const { threeUp, downGame, date } = win;

    return res.status(200).json({
      threeUp: threeUp || "",
      downGame: downGame || "",
      date: date || "",
    });
  } catch (error) {
    console.error("Error fetching win data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
