// pages/api/get-visits.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const allVisits = await db.collection("visitorStats").find({}).toArray();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyVisits = allVisits.filter(
      (v) => new Date(v.timestamp) >= oneWeekAgo
    );
    const uniqueLifetimeIPs = new Set(allVisits.map((v) => v.ip));
    const uniqueWeeklyIPs = new Set(weeklyVisits.map((v) => v.ip));

    res.status(200).json({
      totalVisits: allVisits.length,
      uniqueVisitors: uniqueLifetimeIPs.size,
      weeklyVisits: weeklyVisits.length,
      weeklyUniqueVisitors: uniqueWeeklyIPs.size,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ message: "Failed to fetch visit stats" });
  }
}
