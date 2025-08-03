import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      oldGamerId,
      gamerId,
      name,
      password,
      // percentages,
      // cPercentages,
      // expense = false,
      // tenPercent = false,
      // expenseAmt = 0,
      // tenPercentAmt = 0,
    } = req.body;

    // Validate required fields
    if (!oldGamerId || !gamerId || !name || !password) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");

    // Check for duplicate gamerId if it's changed
    if (oldGamerId !== gamerId) {
      const exists = await db.collection("gamers").findOne({ gamerId });
      if (exists) {
        return res.status(409).json({ message: "gamer ID already exists." });
      }
    }

    // Update gamer document
    const result = await db.collection("gamers").updateOne(
      { gamerId: oldGamerId },
      {
        $set: {
          gamerId: gamerId.trim(),
          name: name.trim(),
          password: password.trim(),
          // percentages,
          // cPercentages,
          // expense,
          // expenseAmt,
          // tenPercent,
          // tenPercentAmt,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "gamer not found." });
    }

    return res.status(200).json({ message: "✅ gamer updated successfully." });
  } catch (err) {
    console.error("Update gamer error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
