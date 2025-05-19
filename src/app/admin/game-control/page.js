"use client";

import { useState, useEffect } from "react";

export default function AdminGameControl() {
  const [isGameOn, setIsGameOn] = useState(false);
  const [threeUp, setThreeUp] = useState("");
  const [downGame, setDownGame] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topPlayedNumbers, setTopPlayedNumbers] = useState([]);

  // Fetch initial game status and winning numbers
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/game-status");
        if (!res.ok) throw new Error("Failed to fetch game status");
        const data = await res.json();
        setIsGameOn(data.isGameOn);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);
  useEffect(() => {
    const fetchTopNumber = async () => {
      try {
        const res = await fetch("/api/top-numbers"); // Replace with your actual endpoint
        const data = await res.json();
        setTopPlayedNumbers(data);
      } catch (err) {
        console.error("Failed to fetch top number:", err);
      }
    };

    fetchTopNumber();
  }, []);

  const toggleGameStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGameOn: !isGameOn }),
      });
      if (!res.ok) throw new Error("Failed to update game status");
      const data = await res.json();
      setIsGameOn(data.isGameOn);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (!threeUp || !downGame || !gameDate) {
      alert("All fields are required.");
      return;
    }
    try {
      const res = await fetch("/api/update-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threeUp, downGame, date: gameDate }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Winning numbers updated successfully!");
      } else {
        alert(result.error || "Failed to update.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleMoveAll = async () => {
    const confirmed = confirm(
      "Are you sure you want to move all entries to history?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/move-entries-to-history", {
        method: "POST",
      });
      if (res.ok) {
        alert("All entries moved to history!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to move entries.");
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  };
  console.log("g", topPlayedNumbers);
  return (
    <div className="max-w-xl mx-auto mt-6 bg-gray-900 bg-opacity-90 p-6 rounded-lg ring-2 ring-red-500 text-white">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">
        🎮 Game Control Panel
      </h2>

      {/* Game On/Off */}
      <div className="flex items-center justify-between mb-4">
        <label className="font-semibold">Game Status:</label>
        <button
          className={`px-4 py-2 rounded-lg font-bold shadow-md ${
            isGameOn ? "bg-green-500" : "bg-red-600"
          }`}
          onClick={toggleGameStatus}
        >
          {isGameOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="mb-6 p-4 rounded bg-black bg-opacity-40 border border-yellow-500">
        <div className="text-lg font-bold text-yellow-400 mb-3">
          🔥 Most Played Numbers
        </div>
        <table className="w-full table-auto border border-gray-600 text-white font-mono">
          <thead>
            <tr className="bg-gray-800 text-yellow-300">
              <th className="px-4 py-2 border border-gray-600 text-left">
                Number
              </th>
              <th className="px-4 py-2 border border-gray-600 text-left">
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {topPlayedNumbers &&
              topPlayedNumbers.map((item, index) => (
                <tr
                  key={index}
                  className="bg-gray-900 hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-2 border border-gray-600 text-xl font-bold text-yellow-400">
                    {item._id}
                  </td>
                  <td className="px-4 py-2 border border-gray-600 text-xl font-bold text-pink-400">
                    {item.totalPlayed}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Winning Numbers */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">
          🎯 3UP Winning Number
        </label>
        <input
          type="text"
          maxLength={3}
          value={threeUp}
          onChange={(e) => setThreeUp(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-yellow-500 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">💥 DOWN Game Number</label>
        <input
          type="text"
          maxLength={2}
          value={downGame}
          onChange={(e) => setDownGame(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-pink-500 focus:outline-none"
        />
      </div>

      {/* Date Selector */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">🗓️ Game Date (Past)</label>
        <input
          type="date"
          value={gameDate}
          onChange={(e) => setGameDate(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-500 focus:outline-none"
        />
      </div>

      {/* Submit and Move Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded shadow"
        >
          Save Result
        </button>
        <button
          onClick={handleMoveAll}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded shadow"
        >
          Move All Entries
        </button>
      </div>
    </div>
  );
}
