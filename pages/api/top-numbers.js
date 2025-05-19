import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");

    const cursor = db.collection("playersInput").aggregate([
      { $unwind: "$entries" },
      {
        $project: {
          input: "$entries.input",
        },
      },
      {
        $addFields: {
          splitInput: { $split: ["$input", "="] },
        },
      },
      {
        $project: {
          number: { $arrayElemAt: ["$splitInput", 0] },
          amounts: {
            $map: {
              input: { $slice: ["$splitInput", 1, 10] }, // supports 1 or 2 amounts
              as: "amt",
              in: { $toInt: "$$amt" },
            },
          },
        },
      },
      {
        $addFields: {
          totalAmount: { $sum: "$amounts" },
        },
      },
      {
        $group: {
          _id: "$number",
          totalPlayed: { $sum: "$totalAmount" },
        },
      },
      { $sort: { totalPlayed: -1 } },
      { $limit: 3 }, // Top most played number
    ]);

    const result = await cursor.toArray();
    res.status(200).json(result[0] || { message: "No data found" });
  } catch (error) {
    console.error("Error analyzing top number:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
