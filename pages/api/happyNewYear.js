// pages/api/analyzeTopNumbers.js

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
          splitInput: { $split: ["$input", "."] },
        },
      },
      {
        $project: {
          number: { $arrayElemAt: ["$splitInput", 0] },
          strAmount: {
            $cond: [
              { $gte: [{ $size: "$splitInput" }, 2] },
              { $toInt: { $arrayElemAt: ["$splitInput", 1] } },
              0,
            ],
          },
          rumbleAmount: {
            $cond: [
              { $gte: [{ $size: "$splitInput" }, 3] },
              { $toInt: { $arrayElemAt: ["$splitInput", 2] } },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$number",
          totalStr: { $sum: "$strAmount" },
          totalRumble: { $sum: "$rumbleAmount" },
        },
      },
      { $sort: { totalStr: -1 } },
    ]);

    const result = await cursor.toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing numbers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
