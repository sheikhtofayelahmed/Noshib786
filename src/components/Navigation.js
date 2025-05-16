"use client";
import React from "react";
import { useAgent } from "@/context/AgentContext";
import Link from "next/link";
const Navigation = () => {
  const { agentId, logout } = useAgent();

  return (
    <nav className="bg-gray-900 bg-opacity-80 border-b border-yellow-500 shadow-lg">
      <div className="flex justify-center items-center py-3 border-b border-yellow-500">
        {agentId && (
          <span className="text-3xl font-extrabold text-yellow-400 tracking-wide drop-shadow-lg hover:animate-pulse cursor-default">
            🎯 Thai Lottery Agent (ID: {agentId})
          </span>
        )}
      </div>

      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200"
          >
            🏠 Home
          </Link>

          <Link
            href="/reports"
            className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200"
          >
            📊 Reports
          </Link>

          <Link
            href="/game"
            className="hover:text-pink-400 hover:underline text-lg font-semibold transition duration-200"
          >
            🎮 Game
          </Link>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow transition duration-200"
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
