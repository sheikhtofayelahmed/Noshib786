// src/components/AdminApprovalDashboard.jsx
"use client";
import React, { useState, useEffect } from "react";

const AdminApprovalDashboard = () => {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // To disable buttons during processing

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
      // Group by agentId
      const grouped = data.reduce((acc, player) => {
        const agentId = player.agentId || "Unknown Agent";
        if (!acc[agentId]) acc[agentId] = [];
        acc[agentId].push(player);
        return acc;
      }, {});

      // Convert to an array of [agentId, players[]] and sort by agentId
      const groupedArray = Object.entries(grouped).sort(([a], [b]) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );

      setPendingPlayers(groupedArray);
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
    fetchPendingPlayers();
  }, []);

  // Function to handle player approval
  const handleApprove = async (player) => {
    setProcessingId(player._id); // Set processing state for this player
    try {
      const response = await fetch("/api/approvePlayer", {
        // New API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to approve player: ${response.statusText}`
        );
      }

      alert(
        `✅ Player ${
          player.name || player.voucher
        } approved and moved to primary.`
      );
      fetchPendingPlayers(); // Re-fetch list to remove approved player
    } catch (e) {
      console.error("Error approving player:", e);
      alert(`❌ Error approving player: ${e.message}`);
    } finally {
      setProcessingId(null); // Clear processing state
    }
  };

  // Function to handle player rejection
  const handleReject = async (player) => {
    setProcessingId(player._id); // Set processing state for this player
    try {
      const response = await fetch("/api/rejectPlayer", {
        // New API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player._id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to reject player: ${response.statusText}`
        );
      }

      alert(`🚫 Player ${player.name || player.voucher} rejected.`);
      fetchPendingPlayers(); // Re-fetch list to remove rejected player
    } catch (e) {
      console.error("Error rejecting player:", e);
      alert(`❌ Error rejecting player: ${e.message}`);
    } finally {
      setProcessingId(null); // Clear processing state
    }
  };

  if (loading) {
    return (
      <div className="text-center text-yellow-400 text-lg mt-10">
        Loading pending player submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg mt-10">
        Error: {error}
      </div>
    );
  }

  if (pendingPlayers.length === 0) {
    return (
      <div className="text-center text-gray-500 text-lg mt-10">
        No pending player submissions for review.
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen text-white">
      <h3 className="text-3xl text-yellow-400 mb-8 font-extrabold text-center">
        👑 Admin Approval Dashboard 👑
      </h3>

      <div className="space-y-8 max-w-5xl mx-auto">
        {pendingPlayers.map(([agentId, players]) => (
          <div key={agentId}>
            <h4 className="text-2xl font-bold text-center mb-4 text-pink-400">
              Agent ID: {agentId}
            </h4>

            {players.map((player) => (
              <div
                key={player._id}
                className="bg-gray-800 rounded-xl border border-yellow-600 shadow-2xl p-6 relative mb-8"
              >
                {processingId === player._id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 rounded-xl">
                    <p className="text-yellow-400 text-xl font-bold animate-pulse">
                      Processing...
                    </p>
                  </div>
                )}
                <p className="text-yellow-300 font-bold text-2xl text-center mb-4">
                  🎫 {player.voucher || "N/A"}
                </p>
                <div className="flex justify-between items-start mb-5">
                  {/* Player Info */}
                  <div>
                    <h4 className="text-2xl font-bold mb-2">
                      {player.name || "Unnamed Player"}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Submitted:{" "}
                      {player.submissionTime
                        ? new Date(player.submissionTime).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Entries:{" "}
                      {Array.isArray(player.entries)
                        ? player.entries.length
                        : 0}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Status:{" "}
                      <span className="capitalize font-semibold text-blue-400">
                        {player.status || "unknown"}
                      </span>
                    </p>
                    {player.gameStatusAtSubmission && (
                      <p className="text-gray-400 text-xs mt-1">
                        Game state at submission:{" "}
                        <span
                          className={
                            player.gameStatusAtSubmission.isGameOn
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {player.gameStatusAtSubmission.isGameOn
                            ? "On"
                            : "Off"}
                        </span>
                        {player.gameStatusAtSubmission.targetDateTime &&
                          ` (Cutoff: ${new Date(
                            player.gameStatusAtSubmission.targetDateTime
                          ).toLocaleString()})`}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => handleApprove(player)}
                      disabled={processingId === player._id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => handleReject(player)}
                      disabled={processingId === player._id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ❌
                    </button>
                  </div>
                </div>

                {/* Entries Table */}
                <h5 className="text-xl font-semibold mb-3 text-yellow-200">
                  Player Entries:
                </h5>
                <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-lg border border-gray-700">
                  <table className="w-full border-collapse text-sm font-mono">
                    <thead>
                      <tr className="bg-gray-700 text-white sticky top-0 z-10">
                        <th className="border border-gray-600 px-3 py-2 text-left w-1/12">
                          #
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-left w-11/12">
                          Input
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(player.entries) &&
                      player.entries.length > 0 ? (
                        player.entries.map((entry, entryIdx) => {
                          const parts = entry?.input?.split?.(".") || [
                            "Invalid input",
                          ];
                          const number = parts[0];
                          const amounts = parts.slice(1);

                          return (
                            <tr
                              key={entryIdx}
                              className="bg-gray-900 text-gray-300 hover:bg-gray-700 transition duration-150"
                            >
                              <td className="border border-gray-700 px-3 py-2">
                                {entryIdx + 1}
                              </td>
                              <td className="border border-gray-700 px-3 py-2">
                                <span className="text-white">{number}</span>
                                {amounts.map((amt, i) => (
                                  <span key={i}>
                                    {"."}
                                    <span>{amt}</span>
                                  </span>
                                ))}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="text-center text-gray-500 px-3 py-2 border border-gray-700"
                          >
                            No entries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Amount Played Summary */}
                {player.amountPlayed && (
                  <>
                    <h5 className="text-xl font-semibold mb-3 mt-6 text-yellow-200">
                      Amount Summary:
                    </h5>
                    <table className="w-full border-collapse text-sm font-mono">
                      <thead>
                        <tr className="bg-purple-700 text-white">
                          <th className="border px-4 py-2 text-left">
                            Category
                          </th>
                          <th className="border px-4 py-2 text-left">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["ThreeD", "TwoD", "OneD"].map((key, i) => (
                          <tr
                            key={key}
                            className={
                              i % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                            }
                          >
                            <td className="border px-4 py-2">
                              🎯 {key.replace("D", "D Total")}
                            </td>
                            <td className="border px-4 py-2 text-green-400">
                              {player.amountPlayed[key] ?? 0}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-900 font-bold text-lg">
                          <td className="border px-4 py-2">🔢 Grand Total</td>
                          <td className="border px-4 py-2 text-yellow-300">
                            {(
                              (player.amountPlayed.ThreeD ?? 0) +
                              (player.amountPlayed.TwoD ?? 0) +
                              (player.amountPlayed.OneD ?? 0)
                            ).toFixed(0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApprovalDashboard;
