"use client";

import { useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";

export default function AgentLogin() {
  const [agentIdInput, setAgentIdInput] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginError } = useAgent();
  const router = useRouter();

  async function handleLogin() {
    if (!agentIdInput || !password) return;

    const success = await login(agentIdInput, password);
    if (success) {
      router.push("/"); // Redirect after login
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900 p-6 rounded shadow-lg border border-yellow-500 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">
          🎯 Agent Login
        </h1>

        <input
          type="text"
          placeholder="Agent ID"
          value={agentIdInput}
          onChange={(e) => setAgentIdInput(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold disabled:opacity-50"
          disabled={!agentIdInput || !password}
        >
          Login
        </button>

        {loginError && (
          <p className="mt-2 text-red-400 font-mono">{loginError}</p>
        )}
      </div>
    </div>
  );
}
