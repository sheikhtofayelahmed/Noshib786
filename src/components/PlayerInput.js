"use client";
import React from "react";

import { useState, useEffect } from "react";
import { useAgent } from "src/context/AgentContext";

export default function PlayerInput() {
  const [name, setName] = useState("");
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
        const parts = entry.input.split("=");
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
    if (!/^[\d=]+$/.test(input)) return false;
    if (input.startsWith("=")) return false;

    const parts = input.split("=");
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
    // console.log(newEntries)
    // const voucherNumber = `VC-${agentId}-${new Date(player.time).getTime().toString().slice(-5)}`

    const time = new Date().toLocaleString();
    const newPlayer = {
      name,
      time: new Date().toLocaleString(),
      voucher: `VC-${agentId}-${new Date(time).getTime().toString().slice(-5)}`,
      data: newEntries,
    };

    setPlayers([newPlayer, ...players]);
    setName("");
    setInputs(Array(20).fill(""));
    setErrors(Array(20).fill(false));
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
      const statusRes = await fetch("/api/game-status");
      const statusData = await statusRes.json();

      if (!statusData.isGameOn) {
        alert("⛔ The game has ended. Submissions are now closed.");
        return;
      }
    } catch (err) {
      alert("⚠️ Failed to verify game status. Please try again.");
      return;
    }
    // Prevent re-submission if already submitted
    if (submittedPlayers.includes(player.name)) {
      // Already submitted ➔ Only print
      handlePrint(player);
      return;
    }

    // Defensive: Make sure data exists
    const dataEntries = player.data || player.entries || [];

    const parsedData = dataEntries.map((entry) => ({ input: entry.input }));

    let total1D = 0,
      total2D = 0,
      total3D = 0;

    dataEntries.forEach((entry) => {
      const parts = entry.input.split("=");
      const num = parts[0];
      const amounts = parts
        .slice(1)
        .map(Number)
        .filter((n) => !isNaN(n));

      const sum = amounts.reduce((a, b) => a + b, 0);

      if (/^\d$/.test(num)) {
        total1D += sum;
      } else if (/^\d{2}$/.test(num)) {
        total2D += sum;
      } else if (/^\d{3}$/.test(num)) {
        total3D += sum;
      }
    });

    const payload = {
      voucher: player.voucher,
      agentId: agentId, // Make sure agentId is in scope here
      name: player.name || "",
      time: player.time,
      data: parsedData,
      amountPlayed: { OneD: total1D, TwoD: total2D, ThreeD: total3D },
    };

    try {
      const res = await fetch("/api/savePlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Player data submitted to database!");
        setSubmittedPlayers((prev) => [...prev, player.name]);
        handlePrint(player);
      } else {
        const err = await res.json();
        alert(`❌ Failed to submit: ${err.message}`);
        // Do NOT add player.name to submittedPlayers here, so retry allowed
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ An error occurred while submitting.");
      // Do NOT add player.name here either
    }
  };

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
        <h2>Player: ${player.name || ""}</h2>
        <p> Date: ${new Date(player.time).toLocaleString()}</p>

       <table class="input-table" style="width: 100%; border-collapse: collapse;" border="1">
  <tbody>
    ${(() => {
      const total = player.data.length;
      const third = Math.ceil(total / 3);
      const col1 = player.data.slice(0, third);
      const col2 = player.data.slice(third, third * 2);
      const col3 = player.data.slice(third * 2, total);

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
              <td>${amountPlayed.ThreeD}</td>
              <td>${(amountPlayed.ThreeD * 0.6).toFixed(0)}</td>
            </tr>
            <tr>
              <td>2D Total</td>
              <td>${amountPlayed.TwoD}</td>
              <td>${(amountPlayed.TwoD * 0.8).toFixed(0)}</td>
            </tr>
            <tr>
              <td>1D Total</td>
              <td>${amountPlayed.OneD}</td>
              <td>${amountPlayed.OneD.toFixed(0)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total</td>
              <td>
                ${(
                  amountPlayed.ThreeD +
                  amountPlayed.TwoD +
                  amountPlayed.OneD
                ).toFixed(0)}
              </td>
              <td>
                ${(
                  amountPlayed.ThreeD * 0.6 +
                  amountPlayed.TwoD * 0.8 +
                  amountPlayed.OneD
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
                        Player name: {player.name}
                      </h4>

                      <p className="text-gray-400 text-sm mb-1">
                        Time: {new Date(player.time).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entries: {player.data.length}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubmitAndPrint(player)}
                      className={`py-2 px-4 rounded font-semibold text-white transition ${
                        submittedPlayers.includes(player.name)
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {submittedPlayers.includes(player.name)
                        ? "🖨️ Print"
                        : "🚀 Submit"}
                    </button>
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
                                {!submittedPlayers.includes(player.name) && (
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
                                        onClick={() =>
                                          handleEdit(idx, entryIdx)
                                        }
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded transition"
                                      >
                                        ✏️
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleDelete(idx, entryIdx)
                                      }
                                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
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
                            {amountPlayed.ThreeD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(amountPlayed.ThreeD * 0.6).toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-900">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 2D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed.TwoD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(amountPlayed.TwoD * 0.8).toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-800">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 1D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed.OneD}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed.OneD.toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-gray-900 font-bold text-lg">
                          <td className="border border-gray-600 px-4 py-2">
                            🔢 Grand Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              amountPlayed.ThreeD +
                              amountPlayed.TwoD +
                              amountPlayed.OneD
                            ).toFixed(0)}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              amountPlayed.ThreeD * 0.6 +
                              amountPlayed.TwoD * 0.8 +
                              amountPlayed.OneD
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
