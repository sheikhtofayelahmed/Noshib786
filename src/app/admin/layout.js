// app/admin/layout.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb"; // adjust path if needed

export default function AdminLayout({ children }) {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [entryCounts, setEntryCounts] = useState();
  const navItems = [
    { name: "Home", path: "/admin" },
    { name: "গেম কন্ট্রোল", path: "/admin/game-control" },
    { name: "এজেন্ট", path: "/admin/agent" },
    {
      name: `ভাউচার ${entryCounts !== undefined ? ` (${entryCounts})` : ""}`,
      path: "/admin/voucher",
    },
    {
      name: `Verify Voucher `,
      path: "/admin/verify-voucher",
    },
    {
      name: `পেন্ডিং ভাউচার ${
        pendingPlayers !== undefined ? ` (${pendingPlayers})` : ""
      }`,
      path: "/admin/waitingData",
    },
    { name: "হিসাব-নিকাশ", path: "/admin/account" },
    { name: "HNY- 3UP", path: "/admin/hny-3up" },
    { name: "HNY- DOUBLE", path: "/admin/hny-double" },
    { name: "HNY- DOWN", path: "/admin/hny-down" },
    { name: "PROFIT-LOSS", path: "/admin/profit-loss" },
    { name: "এজেন্ট (বাতিল)", path: "/admin/inactive-agent" },
    { name: "MFA Settings", path: "/admin/mfa-settings" }, // NEW: Link to MFA settings
  ];

  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logoutAdmin = async () => {
    try {
      // Step 1: Make the fetch call to your server-side logout API endpoint.
      // AWAIT this fetch call to ensure it completes before redirecting.
      const response = await fetch("/api/admin-logout", {
        method: "GET",
      });

      if (response.ok) {
        console.log(
          "Logout API call successful. Cookie should be cleared by server."
        );
        window.location.href = "/admin/login";
      } else {
        const errorText = await response.text();
        console.error("Logout API call failed:", response.status, errorText);
        window.location.href = "/admin/login"; // Fallback redirect
      }
    } catch (error) {
      console.error(
        "Network or unexpected error during logout process:",
        error
      );
      window.location.href = "/admin/login"; // Fallback redirect
    }
  };

  // Function to fetch pending players
  const fetchPendingPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/getPendingPlayers"); // New API endpoint
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch pending players: ${response.statusText}`
        );
      }
      const data = await response.json();

      setPendingPlayers(data.length);
    } catch (e) {
      console.error("Error fetching pending players:", e);
      setError(
        e.message || "Failed to load pending players. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const res = await fetch("/api/getVoucherQnt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (res.ok) {
          setEntryCounts(data.count); // assuming setEntryCounts is used for the total count
        } else {
          console.error("Failed to fetch count:", data.message);
        }
      } catch (err) {
        console.error("Error fetching count:", err);
      }
    };

    fetchTotalCount();
  }, []);

  useEffect(() => {
    fetchPendingPlayers();
  }, []);
  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 bg-black md:hidden border-b cyan-yellow-500">
        <h2 className="text-xl font-bold text-cyan-400">🎰 Game Admin</h2>
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
              Game Admin
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
            onClick={logoutAdmin}
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
  );
}
