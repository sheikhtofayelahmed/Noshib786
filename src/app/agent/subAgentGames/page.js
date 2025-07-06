"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useAgent } from "@/context/AgentContext";

const SubAgentSummary = () => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [players, setPlayers] = useState([]);
  const [agent, setAgent] = useState(null);

  const { agentId, subAgentId, loginAs } = useAgent();

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
        const filtered =
          subAgentId && loginAs !== "agent"
            ? data.players.filter((p) => String(p.SAId) === String(subAgentId))
            : data.players.sort((a, b) => parseInt(a.SAId) - parseInt(b.SAId));
        setPlayers(filtered || []);
      } else {
        console.error(data.message || "Failed to fetch players.");
        setPlayers([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setPlayers([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const fetchAgent = async () => {
    try {
      const res = await fetch(`/api/getAgentById?agentId=${agentId}`);
      if (!res.ok) {
        console.error("Agent fetch error:", res.status);
        return;
      }
      const data = await res.json();
      setAgent(data.agent);
    } catch (error) {
      console.error("Error fetching agent:", error.message);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchPlayersByAgentId(agentId);
      fetchAgent();
    }
  }, [agentId]);

  if (loading) return <p>Loading...</p>;
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;

  const groupedBySAId = players.reduce((acc, player) => {
    if (!player.SAId) return acc;
    if (!acc[player.SAId]) acc[player.SAId] = [];
    acc[player.SAId].push(player);
    return acc;
  }, {});

  const calculateDeductedTotal = (group) => {
    const base = group.reduce(
      (sum, p) => {
        const a = p.amountPlayed || {};
        return {
          OneD: sum.OneD + (a.OneD || 0),
          TwoD: sum.TwoD + (a.TwoD || 0),
          ThreeD: sum.ThreeD + (a.ThreeD || 0),
        };
      },
      { OneD: 0, TwoD: 0, ThreeD: 0 }
    );

    const p = agent?.cPercentages || { oneD: 0, twoD: 0, threeD: 0 };

    const deducted = {
      OneD: base.OneD * ((100 - p.oneD) / 100),
      TwoD: base.TwoD * ((100 - p.twoD) / 100),
      ThreeD: base.ThreeD * ((100 - p.threeD) / 100),
    };

    return {
      ...deducted,
      total: (deducted.OneD + deducted.TwoD + deducted.ThreeD).toFixed(0),
    };
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black to-red-900 text-white font-mono">
      {Object.entries(groupedBySAId)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([saId, group], groupIndex) => (
          <div key={saId} className="mb-20 max-w-4xl mx-auto">
            {agent ? (
              (() => {
                const { OneD, TwoD, ThreeD, total } =
                  calculateDeductedTotal(group);
                return (
                  <h2 className="text-3xl text-yellow-400 font-extrabold text-center mb-2">
                    🎯 {saId}-{group.length}
                    <br />
                    💰Total:
                    <span className="text-green-400 font-mono text-3xl">
                      {total}
                    </span>
                    <br />
                    <span className="text-lg text-white font-mono">
                      1D: {OneD.toFixed(0)} | 2D: {TwoD.toFixed(0)} | 3D:
                      {ThreeD.toFixed(0)}
                    </span>
                  </h2>
                );
              })()
            ) : (
              <h2 className="text-3xl text-yellow-400 font-extrabold text-center mb-2">
                🎯 {saId}-{group.length}
                <br />
                💰Total:{" "}
                <span className="text-green-400 font-mono text-3xl">—</span>
              </h2>
            )}

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
                      <th className="border px-3 py-2 text-left">Num</th>
                      <th className="border px-3 py-2 text-left">Str</th>
                      <th className="border px-3 py-2 text-left">Rumble</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.entries.map((entry, entryIdx) => (
                      <tr key={entryIdx}>
                        <td className="border px-3 py-2">{entryIdx + 1}</td>
                        <td className="border px-3 py-2 text-white font-bold">
                          {entry.input.num || ""}
                        </td>
                        <td className="border px-3 py-2 text-white font-bold">
                          {entry.input.str || ""}
                        </td>
                        <td className="border px-3 py-2 text-white font-bold">
                          {entry.input.rumble || ""}
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
                      <th className="border px-4 py-2 text-left">
                        After Deduction
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800">
                      <td className="border px-4 py-2">🎯 3D Total</td>
                      <td className="border px-4 py-2 text-green-400">
                        {player?.amountPlayed?.ThreeD ?? 0}
                      </td>
                      <td className="border px-4 py-2 text-green-400">
                        {(
                          (player?.amountPlayed?.ThreeD || 0) *
                          ((100 - (agent?.cPercentages?.threeD || 0)) / 100)
                        ).toFixed(0)}
                      </td>
                    </tr>
                    <tr className="bg-gray-900">
                      <td className="border px-4 py-2">🎯 2D Total</td>
                      <td className="border px-4 py-2 text-green-400">
                        {player?.amountPlayed?.TwoD ?? 0}
                      </td>
                      <td className="border px-4 py-2 text-green-400">
                        {(
                          (player?.amountPlayed?.TwoD || 0) *
                          ((100 - (agent?.cPercentages?.twoD || 0)) / 100)
                        ).toFixed(0)}
                      </td>
                    </tr>
                    <tr className="bg-gray-800">
                      <td className="border px-4 py-2">🎯 1D Total</td>
                      <td className="border px-4 py-2 text-green-400">
                        {player?.amountPlayed?.OneD ?? 0}
                      </td>
                      <td className="border px-4 py-2 text-green-400">
                        {(
                          (player?.amountPlayed?.OneD || 0) *
                          ((100 - (agent?.cPercentages?.oneD || 0)) / 100)
                        ).toFixed(0)}
                      </td>
                    </tr>
                    <tr className="bg-gray-900 font-bold text-lg">
                      <td colSpan={2} className="border px-4 py-2 text-center">
                        🔢 Grand Total
                      </td>
                      <td className="border px-4 py-2 text-yellow-400">
                        {(
                          ((player?.amountPlayed?.ThreeD || 0) *
                            (100 - (agent?.cPercentages?.threeD || 0))) /
                            100 +
                          ((player?.amountPlayed?.TwoD || 0) *
                            (100 - (agent?.cPercentages?.twoD || 0))) /
                            100 +
                          ((player?.amountPlayed?.OneD || 0) *
                            (100 - (agent?.cPercentages?.oneD || 0))) /
                            100
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
