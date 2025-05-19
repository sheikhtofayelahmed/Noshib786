"use client";

import { useState, useEffect } from "react";

export default function AdminGameControl() {
  const [isGameOn, setIsGameOn] = useState(false);
  const [threeUp, setThreeUp] = useState("");
  const [downGame, setDownGame] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topPlayedNumber, setTopPlayedNumber] = useState(null);

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
        setTopPlayedNumber(data);
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
      {topPlayedNumber && (
        <div className="mb-4 p-4 rounded bg-black bg-opacity-40 border border-yellow-500">
          <div className="text-lg font-bold text-yellow-400">
            🔥 Most Played Number
          </div>
          <div className="text-2xl font-extrabold font-mono bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 text-transparent bg-clip-text tracking-widest animate-pulse mt-1">
            Number:{topPlayedNumber._id} , Amount: {topPlayedNumber.totalPlayed}
          </div>
        </div>
      )}
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
