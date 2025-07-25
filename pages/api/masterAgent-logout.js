import { serialize } from "cookie"; // Required for manually setting the Set-Cookie header

// Define the handler function for this API route.
// In Pages Router API routes, the handler receives Node.js 'req' and 'res' objects.
export default async function handler(req, res) {
  // Ensure the request method is GET (as your frontend currently calls it).
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const clearIdCookie = serialize("masterAgentId", "", {
      maxAge: 0,
      path: "/",
    });
    const clearAuthCookie = serialize("masterAgent-auth", "", {
      maxAge: 0,
      path: "/",
    });

    res.setHeader("Set-Cookie", [clearIdCookie, clearAuthCookie]);
    res.setHeader("Location", "/masterAgent/login");
    return res.status(302).end();
  } catch (error) {
    console.error("Logout API error:", error);
    // In case of a server error during logout, still attempt to redirect to login
    // but also send a 500 status in the response to indicate the failure.
    res.setHeader("Location", "/masterAgent/login"); // Still redirect
    return res
      .status(500)
      .json({ error: "Server error during logout. Please try again." });
  }
}
