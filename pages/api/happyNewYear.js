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
        $project: {
          number: "$input.num", // assuming the object has a 'num' field
          strAmount: {
            $cond: [{ $ifNull: ["$input.str", false] }, "$input.str", 0],
          },
          rumbleAmount: {
            $cond: [{ $ifNull: ["$input.rumble", false] }, "$input.rumble", 0],
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
