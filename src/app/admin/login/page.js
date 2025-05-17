"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/agent");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded shadow-lg border border-yellow-500">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">
          🎰 Admin Login
        </h1>
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
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="mt-2 text-red-400 font-mono">{error}</p>}
      </div>
    </div>
  );
}
