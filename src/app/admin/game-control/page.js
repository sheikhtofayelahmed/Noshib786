"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

export default function AdminGameControl() {
  const [isGameOn, setIsGameOn] = useState(false);
  const [threeUp, setThreeUp] = useState("");
  const [downGame, setDownGame] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topPlayedNumbers, setTopPlayedNumbers] = useState([]);
  const [targetDateTime, setTargetDateTime] = useState("");

  // Function to open the Voucher Modal

  const [countdown, setCountdown] = useState(null);
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
  // useEffect(() => {
  //   const fetchTopNumber = async () => {
  //     try {
  //       const res = await fetch("/api/top-numbers"); // Replace with your actual endpoint
  //       const data = await res.json();
  //       setTopPlayedNumbers(data);
  //     } catch (err) {
  //       console.error("Failed to fetch top number:", err);
  //     }
  //   };

  //   fetchTopNumber();
  // }, []);

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
  const handleCountdown = async () => {
    if (!targetDateTime) {
      setError("Please select a valid date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDateTime }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to submit date and time.");
      } else {
        alert("Game start date & time updated successfully!");
      }
    } catch (err) {
      setError("An error occurred while submitting.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    console.log(threeUp, downGame, gameDate);
    if (
      threeUp === "" ||
      downGame === "" ||
      gameDate === "" ||
      threeUp.length !== 3 ||
      downGame.length !== 2
    ) {
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
  const handleDelete = async () => {
    try {
      const res = await fetch("/api/delete-win", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threeUp: "", downGame: "", date: "" }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Game reset successfully!");
        setThreeUp("");
        setDownGame(" ");
        setGameDate("");
      } else {
        alert(result.error || "Failed to update.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setGameDate(data.date);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);
  const handleMoveAll = async () => {
    const confirmed = confirm(
      "Are you sure you want to move all entries to history?"
    );
    if (!confirmed) return;
    try {
      const res = await fetch("/api/move-entries-to-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: gameDate, threeUp, downGame }),
      });
      if (res.ok) {
        alert("All entries moved to history!");
        handleDelete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to move entries.");
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-gray-900 bg-opacity-90 p-6 rounded-lg ring-2 ring-red-500 text-white space-y-6">
      <h2 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
        🎮 Game Control Panel
      </h2>

      {/* 📦 Table 1: Game Start Controls */}
      <div className="space-y-4 border border-gray-700 p-4 rounded-lg bg-gray-800 bg-opacity-60">
        {/* Game On/Off */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <label className="font-semibold mb-1 sm:mb-0">Game Status:</label>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold shadow-md ${
              isGameOn ? "bg-green-500" : "bg-red-600"
            }`}
            onClick={toggleGameStatus}
          >
            {isGameOn ? "ON" : "OFF"}
          </button>
        </div>

        {/* Game Start Date/Time */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex flex-col w-full">
            <label className="font-bangla block mb-1 font-semibold text-yellow-400">
              🗓️ এন্ট্রি দেওয়ার শেষ সময়
            </label>

            <DatePicker
              selected={targetDateTime}
              onChange={(date) => setTargetDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              className="px-4 py-2 rounded bg-gray-800 border border-gray-500 text-white"
            />
          </div>
          <button
            onClick={handleCountdown}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* 🧾 Table 2: Result Controls */}
      <div className="space-y-4 border border-gray-700 p-4 rounded-lg bg-gray-800 bg-opacity-60">
        {/* 3UP Winning Number */}
        <div>
          <label className="block mb-1 font-semibold">
            🎯 3UP Winning Number
          </label>
          <input
            type="text"
            value={threeUp}
            onChange={(e) => setThreeUp(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-yellow-500 focus:outline-none"
          />
        </div>

        {/* DOWN Number */}
        <div>
          <label className="block mb-1 font-semibold">
            💥 DOWN Game Number
          </label>
          <input
            type="text"
            value={downGame}
            onChange={(e) => setDownGame(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-pink-500 focus:outline-none"
          />
        </div>

        {/* Game Date */}
        <div>
          <label className="font-bangla block mb-1 font-semibold">
            🗓️ গেমের তারিখ
          </label>
          <DatePicker
            selected={gameDate}
            onChange={(date) => setGameDate(date)}
            dateFormat="dd/MM/yyyy"
            className="px-4 py-2 rounded bg-gray-800 border border-gray-500 text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 mx-1 rounded shadow w-full sm:w-auto"
          >
            Save
          </button>

          <div />
          <button
            onClick={() => {
              const confirmation = prompt(
                "⚠️ To confirm deletion, please type 'Delete'"
              );

              if (confirmation === "Delete") {
                handleMoveAll();
              } else if (confirmation !== null) {
                alert(
                  "❌ Deletion canceled. You did not type 'Delete' correctly."
                );
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded shadow w-full sm:w-auto"
          >
            Delete Game
          </button>
        </div>
      </div>
    </div>
  );
}
