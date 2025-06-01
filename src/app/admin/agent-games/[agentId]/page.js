"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import PlayerAccountSummary from "@/components/PlayerAccountSummary";

export default function AgentGames() {
  const { agentId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logoutAdmin = () => {
    document.cookie = "admin-auth=; Max-Age=0; path=/";
    localStorage.removeItem("admin-auth");
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-black to-red-900 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 bg-black md:hidden border-b border-yellow-500">
        <h2 className="text-xl font-bold text-yellow-400">🎰 Game Admin</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-yellow-400"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}

      {/* Overlay for mobile */}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold text-yellow-300 mb-6">
          🎮 Games by Agent
        </h2>

        {loading && <p className="text-yellow-300">⏳ Loading...</p>}
        {error && <p className="text-red-500">❌ {error}</p>}

        <PlayerAccountSummary
          agentId={agentId}
          print={true}
        ></PlayerAccountSummary>
      </main>
    </div>
  );
}
