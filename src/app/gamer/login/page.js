"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useGamer } from "@/context/GamerContext";

export default function GamerLogin() {
  const [gamerIdInput, setGamerIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginError } = useGamer();
  const router = useRouter();

  async function handleLogin() {
    if (!gamerIdInput || !password) return;

    const success = await login(gamerIdInput, password);

    if (success) {
      router.push("/gamer"); // redirect on login success
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900 p-6 rounded shadow-lg border border-yellow-500 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">
          🎯 gamer Login
        </h1>

        <input
          type="text"
          placeholder="gamer ID"
          value={gamerIdInput}
          onChange={(e) => setGamerIdInput(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
          autoComplete="username"
        />

        <div className="flex items-center w-full mb-4 bg-gray-800 border border-yellow-300 rounded px-3 py-2 text-yellow-200">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="gamer Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-yellow-200 placeholder-yellow-500 focus:outline-none font-mono"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-yellow-300 hover:text-yellow-500 transition"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold disabled:opacity-50"
          disabled={!gamerIdInput || !password}
        >
          Login
        </button>

        {loginError && (
          <p className="text-red-400 text-sm mt-2 text-center">
            ❌ {loginError}
          </p>
        )}
      </div>
    </div>
  );
}
