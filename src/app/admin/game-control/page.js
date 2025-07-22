"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminGameControl() {
  const [isGameOn, setIsGameOn] = useState(false);
  const [threeUp, setThreeUp] = useState("");
  const [downGame, setDownGame] = useState("");
  const [gameDate, setGameDate] = useState(null);
  const [winStatus, setWinStatus] = useState(false);
  const [targetDateTime, setTargetDateTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ type: "", message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        setLoading(true);

        const [statusRes, dataRes] = await Promise.all([
          fetch("/api/game-status"),
          fetch("/api/win-status"),
        ]);

        if (!statusRes.ok) throw new Error("Failed to fetch game status");
        if (!dataRes.ok) throw new Error("Failed to fetch game data");

        const statusData = await statusRes.json();
        const gameData = await dataRes.json();
        setIsGameOn(statusData.isGameOn);
        setThreeUp(gameData.threeUp);
        setDownGame(gameData.downGame);
        setGameDate(gameData.gameDate);
        setWinStatus(gameData.winStatus);
        setTargetDateTime(new Date(statusData.targetDateTime));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameInfo();
  }, []);

  const toggleGameStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGameOn: !isGameOn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to update game status");
      setIsGameOn(data.isGameOn);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const toggleWinStatus = async () => {
    if (!gameDate || typeof winStatus !== "boolean") {
      alert("Game date and win status are required.");
      return;
    }

    try {
      const res = await fetch("/api/update-winStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameDate, // should be UTC formatted
          winStatus: !winStatus,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Win status updated successfully!");
        setWinStatus(result.updated.winStatus);
      } else {
        alert(result.error || "Failed to update win status.");
      }
    } catch (error) {
      console.error("Win status update error:", error);
    }
  };
  const handleCountdown = async () => {
    if (!targetDateTime) {
      setError("Please select a valid date and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDateTime: targetDateTime.toISOString() }), // Always UTC
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to submit date and time.");
      } else {
        alert("Game start date & time updated successfully!");
      }
    } catch (err) {
      setError("An error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (
      !threeUp ||
      !downGame ||
      !gameDate ||
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
        body: JSON.stringify({
          threeUp,
          downGame,
          gameDate, // Store UTC
          winStatus: true,
        }),
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
        setDownGame("");
        setGameDate(null);
      } else {
        alert(result.error || "Failed to reset.");
      }
    } catch (error) {
      console.error("Delete error:", error);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: gameDate,
          threeUp,
          downGame,
        }),
      });

      if (res.ok) {
        alert("All entries moved to history!");
        // handleDelete();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to move entries.");
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  };
  const handleCalculate = async () => {
    if (!threeUp || !downGame || !gameDate) {
      setToast({ type: "error", message: "All fields are required." });
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to proceed with the calculation?"
    );
    if (!confirmed) return;

    setSubmitting(true);
    setToast({ type: "", message: "" });
    try {
      const res = await fetch("/api/calculate-all-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threeUp,
          downGame,
          gameDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Calculation failed");

      setToast({
        type: "success",
        message: `✅ ${data.summaries.length} summaries generated.`,
      });
      handleSubmit();
      setThreeUp("");
      setDownGame("");
      setGameDate(null);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unexpected error." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-gray-900 bg-opacity-90 p-6 rounded-lg ring-2 ring-red-500 text-white space-y-6">
      <h2 className="text-2xl font-bold text-yellow-400 text-center mb-2">
        🎮 Game Control Panel
      </h2>

      {toast.message && (
        <div
          className={`rounded mt-4 p-3 text-sm font-semibold ${
            toast.type === "success"
              ? "bg-green-700 text-green-100 border border-green-400"
              : "bg-red-700 text-red-100 border border-red-400"
          }`}
        >
          {toast.message}
        </div>
      )}
      {/* Game Controls */}
      <div className="space-y-4 border border-gray-700 p-4 rounded-lg bg-gray-800 bg-opacity-60">
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
            {loading ? (
              "..."
            ) : (
              <span className="text-green-800 font-semibold">Save</span>
            )}
          </button>
        </div>
      </div>

      {/* Result Controls */}
      <div className="space-y-4 border border-gray-700 p-4 rounded-lg bg-gray-800 bg-opacity-60">
        <div>
          <label className="block mb-1 font-semibold">
            🎯 3UP Winning Number
          </label>
          <input
            type="text"
            value={threeUp}
            onChange={(e) => setThreeUp(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-yellow-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">
            💥 DOWN Game Number
          </label>
          <input
            type="text"
            value={downGame}
            onChange={(e) => setDownGame(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-pink-500"
          />
        </div>

        <div className="flex items-start justify-between">
          <div>
            <label className="font-bangla block mb-1 font-semibold">
              🗓️ গেমের তারিখ
            </label>
            <input
              type="text"
              value={gameDate || ""}
              onChange={(e) => setGameDate(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="px-4 py-2 rounded bg-gray-800 border border-gray-500 text-white"
            />
          </div>
          <button
            className={`m-6 w-full sm:w-auto px-4 py-2 rounded-lg font-bold shadow-md ${
              winStatus ? "bg-green-500" : "bg-red-600"
            }`}
            onClick={toggleWinStatus}
          >
            {winStatus ? <Eye></Eye> : <EyeOff></EyeOff>}
          </button>
          <button
            onClick={handleSubmit}
            className={
              "ml-6 mt-6 w-full sm:w-auto px-6 py-2 font-bold rounded shadow transition bg-green-500 hover:bg-lime-500 text-black"
            }
          >
            Save Game
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
          <button
            onClick={handleCalculate}
            disabled={submitting}
            className={`mt-6 w-full sm:w-auto px-6 py-2 font-bold rounded shadow transition ${
              submitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-lime-500 text-black"
            }`}
          >
            {submitting ? "Calculating..." : "Calculate All Agents"}
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
            End Game
          </button>
        </div>
      </div>
    </div>
  );
}
