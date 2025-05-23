"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Agents", path: "/admin/agent" },
  { name: "Inactive Agents", path: "/admin/inactive-agent" },
  { name: "Game Control", path: "/admin/game-control" },
  { name: "Account", path: "/admin/account" },
];

export default function AgentGames() {
  const { agentId } = useParams();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");

  const logoutAdmin = () => {
    document.cookie = "admin-auth=; Max-Age=0; path=/";
    localStorage.removeItem("admin-auth");
    window.location.href = "/admin/login";
  };

  const fetchGames = async (agentId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/getPlayersByAgentId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlayers(data.players || []);
      } else {
        setError(data.message || "Failed to fetch games");
      }
    } catch {
      setError("Failed to fetch games");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    if (agentId) fetchGames(agentId);
  }, [agentId]);

  const totalAmounts = players.reduce(
    (acc, player) => {
      acc.ThreeD += player.amountPlayed?.ThreeD || 0;
      acc.TwoD += player.amountPlayed?.TwoD || 0;
      acc.OneD += player.amountPlayed?.OneD || 0;
      return acc;
    },
    { ThreeD: 0, TwoD: 0, OneD: 0 }
  );

  const grandTotal =
    totalAmounts.ThreeD + totalAmounts.TwoD + totalAmounts.OneD;

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
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold text-yellow-300 mb-6">
          🎮 Games by Agent
        </h2>

        {loading && <p className="text-yellow-300">⏳ Loading...</p>}
        {error && <p className="text-red-500">❌ {error}</p>}

        {!loading && fetched && players.length === 0 && (
          <p className="text-pink-400 text-2xl">
            😕 No player data found for this agent.
          </p>
        )}

        {!loading && players.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-yellow-500 transition-shadow">
                <h3 className="text-green-400 font-semibold mb-2">
                  🎯 3D Total
                </h3>
                <p className="text-3xl font-bold">
                  {totalAmounts.ThreeD.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-green-400 transition-shadow">
                <h3 className="text-green-400 font-semibold mb-2">
                  🎯 2D Total
                </h3>
                <p className="text-3xl font-bold">
                  {totalAmounts.TwoD.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-green-400 transition-shadow">
                <h3 className="text-green-400 font-semibold mb-2">
                  🎯 1D Total
                </h3>
                <p className="text-3xl font-bold">
                  {totalAmounts.OneD.toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-600 p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2 text-black">
                  🔢 Grand Total
                </h3>
                <p className="text-3xl font-bold text-black">
                  {grandTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <h3 className="text-2xl text-yellow-400 font-semibold mb-6">
              🎉 Player Summary 🎉
            </h3>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {players.map((player, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg shadow p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{player.name}</h4>
                      <p className="text-yellow-300">
                        Voucher:{" "}
                        <span className="font-mono">
                          {player.voucher || "N/A"}
                        </span>
                      </p>
                      <p className="text-gray-400 text-sm">
                        Time: {new Date(player.time).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entries: {player.entries.length}
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 transition"
                      title="Print Player Info"
                    >
                      🖨️ Print
                    </button>
                  </div>

                  <table className="w-full border-collapse text-sm font-mono rounded overflow-hidden">
                    <thead>
                      <tr className="bg-yellow-600 text-black">
                        <th className="border px-3 py-2 text-left">#</th>
                        <th className="border px-3 py-2 text-left">Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.entries.map((entry, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                          }
                        >
                          <td className="border px-3 py-2">{i + 1}</td>
                          <td className="border px-3 py-2">{entry.input}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4">
                    <table className="w-full border-collapse font-mono text-sm rounded overflow-hidden">
                      <thead>
                        <tr className="bg-red-700 text-white">
                          <th className="border px-4 py-2 text-left">
                            Category
                          </th>
                          <th className="border px-4 py-2 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-800">
                          <td className="border px-4 py-2">🎯 3D Total</td>
                          <td className="border px-4 py-2 text-green-400">
                            {player.amountPlayed?.ThreeD || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-2">🎯 2D Total</td>
                          <td className="border px-4 py-2 text-green-400">
                            {player.amountPlayed?.TwoD || 0}
                          </td>
                        </tr>
                        <tr className="bg-gray-800">
                          <td className="border px-4 py-2">🎯 1D Total</td>
                          <td className="border px-4 py-2 text-green-400">
                            {player.amountPlayed?.OneD || 0}
                          </td>
                        </tr>
                        <tr className="bg-gray-900 font-bold text-lg">
                          <td className="border px-4 py-2">🔢 Grand Total</td>
                          <td className="border px-4 py-2 text-yellow-300">
                            {(
                              (player.amountPlayed?.ThreeD || 0) +
                              (player.amountPlayed?.TwoD || 0) +
                              (player.amountPlayed?.OneD || 0)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
