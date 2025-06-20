"use client";
import AllahBhorosha from "@/components/Allah";
import { useAgent } from "@/context/AgentContext";
import { useEffect, useState } from "react";
import React from "react";

const SubAgentSummary = () => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [players, setPlayers] = useState([]);
  const { agentId } = useAgent();

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
        const sortedPlayers = (data.players || []).sort(
          (a, b) => parseInt(a.SAId) - parseInt(b.SAId)
        );
        setPlayers(sortedPlayers);
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
    if (agentId) {
      fetchPlayersByAgentId(agentId);
    }
  }, [agentId]);

  if (loading) return <p>Loading...</p>;
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;

  const groupedBySAId = players.reduce((acc, player) => {
    if (!player.SAId) return acc; // skip players with no SAId
    const key = player.SAId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(player);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black to-red-900 text-white font-mono">
      <AllahBhorosha></AllahBhorosha>
      {Object.entries(groupedBySAId)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([saId, group], groupIndex) => (
          <div key={saId} className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-3xl text-yellow-400 font-extrabold text-center mb-2">
              🎯 Sub-Agent: {saId} (Vouchers: {group.length})
            </h2>

            {group.map((player, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg border border-yellow-500 shadow p-5 mb-10"
              >
                <p className="text-yellow-300 font-bold text-xl text-center">
                  🎫 {player.voucher || "N/A"}
                </p>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold mb-1">{player.name}</h4>
                    <p className="text-gray-400 text-sm">
                      Time: {new Date(player.time).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Entries: {player.entries.length}
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse text-sm font-mono mt-4">
                  <thead>
                    <tr className="bg-yellow-600 text-white">
                      <th className="border px-3 py-2 text-left">#</th>
                      <th className="border px-3 py-2 text-left">Input</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player?.entries?.map((entry, entryIdx) => (
                      <tr key={entryIdx}>
                        <td className="border px-3 py-2">{entryIdx + 1}</td>
                        <td className="border px-3 py-2 text-white font-bold">
                          {entry.input}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                        {player?.amountPlayed?.ThreeD}
                      </td>
                    </tr>
                    <tr className="bg-gray-900">
                      <td className="border px-4 py-2">🎯 2D Total</td>
                      <td className="border px-4 py-2 text-green-400">
                        {player?.amountPlayed?.TwoD}
                      </td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="border px-4 py-2">🎯 1D Total</td>
                      <td className="border px-4 py-2 text-green-400">
                        {player?.amountPlayed?.OneD}
                      </td>
                    </tr>
                    <tr className="bg-gray-900 font-bold text-lg">
                      <td className="border px-4 py-2">🔢 Grand Total</td>
                      <td className="border px-4 py-2 text-yellow-300">
                        {(
                          player?.amountPlayed?.ThreeD +
                          player?.amountPlayed?.TwoD +
                          player?.amountPlayed?.OneD
                        ).toFixed(0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {groupIndex !== Object.keys(groupedBySAId).length - 1 && (
              <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
            )}
          </div>
        ))}
    </div>
  );
};

export default SubAgentSummary;
