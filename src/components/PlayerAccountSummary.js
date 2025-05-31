"use client";
import { useEffect, useState } from "react";

const PlayerAccountSummary = ({ agentId }) => {
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

  useEffect(() => {
    if (totalWins && agent.percentage) {
      const afterThreeD = totalAmounts.ThreeD - agent.percentage.threeD;
      const afterTwoD = totalAmounts.TwoD - agent.percentage.twoD;
      const afterOneD = totalAmounts.OneD - agent.percentage.oneD;
      const afterSTR = totalWins.STR3D * agent.percentage.str;
      const afterRUMBLE = totalWins.RUMBLE3D * agent.percentage.rumble;
      const afterDOWN = totalWins.DOWN * agent.percentage.down;
      const afterSINGLE = totalWins.SINGLE * agent.percentage.single;

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
                      {totalAmounts.ThreeD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {totalAmounts.TwoD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {totalAmounts.OneD.toFixed(0)}
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
                    <td className="border border-gray-700 px-4 py-2">
                      Total Game{" "}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 ">
                      {moneyCal.totalGame || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td className="border border-gray-700 px-4 py-2 text-yellow-300">
                      Total Win
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-yellow-300">
                      {moneyCal.totalWin || 0}
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
    </div>
  );
};

export default PlayerAccountSummary;
