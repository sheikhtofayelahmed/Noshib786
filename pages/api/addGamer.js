import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    gamerId,
    password,
    agentId,
    // name,
    // percentages,
    // cPercentages,
    // expense,
    // expenseAmt,
    // tenPercent,
    // tenPercentAmt,
  } = req.body;

  // Basic validation
  if (
    !gamerId ||
    !password ||
    !agentId
    // !name
  ) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    // Check for duplicate gamerId
    const existing = await db
      .collection("gamers")
      .findOne({ gamerId: gamerId.trim() });
    if (existing) {
      return res.status(409).json({ message: "gamer ID already exists" });
    }

    // Construct gamer document
    const newGamer = {
      gamerId: gamerId.trim(),
      password: password.trim(),
      agentId: agentId.trim(),
      // name: name.trim(),
      // percentages,
      // cPercentages,
      // expense,
      // expenseAmt,
      // tenPercent,
      // tenPercentAmt,
      // active: true,
      // lastSeen: new Date(),
    };

    await db.collection("gamers").insertOne(newGamer);

    return res.status(201).json({ message: "gamer added", gamer: newGamer });
  } catch (error) {
    console.error("Add gamer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
