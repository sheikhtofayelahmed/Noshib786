"use client";
import React from "react";

import { useState, useEffect } from "react";
import { useAgent } from "src/context/AgentContext";

export default function PlayerInput() {
  const [name, setName] = useState("");
  const [SAId, setSAId] = useState("");
  const [inputs, setInputs] = useState(Array(20).fill(""));
  const [errors, setErrors] = useState(Array(20).fill(false));
  const [players, setPlayers] = useState([]);
  const [submittedPlayers, setSubmittedPlayers] = useState([]);
  const [amountPlayed, setAmountPlayed] = useState({});
  const { agentId } = useAgent();
  const [targetTime, setTargetTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");
  const [isGameOn, setIsGameOn] = useState(null);
  const [isCompleted, setIsCompleted] = useState(true);
  const [print, setPrint] = useState(false);

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const res = await fetch("/api/game-status");
        if (!res.ok) throw new Error("Failed to fetch game status");
        const data = await res.json();
        if (data.isGameOn) {
          setIsGameOn(true);
        }
        if (data.targetDateTime) {
          setTargetTime(new Date(data.targetDateTime));
        } else {
          setError("No countdown date set.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTarget();
  }, []);

  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft("The game has ended!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);
  // At the top of your component
  useEffect(() => {
    let total1D = 0,
      total2D = 0,
      total3D = 0;

    players.forEach((player) => {
      player.data.forEach((entry) => {
        const parts = entry.input.split(".");
        const num = parts[0];
        const amounts = parts
          .slice(1)
          .map(Number)
          .filter((n) => !isNaN(n));

        if (/^\d$/.test(num)) {
          total1D += amounts.reduce((a, b) => a + b, 0);
        } else if (/^\d{2}$/.test(num)) {
          total2D += amounts.reduce((a, b) => a + b, 0);
        } else if (/^\d{3}$/.test(num)) {
          total3D += amounts.reduce((a, b) => a + b, 0);
        }
      });
    });

    setAmountPlayed({ OneD: total1D, TwoD: total2D, ThreeD: total3D });
  }, [players]); // ✅ Run when players changes

  const handleInputChange = (index, value) => {
    setInputs(inputs.map((inp, i) => (i === index ? value : inp)));
    setErrors(errors.map((err, i) => (i === index ? false : err)));
  };

  const validateEntry = (input) => {
    if (!input) return true; // allow empty
    // if (!/^[\d=]+$/.test(input)) return false;
    if (!/^[\d.]+$/.test(input)) return false;
    if (input.startsWith(".")) return false;

    const parts = input.split(".");
    const first = parts[0];

    if (/^\d$/.test(first)) {
      // 1-digit number
      return parts.length === 2 && parts[1].length > 0;
    } else if (/^\d{2,3}$/.test(first)) {
      // Reject if first is '000'
      if (first === "000") return false;
      // 2 or 3-digit number
      return (
        parts.length >= 2 &&
        parts.length <= 3 &&
        parts.slice(1).every((p) => p.length > 0)
      );
    }

    return false;
  };

  const handleSavePlayer = () => {
    const newErrors = inputs.map((input) => !validateEntry(input));

    if (newErrors.includes(true)) {
      setErrors(newErrors);
      return;
    }

    const validEntries = inputs.filter((i) => i.trim() !== "");

    const newEntries = validEntries.map((input, i) => ({
      id: Date.now() + i,
      serial: i + 1,
      input,
      isEditing: false,
      editValue: input,
      editError: false,
    }));

    const voucher = `${agentId}-${Math.floor(Math.random() * 10000)}`;

    const newPlayer = {
      name,
      SAId,
      time: new Date().toLocaleString(),
      voucher: voucher,
      data: newEntries,
    };

    setPlayers([newPlayer, ...players]);
    setName("");
    setInputs(Array(20).fill(""));
    setErrors(Array(20).fill(false));
    setIsCompleted(false);
  };

  const handleAddInputs = () => {
    setInputs([...inputs, ...Array(20).fill("")]);
    setErrors([...errors, ...Array(20).fill(false)]);
  };

  const handleEdit = (playerIdx, entryIdx) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((entry, j) =>
                j === entryIdx ? { ...entry, isEditing: true } : entry
              ),
            }
          : player
      )
    );
  };

  const handleEditChange = (playerIdx, entryIdx, value) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((entry, j) =>
                j === entryIdx
                  ? { ...entry, editValue: value, editError: false }
                  : entry
              ),
            }
          : player
      )
    );
  };

  const handleSaveEdit = (playerIdx, entryIdx) => {
    const entry = players[playerIdx].data[entryIdx];
    const isValid = validateEntry(entry.editValue);

    if (!isValid) {
      setPlayers(
        players.map((player, i) =>
          i === playerIdx
            ? {
                ...player,
                data: player.data.map((e, j) =>
                  j === entryIdx ? { ...e, editError: true } : e
                ),
              }
            : player
        )
      );
      return;
    }

    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((e, j) =>
                j === entryIdx
                  ? {
                      ...e,
                      input: e.editValue,
                      isEditing: false,
                      editError: false,
                    }
                  : e
              ),
            }
          : player
      )
    );
  };

  const handleDelete = (playerIdx, entryIdx) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.filter((_, j) => j !== entryIdx),
            }
          : player
      )
    );
  };

  const handleSubmitAndPrint = async (player) => {
    try {
      // Fetch current game status
      const statusRes = await fetch("/api/game-status");
      if (!statusRes.ok) {
        // Handle non-200 responses from game-status API
        throw new Error(`Failed to fetch game status: ${statusRes.statusText}`);
      }
      const statusData = await statusRes.json();

      const now = new Date();
      const targetTime = statusData.targetDateTime
        ? new Date(statusData.targetDateTime)
        : null;

      // --- Core Logic: Check Game Status and Route Submission ---
      if (!statusData.isGameOn || (targetTime && now > targetTime)) {
        alert(
          "⛔ The game has ended or the time is up. Attempting to save to 'waiting' list."
        );
        // If game is off or time is up, submit to 'waitingSavePlayer' endpoint
        await submitToWaitingList(player, statusData.isGameOn, targetTime); // New function to handle this
        return; // Stop further execution after attempting to save to waiting list
      }
      // --- End Core Logic ---
    } catch (err) {
      console.error("Game status verification error:", err);
      alert(
        `⚠️ Failed to verify game status. Please try again. Details: ${
          err.message || err
        }`
      );
      return;
    }
    const dataEntries = player.data || player.entries || [];

    const parsedData = dataEntries.map((entry) => ({ input: entry.input }));

    let total1D = 0;
    let total2D = 0;
    let total3D = 0;

    // Calculate total amounts per digit type
    dataEntries.forEach((entry) => {
      // Basic input validation for each entry
      if (
        !entry.input ||
        typeof entry.input !== "string" ||
        !entry.input.includes(".")
      ) {
        console.warn(
          `Skipping malformed entry input: ${JSON.stringify(
            entry
          )}. Expected format "NUM=AMOUNT".`
        );
        return; // Skip this entry
      }

      const parts = entry.input.split(".");
      const num = parts[0];
      // Filter for valid numbers and positive amounts
      const amounts = parts
        .slice(1)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

      if (amounts.length === 0) {
        console.warn(
          `No valid positive amounts found for entry: ${entry.input}. Skipping total calculation.`
        );
        return;
      }

      const sum = amounts.reduce((a, b) => a + b, 0);

      if (/^\d$/.test(num)) {
        total1D += sum;
      } else if (/^\d{2}$/.test(num)) {
        total2D += sum;
      } else if (/^\d{3}$/.test(num)) {
        total3D += sum;
      } else {
        console.warn(
          `Unrecognized number format "${num}" for entry: ${entry.input}. Skipping total calculation for this.`
        );
      }
    });

    // Optional: Prevent submission if total amount played is zero, but entries exist
    if (total1D === 0 && total2D === 0 && total3D === 0) {
      alert(
        "⚠️ Player has entries, but the total played amount is zero or invalid. Not submitting to active game."
      );
      return;
    }

    const payload = {
      voucher: player.voucher,
      agentId: agentId, // Ensure agentId is accessible in this scope (e.g., passed as argument or globally defined)
      name: player.name || "",
      SAId: player.SAId || "",
      data: parsedData,
      amountPlayed: { OneD: total1D, TwoD: total2D, ThreeD: total3D },
    };

    try {
      // Send data to backend for active game submission
      const res = await fetch("/api/savePlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Player data submitted to database!");

        // ✅ Update only the submitted player
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) =>
            p.voucher === player.voucher ? { ...p, submitted: true } : p
          )
        );
      } else {
        const err = await res.json();
        const errorMessage =
          err.message || `Unknown error (Status: ${res.status})`;
        alert(`❌ Failed to submit to active game: ${errorMessage}`);
        // Do NOT add to submittedPlayers to allow retry
      }
    } catch (err) {
      console.error("Active game submission error:", err);
      alert(
        "❌ An error occurred while submitting to the active game. Please check your internet connection and try again."
      );
      // Do NOT add to submittedPlayers to allow retry
    }
  };

  /**
   * Handles submitting player data to a "waiting" collection when the game is closed.
   * @param {object} player - The player data object.
   * @param {boolean} isGameOn - Current game status.
   * @param {Date | null} targetTime - The game end time, if set.
   */
  const submitToWaitingList = async (player, isGameOn, targetTime) => {
    const dataEntries = player.data || player.entries || [];

    if (dataEntries.length === 0) {
      alert(
        "ℹ️ No game entries found for this player. Not saving to 'waiting' list."
      );
      return;
    }

    // const parsedData = dataEntries.map((entry) => ({ input: entry.input }));

    // You might want to include game status info in the waiting payload for context
    const parsedData = dataEntries.map((entry) => ({ input: entry.input }));

    let total1D = 0;
    let total2D = 0;
    let total3D = 0;

    // Calculate total amounts per digit type
    dataEntries.forEach((entry) => {
      // Basic input validation for each entry
      if (
        !entry.input ||
        typeof entry.input !== "string" ||
        !entry.input.includes(".")
      ) {
        console.warn(
          `Skipping malformed entry input: ${JSON.stringify(
            entry
          )}. Expected format "NUM=AMOUNT".`
        );
        return; // Skip this entry
      }

      const parts = entry.input.split(".");
      const num = parts[0];
      // Filter for valid numbers and positive amounts
      const amounts = parts
        .slice(1)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);

      if (amounts.length === 0) {
        console.warn(
          `No valid positive amounts found for entry: ${entry.input}. Skipping total calculation.`
        );
        return;
      }

      const sum = amounts.reduce((a, b) => a + b, 0);

      if (/^\d$/.test(num)) {
        total1D += sum;
      } else if (/^\d{2}$/.test(num)) {
        total2D += sum;
      } else if (/^\d{3}$/.test(num)) {
        total3D += sum;
      } else {
        console.warn(
          `Unrecognized number format "${num}" for entry: ${entry.input}. Skipping total calculation for this.`
        );
      }
    });

    // Optional: Prevent submission if total amount played is zero, but entries exist
    if (total1D === 0 && total2D === 0 && total3D === 0) {
      alert(
        "⚠️ Player has entries, but the total played amount is zero or invalid. Not submitting to active game."
      );
      return;
    }
    const waitingPayload = {
      voucher: player.voucher,
      agentId: agentId,
      name: player.name || "",
      SAId: player.SAId || "",
      data: parsedData,
      amountPlayed: { OneD: total1D, TwoD: total2D, ThreeD: total3D },
      submissionAttemptTime: new Date().toISOString(), // When it tried to submit
      gameStatusAtAttempt: {
        isGameOn: isGameOn,
        targetDateTime: targetTime ? targetTime.toISOString() : null,
      },
      // You might still calculate amounts if needed for the waiting list,
      // but it's optional depending on your backend processing for waiting data.
      // For simplicity, I'm omitting amountPlayed for waitingPayload in this example,
      // but you could add it back using the same calculation logic.
      // amountPlayed: { OneD: total1D, TwoD: total2D, ThreeD: total3D },
    };

    try {
      const res = await fetch("/api/waitingSavePlayer", {
        // New endpoint for waiting list
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waitingPayload),
      });

      if (res.ok) {
        alert("✅ Player data saved to 'waiting' list successfully!");
        // You might have a separate `setWaitingPlayers` state or similar
        // if you want to track players in the waiting list in your UI.
        // For now, we'll just alert.
        // No printing here, as it's not a final submission.
      } else {
        const err = await res.json();
        const errorMessage =
          err.message || `Unknown error (Status: ${res.status})`;
        alert(
          `❌ Failed to save player data to 'waiting' list: ${errorMessage}`
        );
      }
    } catch (err) {
      console.error("Waiting list submission error:", err);
      alert(
        "❌ An error occurred while saving to 'waiting' list. Please try again."
      );
    }
  };

  // Assuming `submittedPlayers`, `handlePrint`, `setSubmittedPlayers`, and `agentId`
  // are defined in the scope where `handleSubmitAndPrint` is called.
  // Example definitions (for context, not part of the function itself):
  // const [submittedPlayers, setSubmittedPlayers] = useState([]);
  // const handlePrint = (player) => { /* ... print logic ... */ };
  // const agentId = 'YOUR_AGENT_ID';

  const handlePrint = (player) => {
    const amountPlayed = player.amountPlayed || { OneD: 0, TwoD: 0, ThreeD: 0 }; // make sure amountPlayed exists

    const win = window.open("", "_blank");
    win.document.write(`
  <html>
    <head>
      <title>Player Data</title>
      <style>
       @page {
  size: 80mm;
  margin: 0;
}

        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          color: #000;
          padding: 4px;
          margin: 0;
        }

        .container {
          width: 100%;
        }
.name-subagent{

display: flex;
}
        h2 {
          font-size: 12px;
          margin: 2px 0;
          text-align: center;
        }

        p {
          font-size: 10px;
          text-align: center;
          margin: 2px 0;
        }

        .input-table {
          width: 100%;
          margin-top: 4px;
          border-collapse: collapse;
        }

        .input-table td {
          width: 33.33%;
          padding: 2px;
          font-size: 10px;
          text-align: left;
        }

        .totals-table {
          width: 100%;
          margin-top: 6px;
          border-collapse: collapse;
        }

        .totals-table th, .totals-table td {
          border: 1px solid #000;
          padding: 2px;
          text-align: center;
          font-size: 9px;
        }

        .totals-table th {
          font-weight: bold;
        }

        .grand-total {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${player.voucher || ""}</h2>

        <h2>Player: ${player.name || ""} || Sub Agent: ${player.SAId || ""}</h2>
    
 
        <p> Date: ${new Date(player.time).toLocaleString()}</p>

       <table class="input-table" style="width: 100%; border-collapse: collapse;" border="1">
  <tbody>
    ${(() => {
      const total = player?.data.length;
      const third = Math.ceil(total / 3);
      const col1 = player?.data.slice(0, third);
      const col2 = player?.data.slice(third, third * 2);
      const col3 = player?.data.slice(third * 2, total);

      const maxRows = Math.max(col1.length, col2.length, col3.length);
      const rows = [];

      for (let i = 0; i < maxRows; i++) {
        const c1 = col1[i] ? col1[i].input : "";
        const c2 = col2[i] ? col2[i].input : "";
        const c3 = col3[i] ? col3[i].input : "";
        rows.push(`<tr><td>${c1}</td><td>${c2}</td><td>${c3}</td></tr>`);
      }

      return rows.join("");
    })()}
  </tbody>
</table>


        <table class="totals-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>After Deduction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>3D Total</td>
              <td>${amountPlayed?.ThreeD}</td>
              <td>${(amountPlayed?.ThreeD * 0.6).toFixed(0)}</td>
            </tr>
            <tr>
              <td>2D Total</td>
              <td>${amountPlayed?.TwoD}</td>
              <td>${(amountPlayed?.TwoD * 0.8).toFixed(0)}</td>
            </tr>
            <tr>
              <td>1D Total</td>
              <td>${amountPlayed?.OneD}</td>
              <td>${amountPlayed?.OneD.toFixed(0)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total</td>
              <td>
                ${(
                  amountPlayed?.ThreeD +
                  amountPlayed?.TwoD +
                  amountPlayed?.OneD
                ).toFixed(0)}
              </td>
              <td>
                ${(
                  amountPlayed?.ThreeD * 0.6 +
                  amountPlayed?.TwoD * 0.8 +
                  amountPlayed?.OneD
                ).toFixed(0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
`);

    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen  text-white p-6 ">
      <div className="mb-16 p-4rounded text-yellow-200 font-mono text-3xl text-center">
        ⏳ Time Remaining: <span className="font-bold">{timeLeft}</span>
      </div>
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-90 rounded-lg ring-2 ring-red-500 shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">
          🎰 Player Input 🎰
        </h1>
        <label className="block mb-2 text-yellow-300 ">Sub Agent:</label>
        <input
          type="number"
          value={SAId}
          onChange={(e) => setSAId(e.target.value)}
          placeholder="Your Sub Agent Id"
          className="w-full p-3 mb-4 rounded bg-black border-2 border-red-700 text-white"
        />
        <label className="block mb-2 text-yellow-300 ">Player Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white"
        />

        <label className="block mb-2 text-yellow-300">Enter Plays:</label>
        {inputs.map((input, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="[0-9=]+"
            value={input}
            onChange={(e) => handleInputChange(i, e.target.value)}
            placeholder={`Entry ${i + 1}`}
            className={`w-full p-2 mb-2 rounded bg-black border-2 text-white ${
              errors[i] ? "border-red-500 bg-red-900" : "border-yellow-400"
            }`}
          />
        ))}

        {errors.some((err) => err) && (
          <p className="text-red-400">Please correct the errors.</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleSavePlayer}
            // disabled={isCompleted === false}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
          >
            🎲 Complete
          </button>
          <button
            onClick={handleAddInputs}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
          >
            ➕ Add More
          </button>
        </div>

        {players.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <h3 className="text-2xl text-yellow-400 mb-4 font-semibold text-center">
              🎉 Player Summary 🎉
            </h3>
            {players.map((player, idx) => (
              <React.Fragment key={idx}>
                <div className="my-16 bg-gray-800 p-5 rounded-xl border border-yellow-500 shadow hover:shadow-yellow-500 transition-shadow">
                  <p className="text-yellow-300 font-bold text-xl text-center">
                    Voucher:{" "}
                    <span className="font-mono">{player.voucher || "N/A"}</span>
                  </p>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold mb-1">
                        Sub Agent: {player.SAId}
                      </h4>
                      <h4 className="text-xl font-bold mb-1">
                        Player name: {player.name}
                      </h4>

                      <p className="text-gray-400 text-sm mb-1">
                        Time: {new Date(player.time).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entries: {player.data.length}
                      </p>
                    </div>
                    {player.submitted ? (
                      <button
                        onClick={() => handlePrint(player)}
                        className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded font-semibold text-white transition"
                      >
                        🖨️ Print
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubmitAndPrint(player)}
                        className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded font-semibold text-white transition"
                      >
                        🚀 Submit
                      </button>
                    )}
                  </div>

                  <table className="w-full mt-4 border-collapse font-mono text-sm">
                    <thead>
                      <tr className="bg-yellow-600 text-white">
                        <th className="border px-3 py-2 text-left">#</th>
                        <th className="border px-3 py-2 text-left">Input</th>
                        <th className="border px-3 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Calculate the total number of entries for the current player */}
                      {(() => {
                        const totalEntries = player.data.length;
                        const oneThirdLength = Math.ceil(totalEntries / 3); // Ensures at least one row per section
                        const twoThirdsLength = Math.ceil(totalEntries / 3) * 2;

                        return player.data.map((entry, entryIdx) => {
                          let rowTextColorClass = "text-gray-300"; // Default color

                          if (entryIdx < oneThirdLength) {
                            rowTextColorClass = "text-red-400"; // First one-third
                          } else if (entryIdx < twoThirdsLength) {
                            rowTextColorClass = "text-green-400"; // Second one-third
                          } else {
                            rowTextColorClass = "text-blue-400"; // Last one-third
                          }

                          return (
                            <tr
                              key={entry.id}
                              className={`${
                                entryIdx % 2 === 0
                                  ? "bg-gray-700"
                                  : "bg-gray-800"
                              } ${rowTextColorClass}`}
                            >
                              <td className="border px-3 py-0">
                                {entry.serial}
                              </td>
                              <td className="border px-3 py-0">
                                {entry.isEditing ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={entry.editValue}
                                      onChange={(e) =>
                                        handleEditChange(
                                          idx,
                                          entryIdx,
                                          e.target.value
                                        )
                                      }
                                      className={`w-full p-1 bg-black border-2 text-white rounded ${
                                        entry.editError
                                          ? "border-red-500"
                                          : "border-yellow-400"
                                      }`}
                                    />
                                    {entry.editError && (
                                      <p className="text-red-400 text-xs mt-1">
                                        Invalid entry format.
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  entry.input
                                )}
                              </td>
                              <td className="border px-3 py-0 space-x-2">
                                {/* {!submittedPlayers.includes(player.name) && ( */}
                                <>
                                  {entry.isEditing ? (
                                    <button
                                      onClick={() =>
                                        handleSaveEdit(idx, entryIdx)
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition"
                                    >
                                      💾
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleEdit(idx, entryIdx)}
                                      className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded transition"
                                    >
                                      ✏️
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(idx, entryIdx)}
                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition"
                                  >
                                    🗑️
                                  </button>
                                </>
                                {/* )} */}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>

                  {/* Totals Calculation */}
                  <div className="mt-6">
                    <table className="w-full border-collapse font-mono text-sm text-yellow-300">
                      <thead>
                        <tr className="bg-red-700 text-white">
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            Category
                          </th>
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            Amount
                          </th>
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            After Deduction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-800">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 3D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.ThreeD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(amountPlayed?.ThreeD * 0.6).toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-900">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 2D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.TwoD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(amountPlayed?.TwoD * 0.8).toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-800">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 1D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.OneD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.OneD.toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-900 font-bold text-lg">
                          <td className="border border-gray-600 px-4 py-2">
                            🔢 Grand Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              amountPlayed?.ThreeD +
                              amountPlayed?.TwoD +
                              amountPlayed?.OneD
                            ).toFixed(0)}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              amountPlayed?.ThreeD * 0.6 +
                              amountPlayed?.TwoD * 0.8 +
                              amountPlayed?.OneD
                            ).toFixed(0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Horizontal animated divider between players (except after last) */}
                {idx !== players.length - 1 && (
                  <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
