"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import { useAgent } from "@/context/AgentContext";
import AllahBhorosha from "./Allah";

export default function AgentLayout({ children }) {
  const { agentId, entryCount, waitingEntryCount, logout, loading } =
    useAgent();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agent, setAgent] = useState();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: "Play", path: "/agent" },
    {
      name: `Voucher${entryCount !== undefined ? ` (${entryCount})` : ""}`,
      path: "/agent/games",
    },
    {
      name: `Customer`,
      path: "/agent/gamer",
    },
    {
      name: `Search Voucher`,
      path: "/agent/voucher",
    },
    {
      name: `Pending-পেন্ডিং ${
        waitingEntryCount !== undefined ? ` (${waitingEntryCount})` : ""
      }`,
      path: "/agent/waitingData",
    },
    { name: "Noshib Explore", path: "/history" },
  ];

  // Fetch agent info
  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/getAgentById?agentId=${agentId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Response not OK:", res.status, text);
          throw new Error("Failed to fetch agent data");
        }

        const data = await res.json();
        setAgent(data.agent);
      } catch (error) {
        console.error("Error fetching agent:", error.message);
      }
    };

    fetchAgent();
  }, [agentId]);

  // Heartbeat ping
  useEffect(() => {
    if (!agentId) return;

    const interval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [agentId]);

  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 bg-black md:hidden border-b border-yellow-500">
        <h2 className="text-xl font-bold text-yellow-400">🎯 Agent Panel</h2>
        <button
          onClick={toggleSidebar}
          className="text-yellow-400 bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 
             px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform 
             border-2 border-yellow-300 font-bold text-lg flex items-center gap-2"
        >
          {sidebarOpen && <X size={24} />}
          <span className="text-white  animate-pulse text-lg">Menu 🎲</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-72 bg-gradient-to-br from-cyan-950 via-gray-900 to-black backdrop-blur-md p-6 flex flex-col justify-between border-r border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-transform transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <h2 className="font-bangla text-xl font-extrabold mb-6 text-cyan-300 hidden md:block tracking-widest drop-shadow-[0_0_8px_#22d3ee]">
            🎯 এজেন্ট প্যানেল
          </h2>

          {/* Agent Info */}
          <div className="bg-gradient-to-br from-cyan-200 to-cyan-100 shadow-lg rounded-xl p-4 mb-6 border border-cyan-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-cyan-600 text-xl font-semibold">🆔</span>
              <p className="text-base font-semibold text-gray-800">
                <span className="text-cyan-700">ID:</span> {agentId}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-cyan-600 text-xl font-semibold">👤</span>
              <p className="text-base font-semibold text-gray-800">
                <span className="text-cyan-700">Name:</span> {agent?.name}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-4 font-bangla">
            {navItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <div
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-5 py-3 rounded-xl border transition duration-300 font-medium tracking-wide ${
                    pathname === item.path
                      ? "bg-cyan-300 text-black border-cyan-500 shadow-inner"
                      : "border-cyan-500 text-cyan-200 hover:bg-cyan-400 hover:text-black"
                  }`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Trust Section */}
        <div className="mt-6">
          <AllahBhorosha />
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-cyan-600 mt-6">
          <button
            onClick={() => {
              logout();
              window.location.href = "/agent/login";
            }}
            className="w-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl shadow-lg transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}
