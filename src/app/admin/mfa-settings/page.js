"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// ✅ Dynamic import to avoid SSR issues
const QRCode = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => <p>Loading QR Code...</p>,
  }
);

export default function MfaSettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSetup, setShowSetup] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // ✅ Simulated MFA status check – replace with real API in production
  useEffect(() => {
    const checkMfaStatus = async () => {
      setLoading(true);
      try {
        // Replace with: const res = await fetch("/api/mfa-status");
        setMfaEnabled(false); // Default to false
        setError("");
      } catch (err) {
        console.error("Failed to fetch MFA status:", err);
        setError("Unable to load MFA status.");
      } finally {
        setLoading(false);
      }
    };
    checkMfaStatus();
  }, []);

  const initiateMfaSetup = async () => {
    setSetupLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/mfa-setup", { method: "GET" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to initiate MFA setup");

      setMfaSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setShowSetup(true);
    } catch (err) {
      setError(err.message || "Error initiating MFA setup");
    } finally {
      setSetupLoading(false);
    }
  };

  const confirmMfaSetup = async () => {
    setSetupLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/mfa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin", // Replace with real user ID
          mfaSecret,
          mfaCode: setupCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      setSuccess("MFA enabled successfully!");
      setMfaEnabled(true);
      setShowSetup(false);
      setMfaSecret("");
      setOtpauthUrl("");
      setSetupCode("");
    } catch (err) {
      setError(err.message || "MFA setup failed");
    } finally {
      setSetupLoading(false);
    }
  };

  const disableMfa = async () => {
    const confirmDisable = window.confirm(
      "Are you sure you want to disable MFA? This reduces account security."
    );
    if (!confirmDisable) return;

    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/mfa-setup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable MFA");

      setMfaEnabled(false);
      setSuccess("MFA disabled successfully.");
    } catch (err) {
      setError(err.message || "Error disabling MFA");
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
            <div>
              <p className="text-lg mb-4 text-center">
                MFA is currently{" "}
                <span className="text-red-400 font-bold">DISABLED</span>.
              </p>

              {!showSetup ? (
                <button
                  onClick={initiateMfaSetup}
                  disabled={setupLoading}
                  className="w-full bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition shadow-md"
                >
                  {setupLoading ? "Generating..." : "Enable MFA"}
                </button>
              ) : (
                <div className="mt-6 p-4 border border-yellow-700 rounded-lg bg-gray-800">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-300">
                    MFA Setup Steps:
                  </h3>
                  <ol className="mb-4 space-y-2">
                    <li>
                      1. Open your authenticator app (e.g., Google
                      Authenticator, Authy).
                    </li>
                    <li>
                      2. Scan the QR code below or enter the secret key
                      manually.
                    </li>
                  </ol>

                  {otpauthUrl && (
                    <div className="my-4 flex justify-center">
                      <QRCode
                        value={otpauthUrl}
                        size={180}
                        level="H"
                        includeMargin
                        fgColor="#FACC15"
                        bgColor="#1F2937"
                      />
                    </div>
                  )}

                  <p className="font-mono text-sm break-all mb-4 text-center">
                    Secret:{" "}
                    <span className="font-bold select-all">{mfaSecret}</span>
                  </p>

                  <p className="mb-2">3. Enter the 6-digit code to confirm:</p>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className="w-full p-2 mb-4 rounded bg-gray-700 border border-yellow-500 text-yellow-200 focus:outline-none"
                    maxLength={6}
                    disabled={setupLoading}
                  />

                  <button
                    onClick={confirmMfaSetup}
                    disabled={setupLoading}
                    className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition shadow-md"
                  >
                    {setupLoading ? "Confirming..." : "Confirm Setup"}
                  </button>

                  <button
                    onClick={() => setShowSetup(false)}
                    disabled={setupLoading}
                    className="w-full mt-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-lg mb-4 text-center">
                MFA is currently{" "}
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
