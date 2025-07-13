"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Breadcrumb from "./Breadcrumb"; // adjust path if needed
import { useAgent } from "@/context/AgentContext";
import Image from "next/image";
import AllahBhorosha from "./Allah";

export default function AgentLayout({ children }) {
  const { loginAs, entryCount, waitingEntryCount, logout } = useAgent();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { agentId, loading } = useAgent();
  const [agent, setAgent] = useState();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const navItems = [
    { name: "Home", path: "/" },
    // Only show Games if loginAs is 'agent'
    ...(loginAs === "agent"
      ? [
          {
            name: `Games${entryCount !== undefined ? ` (${entryCount})` : ""}`,
            path: "/agent/games",
          },
          {
            name: `Voucher`,
            path: "/agent/voucher",
          },
        ]
      : []),
    agent?.hasSubAgents && {
      name: "Sub Agent Games",
      path: "/agent/subAgentGames",
    },
    {
      name: `Pending-পেন্ডিং ${
        waitingEntryCount !== undefined ? ` (${waitingEntryCount})` : ""
      }`,
      path: "/agent/waitingData",
    },
  ];
  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/getAgentById?agentId=${agentId}`);

        // Check status and log for debug
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
  useEffect(() => {
    if (!agentId) return;

    const interval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
    }, 30000); // every 30 seconds
    return () => clearInterval(interval); // cleanup on unmount
  }, [agentId]);
  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-black via-gray-900 to-yellow-400text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 bg-black md:hidden border-b border-yellow-500">
        <h2 className="text-xl font-bold text-yellow-400">🎯 Agent Panel</h2>
        <button onClick={toggleSidebar} className="text-yellow-400">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-black border-r-4 border-yellow-500 p-4 flex flex-col justify-between transform transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <h2 className="text-2xl font-extrabold mb-6 text-yellow-400 hidden md:block">
            🎯 Agent Panel
          </h2>

          <div className="bg-yellow-100 shadow-md rounded-xl p-4 mb-4 border border-red-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-red-500 text-xl font-semibold">🆔</span>
              <p className="text-lg font-semibold text-gray-800">
                <span className="text-red-400">ID:</span> {agentId}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-xl font-semibold">👤</span>
              <p className="text-lg font-semibold text-gray-800">
                <span className="text-red-400">Name:</span> {agent?.name}
              </p>
            </div>
          </div>
          <nav className="space-y-3 font-bangla          ">
            {navItems
              .filter((item) => item && item.path) // ensure item and item.path exist
              .map((item) => (
                <Link href={item.path} key={item.path}>
                  <div
                    onClick={() => setSidebarOpen(false)}
                    className={`block px-4 py-2 rounded border border-yellow-400 hover:bg-yellow-500 hover:text-black transition ${
                      pathname === item.path
                        ? "bg-yellow-600 text-black font-bold shadow-lg"
                        : "text-yellow-300"
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
          </nav>
        </div>
        <AllahBhorosha></AllahBhorosha>

        <div className="pt-6 border-t border-yellow-600 mt-6">
          <button
            onClick={() => {
              logout();
              window.location.href = "/agent/login";
            }}
            className="w-full text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
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
