"use client";
import { useEffect, useState } from "react";
import React from "react";

const PlayerAccountSummary = ({ agentId, print }) => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [isGameOn, setIsGameOn] = useState(null);
  const [players, setPlayers] = useState([]);
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [date, setDate] = useState("---");
  const [totalWins, setTotalWins] = useState({});
  const [agent, setAgent] = useState({});
  const [error, setError] = useState("");
  const [moneyCal, setMoneyCal] = useState({});

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

        // Check status and log for debug
        if (!res.ok) {
          const text = await res.text();
          console.error("Response not OK:", res.status, text);
          throw new Error("Failed to fetch agent data");
        }

        const data = await res.json();
        setAgent(data.agent);
        console.log("Fetched agent:", data.agent.percentage);
      } catch (error) {
        console.error("Error fetching agent:", error.message);
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

  const getPermutations = (str) => {
    if (!str || str.length <= 1) return [str || ""];
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

  const getMatchType = (input, threeUp, downGame) => {
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
      if (number === threeUp) {
        return { match: true, type: "str" };
      }
      if (permutations.includes(number) && amounts.length >= 2) {
        return { match: true, type: "rumble" };
      }
    }

    if (number.length === 2) {
      if (number === downGame) {
        return { match: true, type: "down" };
      }
      if (number === reversedDown && amounts.length >= 2) {
        return { match: true, type: "rumble" };
      }
    }

    if (number.length === 1) {
      if (parseInt(number) === lastDigitOfSum) {
        return { match: true, type: "single" };
      }
    }

    return { match: false, type: null };
  };

  useEffect(() => {
    if (totalWins && agent.percentage) {
      const totalAmounts = players.reduce(
        (acc, player) => {
          acc.ThreeD += player.amountPlayed.ThreeD;
          acc.TwoD += player.amountPlayed.TwoD;
          acc.OneD += player.amountPlayed.OneD;
          return acc;
        },
        { ThreeD: 0, TwoD: 0, OneD: 0 }
      );
      const afterThreeD = Math.floor(
        totalAmounts.ThreeD * (1 - agent.percentage.threeD / 100)
      );
      const afterTwoD = Math.floor(
        totalAmounts.TwoD * (1 - agent.percentage.twoD / 100)
      );
      const afterOneD = Math.floor(
        totalAmounts.OneD * (1 - agent.percentage.oneD / 100)
      );
      const afterSTR = Math.floor(totalWins.STR3D * agent.percentage.str);
      const afterRUMBLE = Math.floor(
        totalWins.RUMBLE3D * agent.percentage.rumble
      );
      const afterDOWN = Math.floor(totalWins.DOWN * agent.percentage.down);
      const afterSINGLE = Math.floor(
        totalWins.SINGLE * agent.percentage.single
      );

      const totalGame = afterThreeD + afterTwoD + afterOneD;
      const totalWin = afterSTR + afterRUMBLE + afterDOWN + afterSINGLE;

      // Example: log or update state
      console.log("Total Game:", totalGame);
      console.log("Total Win:", totalWin);
      setMoneyCal({
        afterThreeD,
        afterTwoD,
        afterOneD,
        afterSTR,
        afterRUMBLE,
        afterDOWN,
        afterSINGLE,
        totalGame,
        totalWin,
        totalAmounts,
      });
    }
  }, [totalWins, agent.percentage]);
  if (loading) return <p>Loading...</p>;
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black to-red-900 text-white font-mono">
      {loading && (
        <p className="text-yellow-300 mt-6">⏳ Loading player data...</p>
      )}

      {!loading && fetched && players.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-pink-400 text-3xl font-bold text-center">
            😕 No player data found for this agent.
          </p>
        </div>
      )}
      {!loading && players.length > 0 && (
        <div className="mt-8">
          <div className="overflow-x-auto mt-8 mb-8 max-w-4xl mx-auto">
            <div className="overflow-x-auto my-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md ring-2 ring-yellow-500 p-6 text-center">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 animate-pulse">
                📊 Game & Player Summary
              </h2>

              <table className="overflow-x-auto w-full border-collapse font-mono text-sm rounded-lg overflow-hidden shadow-lg">
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
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      STR
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      RUMBLE
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      DOWN
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      SINGLE
                    </th>
                  </tr>

                  <tr className="bg-gray-800 text-green-400">
                    <td className="border border-gray-700 px-4 py-2 font-semibold">
                      Total
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.totalAmounts.ThreeD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.totalAmounts.TwoD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.totalAmounts.OneD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins.STR3D || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500 ">
                      {totalWins.RUMBLE3D || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins.DOWN || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins.SINGLE || 0}
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
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.str || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.rumble || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.down || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.single || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-700 text-green-400">
                    <td className="border border-gray-700 px-4 py-2 font-semibold">
                      After Deduction
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.afterThreeD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.afterTwoD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal.afterOneD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal.afterSTR || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal.afterRUMBLE || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal.afterDOWN || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal.afterSINGLE || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-900 font-bold text-lg text-white">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2"
                    >
                      Total Game{" "}
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 "
                    >
                      {moneyCal.totalGame || 0}
                    </td>
                    <td colSpan={3} className="border border-gray-700 "></td>
                    <td colSpan={1} className="border border-gray-700 "></td>
                  </tr>

                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-yellow-300"
                    >
                      Total Win
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-yellow-300"
                    >
                      {moneyCal.totalWin || 0}
                    </td>
                    <td colSpan={3} className="border border-gray-700 "></td>
                    <td colSpan={1} className="border border-gray-700 "></td>
                  </tr>
                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-red-400"
                    >
                      এডমিন পাবে
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-red-400"
                    >
                      {moneyCal.totalGame - moneyCal.totalWin >= 0
                        ? moneyCal.totalGame - moneyCal.totalWin
                        : 0}
                    </td>
                    <td colSpan={3} className="border border-gray-700 "></td>
                    <td colSpan={1} className="border border-gray-700 "></td>
                  </tr>
                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-white"
                    >
                      এজেন্ট পাবে
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-white"
                    >
                      {moneyCal.totalWin - moneyCal.totalGame >= 0
                        ? moneyCal.totalWin - moneyCal.totalGame
                        : 0}
                    </td>
                    <td colSpan={3} className="border border-gray-700 "></td>
                    <td colSpan={1} className="border border-gray-700 "></td>
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
              <React.Fragment key={idx}>
                <div
                  key={idx}
                  className="bg-gray-800 rounded-lg border border-yellow-500 shadow p-5"
                >
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
                      {print && (
                        <button
                          onClick={() => window.print()}
                          className="py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 transition"
                          title="Print Player Info"
                        >
                          🖨️ Print
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Entries Table */}
                  <table className="w-full border-collapse text-sm font-mono mt-4">
                    <thead>
                      <tr className="bg-yellow-600 text-white">
                        <th className="border px-3 py-2 text-left">#</th>
                        <th className="border px-3 py-2 text-left">Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.entries.map((entry, entryIdx) => {
                        const { match, type } = getMatchType(
                          entry.input,
                          threeUp,
                          downGame
                        );
                        const parts = entry.input.split("=");
                        const number = parts[0];
                        const amounts = parts.slice(1);

                        return (
                          <tr key={entryIdx}>
                            <td className="border px-3 py-2">{entryIdx + 1}</td>
                            <td className="border px-3 py-2">
                              <span
                                className={
                                  match && "text-yellow-300 font-bold text-xl "
                                }
                              >
                                {number}
                              </span>
                              {amounts.map((amt, i) => {
                                const highlightAll =
                                  type === "str" || type === "down";
                                const highlightOne =
                                  type === "rumble" || type === "single";

                                const shouldHighlight =
                                  (highlightAll && match) ||
                                  (highlightOne &&
                                    match &&
                                    i === amounts.length - 1);

                                return (
                                  <span key={i}>
                                    {"="}
                                    <span
                                      className={
                                        shouldHighlight &&
                                        "text-yellow-300 font-bold text-xl "
                                      }
                                    >
                                      {amt}
                                    </span>
                                  </span>
                                );
                              })}
                            </td>
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
                {idx !== players.length - 1 && (
                  <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAccountSummary;
