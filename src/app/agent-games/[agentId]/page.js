"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const navItems = [
  { name: "Agents", path: "/admin/agent" },
  { name: "Inactive Agents", path: "/admin/inactive-agent" },
  { name: "Game Control", path: "/admin/game-control" },
  { name: "Account", path: "/admin/account" },
];

export default function AgentGames() {
  const { agentId } = useParams();
  const pathname = usePathname();
  const [fetched, setFetched] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGameOn, setIsGameOn] = useState(null);
  const [players, setPlayers] = useState([]);
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [date, setDate] = useState("---");
  const [totalWins, setTotalWins] = useState({});
  const [agent, setAgent] = useState({});
  const [error, setError] = useState("");

  const logoutAdmin = () => {
    document.cookie = "admin-auth=; Max-Age=0; path=/";
    localStorage.removeItem("admin-auth");
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setDate(data.date);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("agentId in useEffect:", agentId);
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/getAgentById?agentId=${agentId}`);
        if (!res.ok) throw new Error("Failed to fetch agent data");

        const data = await res.json();
        setAgent(data.agent);
        console.log("Fetched agent:", data.agent.percentage);
      } catch (error) {
        console.error("Error fetching agent:", error);
      }
    };

    fetchAgent();
  }, [agentId]);

  const fetchPlayersByAgentId = async (agentId) => {
    setLoading(true);
    setFetched(false);

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
        console.error(data.message || "Failed to fetch players.");
        setPlayers([]);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      setPlayers([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const res = await fetch("/api/game-status");
        const data = await res.json();
        setIsGameOn(data.isGameOn);
      } catch (error) {
        console.error("Failed to fetch game status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStatus();
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchPlayersByAgentId(agentId);
    }
  }, [agentId]);
  useEffect(() => {
    async function fetchWins() {
      if (agentId && threeUp && downGame) {
        try {
          const res = await fetch("/api/getWinningPlays", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId, threeUp, downGame }),
          });

          if (!res.ok) throw new Error("Failed to fetch wins");

          const data = await res.json();
          setTotalWins(data.totalWins);
        } catch (err) {
          setError(err.message);
        }
      }
    }

    fetchWins();
  }, [agentId, threeUp, downGame]);

  const totalAmounts = players.reduce(
    (acc, player) => {
      acc.ThreeD += player.amountPlayed.ThreeD;
      acc.TwoD += player.amountPlayed.TwoD;
      acc.OneD += player.amountPlayed.OneD;
      return acc;
    },
    { ThreeD: 0, TwoD: 0, OneD: 0 }
  );

  const grandTotal =
    totalAmounts.ThreeD + totalAmounts.TwoD + totalAmounts.OneD;
  const getPermutations = (str) => {
    if (str.length <= 1) return [str];
    let perms = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      for (const perm of getPermutations(remaining)) {
        perms.push(char + perm);
      }
    }
    return [...new Set(perms)];
  };
  const isWinningInput = (input) => {
    const parts = input.split("=");
    const number = parts[0];
    const amounts = parts.slice(1).map(Number);
    const permutations = getPermutations(threeUp);
    const reversedDown = downGame.split("").reverse().join("");
    const sumOfDigits = threeUp
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0);
    const lastDigitOfSum = sumOfDigits % 10;

    if (number.length === 3) {
      if (number === threeUp) return true;
      if (permutations.includes(number)) {
        return amounts.length >= 2; // Rumble condition (like STR=50=60)
      }
    }

    if (number.length === 2) {
      if (number === downGame) return true;
      if (number === reversedDown) {
        return amounts.length >= 2; // Rumble condition for downGame
      }
    }

    if (number.length === 1) {
      return parseInt(number) === lastDigitOfSum;
    }

    return false;
  };

  const handleDownloadAndUpload = async () => {
    const element = document.getElementById("pdf-content");

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    const blob = pdf.output("blob");

    const formData = new FormData();
    formData.append("file", blob, `${agentId}.pdf`);
    formData.append("agentId", agentId);

    const res = await fetch("/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Uploaded to MongoDB!");
    } else {
      alert("Failed to upload");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;
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
        <button onClick={handleDownloadAndUpload} className="btn">
          Download & Upload PDF
        </button>
        {loading && <p className="text-yellow-300">⏳ Loading...</p>}
        {error && <p className="text-red-500">❌ {error}</p>}

        {!loading && fetched && players.length === 0 && (
          <p className="text-pink-400 text-2xl">
            😕 No player data found for this agent.
          </p>
        )}

        {!loading && players.length > 0 && (
          <div className="mt-8">
            <div className="mt-8 mb-8 max-w-4xl mx-auto">
              <div className="my-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md ring-2 ring-yellow-500 p-6 text-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-6 animate-pulse">
                  📊 Game & Player Summary
                </h2>

                <table className="w-full border-collapse font-mono text-sm rounded-lg overflow-hidden shadow-lg">
                  <tbody>
                    <tr className="bg-black border border-yellow-700">
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-4xl font-extrabold text-yellow-500 tracking-widest"
                      >
                        {agent?.name}
                      </td>

                      <td
                        colSpan="2"
                        className="px-6 py-4 text-xl font-bold text-white"
                      >
                        {date}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-4xl font-extrabold text-yellow-500 tracking-widest"
                      >
                        {threeUp || "XXX"}
                      </td>
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-4xl font-extrabold text-pink-500 tracking-widest"
                      >
                        {downGame || "XX"}
                      </td>
                    </tr>

                    {/* All Players Total Summary Section */}

                    <tr className="bg-green-800 text-white text-lg">
                      <th className="border border-gray-700 px-4 py-3 text-left">
                        Category
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        🎯 3D
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        🎯 2D
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        🎯 1D
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        STR
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        RUMBLE
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        DOWN
                      </th>
                      <th className="border border-gray-700 px-4 py-3 text-center">
                        SINGLE
                      </th>
                    </tr>

                    <tr className="bg-gray-800 text-green-400">
                      <td className="border border-gray-700 px-4 py-2 font-semibold">
                        Total
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.ThreeD.toFixed(0)}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.TwoD.toFixed(0)}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.OneD.toFixed(0)}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins.STR3D}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins.RUMBLE3D}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins.DOWN}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins.SINGLE}
                      </td>
                    </tr>

                    <tr className="bg-gray-800 text-green-400">
                      <td className="border border-gray-700 px-4 py-2 font-semibold">
                        % / -
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.threeD || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.twoD || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.oneD || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.str || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.rumble || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.down || 0}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {agent?.percentage?.single || 0}
                      </td>
                    </tr>

                    <tr className="bg-gray-700 text-green-400">
                      <td className="border border-gray-700 px-4 py-2 font-semibold">
                        After Deduction
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.ThreeD - agent?.percentage?.threeD}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.TwoD - agent?.percentage?.twoD}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalAmounts.OneD - agent?.percentage?.oneD}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins?.STR3D || 0 * agent?.percentage?.str}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins?.RUMBLE3D || 0 * agent?.percentage?.rumble}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins?.DOWN || 0 * agent?.percentage?.down}
                      </td>
                      <td className="border border-gray-700 px-4 py-2 text-center">
                        {totalWins?.SINGLE || 0 * agent?.percentage?.single}
                      </td>
                    </tr>

                    <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                      <td className="border border-gray-700 px-4 py-2">
                        🔢 Grand Total
                      </td>
                      <td
                        colSpan={4}
                        className="border border-gray-700 px-4 py-2"
                      >
                        Game{" "}
                        {Math.floor(
                          totalAmounts.ThreeD -
                            (agent?.percentage?.threeD || 0) +
                            (totalAmounts.TwoD -
                              (agent?.percentage?.twoD || 0)) +
                            (totalAmounts.OneD - (agent?.percentage?.oneD || 0))
                        )}
                      </td>

                      <td
                        colSpan={4}
                        className="border border-gray-700 px-4 py-2"
                      >
                        Win{" "}
                        {Math.floor(
                          totalWins.STR3D * (agent?.percentage?.str || 0) +
                            totalWins.RUMBLE3D *
                              (agent?.percentage?.rumble || 0) +
                            totalWins.DOWN * (agent?.percentage?.down || 0) +
                            totalWins.SINGLE * (agent?.percentage?.single || 0)
                        )}
                      </td>
                    </tr>

                    <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                      <td className="border border-gray-700 px-4 py-2">
                        Final{" "}
                        {Math.floor(
                          totalAmounts.ThreeD -
                            (agent?.percentage?.threeD || 0) +
                            (totalAmounts.TwoD -
                              (agent?.percentage?.twoD || 0)) +
                            (totalAmounts.OneD - (agent?.percentage?.oneD || 0))
                        ) -
                          Math.floor(
                            totalWins.STR3D * (agent?.percentage?.str || 0) +
                              totalWins.RUMBLE3D *
                                (agent?.percentage?.rumble || 0) +
                              totalWins.DOWN * (agent?.percentage?.down || 0) +
                              totalWins.SINGLE *
                                (agent?.percentage?.single || 0)
                          )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="text-2xl text-yellow-400 mb-6 font-semibold text-center">
              🎉 Player Summary 🎉
            </h3>

            <div className="space-y-6 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto pr-2">
              {players.map((player, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg shadow p-5">
                  <p className="text-yellow-300 font-bold text-xl text-center">
                    🎫 {player.voucher || "N/A"}
                  </p>
                  <div className="flex justify-between items-start mb-4">
                    {/* Player Info */}
                    <div>
                      <h4 className="text-xl font-bold mb-1">{player.name}</h4>
                      <p className="text-gray-400 text-sm">
                        Time: {new Date(player.time).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entries: {player.entries.length}
                      </p>
                    </div>

                    {/* Print Button */}
                    <div>
                      <button
                        onClick={() => window.print()}
                        className="py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 transition"
                        title="Print Player Info"
                      >
                        🖨️ Print
                      </button>
                    </div>
                  </div>

                  {/* Entries Table */}
                  <table className="w-full border-collapse text-sm font-mono mt-4">
                    <thead>
                      <tr className="bg-yellow-600 text-black">
                        <th className="border px-3 py-2 text-left">#</th>
                        <th className="border px-3 py-2 text-left">Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.entries.map((entry, entryIdx) => {
                        const isWinning = isWinningInput(entry.input);
                        return (
                          <tr
                            key={entryIdx}
                            className={`${
                              entryIdx % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                            } ${isWinning ? "winning-animation" : ""}`}
                          >
                            <td className="border px-3 py-2">{entryIdx + 1}</td>
                            <td className="border px-3 py-2">{entry.input}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary Table */}
                  <table className="w-full border-collapse text-sm font-mono mt-6">
                    <thead>
                      <tr className="bg-red-700 text-white">
                        <th className="border px-4 py-2 text-left">Category</th>
                        <th className="border px-4 py-2 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-800">
                        <td className="border px-4 py-2">🎯 3D Total</td>
                        <td className="border px-4 py-2 text-green-400">
                          {player.amountPlayed.ThreeD}
                        </td>
                      </tr>
                      <tr className="bg-gray-900">
                        <td className="border px-4 py-2">🎯 2D Total</td>
                        <td className="border px-4 py-2 text-green-400">
                          {player.amountPlayed.TwoD}
                        </td>
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border px-4 py-2">🎯 1D Total</td>
                        <td className="border px-4 py-2 text-green-400">
                          {player.amountPlayed.OneD}
                        </td>
                      </tr>
                      <tr className="bg-gray-900 font-bold text-lg">
                        <td className="border px-4 py-2">🔢 Grand Total</td>
                        <td className="border px-4 py-2 text-yellow-300">
                          {(
                            player.amountPlayed.ThreeD +
                            player.amountPlayed.TwoD +
                            player.amountPlayed.OneD
                          ).toFixed(0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
