"use client";
import AllahBhorosha from "@/components/Allah";
import { useAgent } from "@/context/AgentContext";
import React, { useState, useEffect } from "react";

// Assuming you have an `agentId` available in the context or passed as a prop
// For this example, let's assume it's passed as a prop.

const WaitingPlayerInput = () => {
  const [waitingPlayers, setWaitingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { agentId } = useAgent();

  useEffect(() => {
    const fetchWaitingPlayers = async () => {
      if (!agentId) {
        setError("Agent ID is missing. Cannot fetch waiting players.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors

        // Fetch data from your new API endpoint
        const response = await fetch(
          `/api/getWaitingPlayersByAgentId`, // No query params in URL
          {
            method: "POST", // Specify POST method
            headers: {
              "Content-Type": "application/json", // Tell server we're sending JSON
            },
            body: JSON.stringify({ agentId }), // Send agentId in the request body as JSON
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch waiting players: ${response.statusText}`
          );
        }

        const data = await response.json();
        setWaitingPlayers(data.players);
        // ...
      } catch (e) {
        console.error("Error fetching waiting players:", e);
        setError(
          e.message || "Failed to load waiting players. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingPlayers();

    // You might want to refetch periodically or when a new submission comes in
    // const interval = setInterval(fetchWaitingPlayers, 30000); // Refetch every 30 seconds
    // return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [agentId]); // Re-run effect if agentId changes

  if (loading) {
    return (
      <div className="text-center text-yellow-400 text-lg mt-10">
        Loading waiting player submissions...
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

  if (waitingPlayers.length === 0) {
    return (
      <div className="text-center text-gray-500 text-lg mt-10">
        No pending player submissions for this agent.
      </div>
    );
  }

  return (
    <div className="p-4">
      <AllahBhorosha></AllahBhorosha>
      <h3 className="text-2xl text-yellow-400 mb-6 font-semibold text-center">
        ⏳ Waiting Player Submissions ⏳
      </h3>

      <div className="space-y-6 max-w-4xl mx-auto max-h-[60vh] overflow-y-auto pr-2">
        {waitingPlayers.map((player, idx) => (
          <React.Fragment key={player._id || idx}>
            {" "}
            {/* Use _id for better keying if available */}
            <div className="bg-gray-800 rounded-lg border border-gray-600 shadow p-5">
              <p className="text-yellow-300 font-bold text-xl text-center mb-4">
                🎫 {player.voucher || "N/A"}
              </p>
              <div className="flex justify-between items-start mb-4">
                {/* Player Info */}
                <div>
                  <h4 className="text-xl font-bold mb-1">
                    {player.name || "Unnamed Player"}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Submitted:{" "}
                    {new Date(player.submissionTime).toLocaleString()}{" "}
                    {/* Using 'submissionTime' */}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Entries: {player.entries ? player.entries.length : 0}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Status:{" "}
                    <span className="capitalize">
                      {player.status || "unknown"}
                    </span>{" "}
                    {/* Display status */}
                  </p>
                  {player.gameStatusAtSubmission && (
                    <p className="text-gray-400 text-xs">
                      Game state at submission:{" "}
                      {player.gameStatusAtSubmission.isGameOn ? "On" : "Off"}
                      {player.gameStatusAtSubmission.targetDateTime &&
                        ` (Cutoff: ${new Date(
                          player.gameStatusAtSubmission.targetDateTime
                        ).toLocaleString()})`}
                    </p>
                  )}
                </div>
                {/* No Print Button or any other active game actions */}
              </div>

              {/* Entries Table */}
              <table className="w-full border-collapse text-sm font-mono mt-4">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="border border-gray-600 px-3 py-2 text-left">
                      #
                    </th>
                    <th
                      colSpan={3}
                      className="border border-gray-600 px-3 py-2 text-left"
                    >
                      Input
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {player?.entries?.map((entry, entryIdx) => {
                    return (
                      <tr key={entryIdx} className="bg-gray-900 text-gray-300">
                        <td className="border border-gray-600 px-3 py-1">
                          {entryIdx + 1}
                        </td>
                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.num}
                        </td>
                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.str}
                        </td>
                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.rumble}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Optional: Display amountPlayed if desired for review */}
              {player.amountPlayed && (
                <table className="w-full border-collapse text-sm font-mono mt-6">
                  <thead>
                    <tr className="bg-purple-700 text-white">
                      {/* Changed color for clarity */}
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
              )}
            </div>
            {/* Divider between players */}
            {idx !== waitingPlayers.length - 1 && (
              <div className="h-1 w-full my-8 bg-gray-700 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WaitingPlayerInput;
