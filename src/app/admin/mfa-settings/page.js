// app/admin/account/mfa-settings/page.js (NEW - App Router Client Component)
// This page allows a logged-in admin to enable or disable MFA.
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // Import dynamic for client-side loading
// import { cookies } from "next/headers";

// Use dynamic import for QRCode to ensure it's only loaded on the client-side.
// This helps avoid SSR issues and potential import conflicts.
const QRCode = dynamic(() => import("qrcode.react"), {
  ssr: false, // This ensures the component is NOT rendered on the server
  loading: () => <p>Loading QR Code...</p>, // Optional: A loading state while the component is being fetched
});

export default function MfaSettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for MFA setup process
  const [showSetup, setShowSetup] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [setupCode, setSetupCode] = useState(""); // Code entered during setup
  const [setupLoading, setLoadingSetup] = useState(false); // Renamed for clarity

  // Fetch current MFA status when the component mounts
  useEffect(() => {
    const checkMfaStatus = async () => {
      setLoading(true);
      setError(""); // Clear previous errors

      // CORRECTED: Await the cookies() function call.
      const cookieStore = await cookies(); // Access server-side cookies
      const cookie = cookieStore.get("admin-auth");
      try {
        // Now call the new API route to get the actual MFA status
        const res = await fetch("/api/mfa-status", {
          // CORRECTED URL
          method: "GET",
          headers: {
            cookie,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMfaEnabled(data.mfaEnabled); // Set state based on API response
          setSuccess("MFA status loaded successfully.");
        } else {
          // If the API call itself returns an error (e.g., 401 Unauthorized, 404 Not Found)
          const errorData = await res.json();
          setError(
            errorData.error || "Failed to fetch MFA status from server."
          );
          setMfaEnabled(false); // Default to disabled on error
        }
      } catch (err) {
        // Handle network errors or other unexpected issues
        console.error("Failed to fetch MFA status:", err);
        setError(
          "Network error or server unreachable. Unable to load MFA status."
        );
        setMfaEnabled(false); // Default to disabled on network error
      } finally {
        setLoading(false);
      }
    };
    checkMfaStatus();
  }, []); // Empty dependency array means this runs once on mount

  const initiateMfaSetup = async () => {
    setLoadingSetup(true); // Use the renamed state setter
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/admin/mfa-setup", {
        method: "GET", // To get the secret and QR code URL
      });

      if (res.ok) {
        const data = await res.json();
        setMfaSecret(data.secret);
        setOtpauthUrl(data.otpauthUrl);
        setShowSetup(true); // Show the QR code and code input
      } else {
        const data = await res.json();
        setError(data.error || "Failed to initiate MFA setup.");
      }
    } catch (err) {
      console.error("Error initiating MFA setup:", err);
      setError("Network error during MFA setup initiation.");
    } finally {
      setLoadingSetup(false); // Use the renamed state setter
    }
  };

  const confirmMfaSetup = async () => {
    setLoadingSetup(true); // Use the renamed state setter
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/admin/mfa-setup", {
        method: "POST", // To confirm setup with the entered code
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          mfaSecret,
          mfaCode: setupCode,
        }),
      });

      if (res.ok) {
        setSuccess("MFA enabled successfully! Keep your secret safe.");
        setMfaEnabled(true); // Update local state
        setShowSetup(false); // Hide setup flow
        setMfaSecret(""); // Clear secret from state
        setOtpauthUrl(""); // Clear QR code URL
        setSetupCode(""); // Clear setup code
      } else {
        const data = await res.json();
        setError(data.error || "MFA setup confirmation failed. Invalid code?");
      }
    } catch (err) {
      console.error("Error confirming MFA setup:", err);
      setError("Network error during MFA setup confirmation.");
    } finally {
      setLoadingSetup(false); // Use the renamed state setter
    }
  };

  const disableMfa = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const confirmDisable = window.confirm(
        "Are you sure you want to disable MFA? This will reduce your account security."
      );
      if (!confirmDisable) {
        setLoading(false);
        return; // User cancelled
      }

      const res = await fetch("/api/admin/mfa-setup", {
        // Using the same route for DELETE
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin" }),
      });

      if (res.ok) {
        setMfaEnabled(false);
        setSuccess("MFA disabled successfully.");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to disable MFA.");
      }
    } catch (err) {
      console.error("Error disabling MFA:", err);
      setError("Network error during MFA disable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl text-yellow-100 border border-yellow-600">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">
        Multi-Factor Authentication Settings
      </h2>

      {loading ? (
        <p className="text-lg">Loading MFA status...</p>
      ) : (
        <>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {success && (
            <p className="text-green-500 mb-4 text-center">{success}</p>
          )}

          {!mfaEnabled ? (
            <div className="mt-4">
              <p className="text-lg mb-4 text-center">
                MFA is currently
                <span className="text-red-400 font-bold">DISABLED</span>.
              </p>
              {!showSetup ? (
                <button
                  onClick={initiateMfaSetup}
                  disabled={setupLoading} // Use the renamed state
                  className="w-full bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition shadow-md"
                >
                  {setupLoading ? "Generating..." : "Enable MFA"}
                </button>
              ) : (
                <div className="mt-6 p-4 border border-yellow-700 rounded-lg bg-gray-800">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-300">
                    MFA Setup Steps:
                  </h3>
                  <p className="mb-2">
                    1. Open your authenticator app (e.g., Google Authenticator,
                    Authy).
                  </p>
                  <p className="mb-2">
                    2. Scan the QR code below or manually enter the secret key:
                  </p>

                  {otpauthUrl && (
                    <div className="my-4 flex justify-center">
                      {/* Render QRCode component (will be loaded dynamically) */}
                      <QRCode
                        value={otpauthUrl}
                        size={180}
                        level="H"
                        includeMargin={true}
                        fgColor="#FACC15"
                        bgColor="#1F2937"
                      />
                    </div>
                  )}
                  <p className="font-mono text-sm break-all mb-4 text-center">
                    Secret:
                    <span className="font-bold select-all">{mfaSecret}</span>
                  </p>

                  <p className="mb-2">
                    3. Enter the 6-digit code from your app to confirm setup:
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className="w-full p-2 mb-4 rounded bg-gray-700 border border-yellow-500 text-yellow-200 focus:outline-none"
                    maxLength={6}
                    disabled={setupLoading} // Use the renamed state
                  />
                  <button
                    onClick={confirmMfaSetup}
                    disabled={setupLoading} // Use the renamed state
                    className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition shadow-md"
                  >
                    {setupLoading ? "Confirming..." : "Confirm Setup"}
                  </button>
                  <button
                    onClick={() => setShowSetup(false)}
                    className="w-full mt-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition shadow-md"
                    disabled={setupLoading} // Use the renamed state
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-lg mb-4 text-center">
                MFA is currently
                <span className="text-green-400 font-bold">ENABLED</span>.
              </p>
              <button
                onClick={disableMfa}
                disabled={loading}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-md"
              >
                {loading ? "Disabling..." : "Disable MFA"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
