// pages/api/admin/mfa-setup.js (Pages Router API Route)
// This file handles generating MFA secrets, confirming setup, and disabling MFA,
// adapted for the Pages Router API route structure.

import { authenticator } from "otplib"; // CORRECTED/CONFIRMED: Ensure 'otpauth' is correctly installed and imported as a named export
import clientPromise from "lib/mongodb"; // your MongoDB connection utility
import { ObjectId } from "mongodb"; // Import ObjectId for database queries if needed

// Helper to get authenticated user (simplified for 'admin' user based on cookie)
async function getAuthenticatedAdminFromCookie(req) {
  // In Pages Router API routes, cookies are available on req.cookies as an object.
  // The value will be the string 'true' if set by our login/mfa-verify.
  const authCookieValue = req.cookies["admin-auth"];
  if (!authCookieValue || authCookieValue !== "true") {
    return null; // Not authenticated
  }
  // In a real multi-user app, you'd decode a JWT or verify a session from DB
  // For this fixed 'admin' example, we just return a placeholder indicating authenticated.
  return { username: "admin" };
}

// Define the handler function for this API route.
export default async function handler(req, res) {
  try {
    const authenticatedAdmin = await getAuthenticatedAdminFromCookie(req);
    if (!authenticatedAdmin) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Must be logged in to manage MFA." });
    }

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const admin = await db
      .collection("admins")
      .findOne({ username: authenticatedAdmin.username });

    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    switch (req.method) {
      case "GET": // Handles MFA setup initiation (generate secret and QR code URL)
        // Generate a new TOTP secret for the user
        const newSecret = authenticator.generateSecret(); // This is the line causing the error

        // Generate the OTPAuth URL for the QR code
        const otpauthUrl = authenticator.keyuri({
          secret: newSecret,
          issuer: "Thai Agent Lottery Admin", // Your application name
          label: admin.username, // User identifier (e.g., admin's email or username)
          algorithm: "SHA1",
          digits: 6,
          period: 30,
        });

        return res
          .status(200)
          .json({ secret: newSecret, otpauthUrl: otpauthUrl });

      case "POST": // Handles MFA setup confirmation (verify initial code and save secret)
        const { username, mfaSecret, mfaCode } = req.body; // Body is directly on req

        if (!username || !mfaSecret || !mfaCode) {
          return res.status(400).json({
            error: "Missing required fields for MFA setup confirmation",
          });
        }

        // Ensure authenticated user matches the username provided in the body (security check)
        if (authenticatedAdmin.username !== username) {
          return res
            .status(401)
            .json({ error: "Unauthorized. User mismatch." });
        }

        // Verify the initial MFA code with the provided secret
        const totpPost = new authenticator.TOTP({
          secret: mfaSecret,
          digits: 6,
          period: 30,
          algorithm: "SHA1",
        });

        const deltaPost = totpPost.validate({ token: mfaCode, window: 1 }); // window: 1 allows for a small time skew

        if (deltaPost === null) {
          return res
            .status(401)
            .json({ error: "Invalid MFA code. Please try again." });
        }

        // If the code is valid, save the secret and enable MFA for the user
        await db
          .collection("admins")
          .updateOne(
            { username: username },
            { $set: { mfaSecret: mfaSecret, mfaEnabled: true } }
          );

        return res.status(200).json({ message: "MFA successfully enabled!" });

      case "DELETE": // Handles MFA disable
        const { username: disableUsername } = req.body; // Rename to avoid conflict with outer username

        if (!disableUsername) {
          return res
            .status(400)
            .json({ error: "Username is required to disable MFA." });
        }

        // Ensure authenticated user matches the username provided in the body (security check)
        if (authenticatedAdmin.username !== disableUsername) {
          return res
            .status(401)
            .json({ error: "Unauthorized. User mismatch for disable." });
        }

        // Disable MFA: set mfaEnabled to false and clear mfaSecret
        await db
          .collection("admins")
          .updateOne(
            { username: disableUsername },
            { $set: { mfaEnabled: false, mfaSecret: null } }
          );

        return res.status(200).json({ message: "MFA successfully disabled!" });

      default:
        // Handle any other HTTP method not allowed.
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error("MFA setup API error:", err);
    return res
      .status(500)
      .json({ error: "Server error during MFA operation." });
  }
}
