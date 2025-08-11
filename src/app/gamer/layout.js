"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAgent } from "@/context/AgentContext";
import Breadcrumb from "@/components/Breadcrumb";
import AllahBhorosha from "@/components/Allah";
import { useGamer } from "@/context/GamerContext";

export default function AgentLayout({ children }) {
  const { gamerId, loading, entryCount, waitingEntryCount, logout } =
    useGamer();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agent, setAgent] = useState();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: "Play", path: "/gamer" },

    {
      name: "Voucher",
      path: "/gamer/games",
      count: entryCount,
      suffix: "OK",
    },

    {
      name: "ওয়েটিং ভাউচার - waiting Voucher",
      path: "/gamer/waitingData",
      count: waitingEntryCount,
      redBackground: true,
    },

    { name: "Transaction", path: "/gamer/trxn" },
    { name: "Noshib Explore", path: "/history" },
  ];

  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex justify-between items-center p-4 bg-black md:hidden border-b border-yellow-500">
        <h2 className="text-lg font-bold text-yellow-400">
          🎯 কাস্টমার প্যানেল
        </h2>
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
        className={`fixed z-50 top-0 left-0 h-full w-72 bg-gradient-to-br from-pink-950 via-gray-900 to-black backdrop-blur-md p-6 flex flex-col justify-between border-r border-pink-400 shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-transform transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <h2 className="font-bangla text-xl font-extrabold mb-6 text-pink-300 hidden md:block tracking-widest drop-shadow-[0_0_8px_#22d3ee]">
            🎯 কাস্টমার প্যানেল
          </h2>

          {/* Agent Info */}
          <div className="bg-gradient-to-br from-pink-200 to-pink-100 shadow-lg rounded-xl p-4 mb-6 border border-pink-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-pink-600 text-xl font-semibold">🆔</span>
              <p className="text-base font-semibold text-gray-800">
                <span className="text-pink-700 text-xl">ID: {gamerId}</span>
              </p>
            </div>
            {/* <div className="flex items-center space-x-3">
              <span className="text-pink-600 text-xl font-semibold">👤</span>
            </div> */}
          </div>

          {/* Navigation */}
          <nav className="space-y-4 font-bangla">
            {navItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <div
                  onClick={() => setSidebarOpen(false)}
                  className={`px-5 py-3 rounded-xl border transition duration-300 font-medium tracking-wide flex items-center justify-between
          ${
            item.name === "ওয়েটিং ভাউচার - waiting Voucher"
              ? "bg-red-600 text-white border-red-700 shadow-inner"
              : pathname === item.path
              ? "bg-pink-300 text-black border-pink-500 shadow-inner"
              : "border-pink-500 text-pink-200 hover:bg-pink-400 hover:text-black"
          }
        `}
                >
                  <span>{item.name}</span>

                  {(item.count !== undefined || item.suffix) && (
                    <div className="flex items-center space-x-2">
                      {item.count !== undefined && (
                        <span
                          className={`text-xl font-bold px-3 py-1 rounded-full ${
                            item.name === "ওয়েটিং ভাউচার - waiting Voucher"
                              ? "bg-white text-red-600"
                              : "bg-pink-500 text-white"
                          }`}
                        >
                          {item.count || "0"}
                        </span>
                      )}

                      {item.suffix && (
                        <span className="text-green-600 font-bold flex items-center space-x-1">
                          <span>✓</span>
                          <span>{item.suffix}</span>
                        </span>
                      )}
                    </div>
                  )}
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
        <div className="pt-6 border-t border-pink-600 mt-6">
          <button
            onClick={() => {
              logout();
              window.location.href = "/gamer/login";
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
