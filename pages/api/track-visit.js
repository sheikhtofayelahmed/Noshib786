// pages/api/track-visit.js
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const referrer = req.headers.referer || "Direct";
    const pathname = req.body.pathname || "/";

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Avoid duplicate logs by same IP + pathname in short time window
    const recentVisit = await db.collection("visitorStats").findOne({
      ip,
      pathname,
      timestamp: { $gte: fiveMinutesAgo },
    });

    if (recentVisit) {
      return res.status(200).json({ message: "Duplicate visit skipped" });
    }

    const visit = {
      ip,
      userAgent,
      referrer,
      pathname,
      timestamp: now,
    };

    await db.collection("visitorStats").insertOne(visit);

    res.status(200).json({ message: "Visit recorded" });
  } catch (error) {
    console.error("Visitor tracking failed:", error);
    res.status(500).json({ message: "Failed to track visit" });
  }
}
