// pages/api/admin/mfa-status.js (Pages Router API Route)
// This file provides the MFA status (enabled/disabled) for the currently authenticated admin.

import clientPromise from "lib/mongodb"; // your MongoDB connection utility

// Helper to get authenticated user (simplified for 'admin' user based on cookie)
async function getAuthenticatedAdminFromCookie(req) {
  console.log(req.cookies, "cookies");
  const authCookieValue = req.cookies["admin-auth"];
  console.log(authCookieValue, "auth cookie");
  if (!authCookieValue || authCookieValue !== "true") {
    return null; // Not authenticated
  }
  return { username: "admin" }; // Assuming fixed 'admin' username
}

// Define the handler function for this API route.
export default async function handler(req, res) {
  // Ensure the request method is GET.
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authenticatedAdmin = await getAuthenticatedAdminFromCookie(req);
    if (!authenticatedAdmin) {
      // If not authenticated, return 401 and an MFA disabled status (as they can't manage it)
      return res.status(401).json({ error: "Unauthorized", mfaEnabled: false });
    }

    const client = await clientPromise;
    const db = client.db("noshib786");
    const admin = await db
      .collection("admins")
      .findOne({ username: authenticatedAdmin.username });

    if (!admin) {
      // If admin not found in DB (unlikely if authenticated), return 404
      return res
        .status(404)
        .json({ error: "Admin account not found", mfaEnabled: false });
    }

    // Return the MFA enabled status
    return res.status(200).json({ mfaEnabled: !!admin.mfaEnabled }); // Ensure boolean
  } catch (error) {
    console.error("MFA status API error:", error);
    return res.status(500).json({ error: "Server error fetching MFA status" });
  }
}
