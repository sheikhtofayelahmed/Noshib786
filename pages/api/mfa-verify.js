import { authenticator } from "otplib";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, mfaCode } = req.body;

    if (!username || !mfaCode) {
      return res.status(400).json({
        error: "Username and MFA code are required",
      });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");
    const admin = await db.collection("admins").findOne({ username });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (!admin.mfaEnabled || !admin.mfaSecret) {
      return res
        .status(403)
        .json({ error: "MFA not enabled for this account" });
    }

    const isValid = authenticator.check(mfaCode, admin.mfaSecret);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    // Set cookie using raw headers
    res.setHeader(
      "Set-Cookie",
      `admin-auth=true; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=3600000000000000000${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return res.status(200).json({ message: "MFA verification successful" });
  } catch (err) {
    console.error("MFA verification API error:", err);
    return res.status(500).json({
      error: "Server error during MFA verification",
    });
  }
}
