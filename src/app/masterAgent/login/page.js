"use client"; // This component runs on the client due to useState, useRouter, etc.

import { useMasterAgent } from "@/context/MasterAgentContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(""); // Assuming fixed 'admin' username for simplicity
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState(""); // New state for MFA code
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false); // State to control MFA step visibility
  const { setMasterAgentId } = useMasterAgent();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // Step 1: Initial password login
      const res = await fetch("/api/masterAgent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterAgentId: username, password }),
      });

      setLoading(false);

      if (res.ok) {
        // HTTP 200: Login successful (no MFA or MFA not enabled)
        console.log("Login successful!");
        setMasterAgentId(username);

        router.push("/masterAgent"); // Redirect to admin dashboard
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      console.error("Login fetch error:", err);
      setError("Network error or server unreachable. Please try again.");
    }
  };

  return (
    <div className="min-h-screen -mt-32 flex items-center justify-center  text-white">
      <div className="bg-gray-900 p-6 rounded shadow-lg border border-yellow-500">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">
          🎰 Master Agent Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
          disabled={loading}
        />

        <>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </>

        {error && (
          <p className="mt-2 text-red-400 font-mono text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
