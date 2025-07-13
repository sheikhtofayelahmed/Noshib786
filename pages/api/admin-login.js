// pages/api/admin-login.js (Pages Router API Route)
// This file handles the initial admin login, now with MFA integration,
// adapted for the Pages Router API route structure.

import clientPromise from "lib/mongodb"; // your MongoDB connection utility
import bcrypt from "bcrypt";
import { serialize } from "cookie"; // Required for manually setting the Set-Cookie header

// Define the handler function for this API route.
// In Pages Router API routes, the handler receives Node.js 'req' and 'res' objects.
export default async function handler(req, res) {
  // Ensure the request method is POST.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { password, username = "admin" } = req.body; // In Pages Router, body is directly on req

    const client = await clientPromise;
    const db = client.db("noshib786");
    const admin = await db.collection("admins").findOne({ username: username });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // --- MFA Logic Start ---
    // If MFA is enabled, we DO NOT set the auth cookie here.
    // Instead, we signal to the client that MFA verification is required.

    // if (admin.mfaEnabled && admin.mfaSecret) {
    //   // For Pages Router, return 202 status with a JSON response.
    //   return res.status(202).json({ message: "MFA required" }); // 202 Accepted, awaiting MFA
    // }

    // --- MFA Logic End ---

    // If MFA is NOT enabled, or if this is a successful password verification for MFA-disabled user,
    // then proceed with setting the authentication cookie.

    // Serialize the cookie with the corrected path.
    const cookie = serialize("admin-auth", "true", {
      httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript.
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production.
      maxAge: 60 * 60 * 10000000, // Cookie expires in 1 hour (in seconds).
      path: "/admin", // CORRECTED: Set path to '/' so it's sent to all API routes and pages.
      sameSite: "Lax", // Recommended for CSRF protection
    });

    // Set the 'Set-Cookie' header manually using res.setHeader().
    res.setHeader("Set-Cookie", cookie);

    // Return a successful login response.
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login API error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
}
