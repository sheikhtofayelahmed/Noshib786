// app/api/admin/mfa-verify/route.js (NEW - App Router)
// This file handles the verification of the MFA code.

import { NextResponse } from "next/server";
import { authenticator } from "otplib"; // Ensure 'otpauth' is installed
import clientPromise from "/lib/mongodb"; // Ensure this path is correct

export async function POST(request) {
  try {
    const { username, mfaCode } = await request.json(); // Expect username and MFA code

    if (!username || !mfaCode) {
      return NextResponse.json(
        { error: "Username and MFA code are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    const admin = await db.collection("admins").findOne({ username: username });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (!admin.mfaEnabled || !admin.mfaSecret) {
      // If MFA is not enabled for this user, they shouldn't be attempting MFA.
      return NextResponse.json(
        { error: "MFA not enabled for this account" },
        { status: 403 }
      );
    }

    // Create a new OTPAuth.TOTP instance from the stored secret
    const totp = new authenticator.TOTP({
      secret: admin.mfaSecret,
      digits: 6, // Standard for authenticator apps
      period: 30, // Standard period (30 seconds)
      algorithm: "SHA1", // Standard algorithm
    });

    // Validate the received MFA code
    // The .validate() method returns the delta (time step difference) if valid, or null if invalid.
    const delta = totp.validate({ token: mfaCode, window: 1 }); // window: 1 allows for a small time skew

    if (delta === null) {
      // If delta is null, the code is invalid
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }

    // If MFA code is valid, proceed with setting the authentication cookie
    const response = NextResponse.json(
      { message: "MFA verification successful" },
      { status: 200 }
    );

    response.cookies.set("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1, // 1 hour
      path: "/admin",
      sameSite: "Lax",
    });

    return response;
  } catch (err) {
    console.error("MFA verification API error:", err);
    return NextResponse.json(
      { error: "Server error during MFA verification" },
      { status: 500 }
    );
  }
}
