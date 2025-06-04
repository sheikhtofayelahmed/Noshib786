"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb"; // adjust path if needed

const navItems = [
  { name: "Game Control", path: "/admin/game-control" },
  { name: "Inactive Agent", path: "/admin/inactive-agent" },
  { name: "Agent", path: "/admin/agent" },
  { name: "Account", path: "/admin/account" },
  { name: "Happy New Year", path: "/admin/HappyNewYear" },
  { name: "Waiting Data", path: "/admin/waitingData" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            🎰 Game Admin
          </h2>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
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

        <div className="pt-6 border-t border-yellow-600 mt-6">
          <button
            onClick={logoutAdmin}
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
