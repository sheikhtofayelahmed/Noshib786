// pages/api/admin-logout.js (Pages Router API Route)
// This file handles logging out the admin by clearing the authentication cookie,
// adapted for the Pages Router API route structure.

import { serialize } from "cookie"; // Required for manually setting the Set-Cookie header

// Define the handler function for this API route.
// In Pages Router API routes, the handler receives Node.js 'req' and 'res' objects.
export default async function handler(req, res) {
  // Ensure the request method is GET (as your frontend currently calls it).
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Serialize the 'admin-auth' cookie to expire it immediately (maxAge: 0).
    const cookie = serialize("admin-auth", "", {
      httpOnly: true, // Prevents client-side JavaScript access for security.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
      maxAge: 0, // Immediately expires the cookie, effectively deleting it.
      path: "/", // CORRECTED: Set path to '/' to match login cookie.
      sameSite: "Lax", // Recommended for modern browsers and security.
    });

    // Set the 'Set-Cookie' header manually using res.setHeader().
    res.setHeader("Set-Cookie", cookie);

    // After clearing the cookie, redirect the user to the login page.
    res.setHeader("Location", "/admin/login");
    return res.status(302).end(); // 302 Found (temporary redirect)
  } catch (error) {
    console.error("Logout API error:", error);
    // In case of a server error during logout, still attempt to redirect to login
    // but also send a 500 status in the response to indicate the failure.
    res.setHeader("Location", "/admin/login"); // Still redirect
    return res
      .status(500)
      .json({ error: "Server error during logout. Please try again." });
  }
}
