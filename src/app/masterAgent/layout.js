"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb"; // adjust path if needed
import {
  MasterAgentProvider,
  useMasterAgent,
} from "@/context/MasterAgentContext";

export default function MasterAgentLayout({ children }) {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [entryCounts, setEntryCounts] = useState();

  const navItems = [
    { name: "Home", path: "/masterAgent" },
    { name: "এজেন্ট", path: "/masterAgent/agent" },
    // { name: "হিসাব-নিকাশ", path: "/masterAgent/account" },
    // { name: "এজেন্ট (বাতিল)", path: "/masterAgent/inactive-agent" },
  ];

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logoutMasterAgent = async () => {
    try {
      const response = await fetch("/api/masterAgent-logout", {
        method: "GET",
      });

      if (response.ok) {
        console.log(
          "Logout API call successful. Cookie should be cleared by server."
        );
        window.location.href = "/masterAgent/login";
      } else {
        const errorText = await response.text();
        console.error("Logout API call failed:", response.status, errorText);
        window.location.href = "/masterAgent/login"; // Fallback redirect
      }
    } catch (error) {
      console.error(
        "Network or unexpected error during logout process:",
        error
      );
      window.location.href = "/masterAgent/login"; // Fallback redirect
    }
  };

  return (
    <MasterAgentProvider>
      <div className="min-h-screen font-mono bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-4 bg-black md:hidden border-b cyan-yellow-500">
          <h2 className="text-xl font-bold text-cyan-400">🎰 Master Agent</h2>
          <button onClick={toggleSidebar} className="text-cyan-400">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed z-50 top-0 left-0 h-full w-72 bg-gradient-to-br from-cyan-950 via-gray-900 to-black backdrop-blur-md p-6 flex flex-col justify-between border-r border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-transform transform duration-300 md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header / Logo */}
          <div>
            <div className="mb-10 hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xl font-bold shadow-inner">
                🎰
              </div>
              <h2 className="text-2xl font-bold text-cyan-300 tracking-widest drop-shadow-[0_0_8px_#22d3ee]">
                Master Agent
              </h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-4 font-bangla">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative px-5 py-3 rounded-xl border transition-all duration-300 font-medium ${
                      pathname === item.path
                        ? "bg-cyan-300 text-black border-cyan-400 shadow-md"
                        : "border-cyan-500 text-cyan-200 hover:bg-cyan-400 hover:text-black"
                    }`}
                  >
                    🎲 {item.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Logout */}
          <div className="pt-8 mt-10 border-t border-cyan-600">
            <button
              onClick={logoutMasterAgent}
              className="w-full text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl shadow-lg transition-all"
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
          <Breadcrumb /> {/* Ensure this component exists or remove/replace */}
          {children}
        </main>
      </div>
    </MasterAgentProvider>
  );
}
