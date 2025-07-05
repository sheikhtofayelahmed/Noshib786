"use client";
import React, { useState, useEffect } from "react";

// VoucherModal component for searching, displaying, and editing voucher data
export default function VoucherModal() {
  // Existing state for modal functionality
  const [voucherNumberInput, setVoucherNumberInput] = useState("");
  const [currentVoucherData, setCurrentVoucherData] = useState(null); // Stores the fetched player/voucher data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVoucherSubmitted, setIsVoucherSubmitted] = useState(false); // Tracks if the voucher is submitted/printed
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // State variables integrated from the provided code
  const [amountPlayed, setAmountPlayed] = useState({
    OneD: 0,
    TwoD: 0,
    ThreeD: 0,
  });
  const [targetTime, setTargetTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");
  const [isGameOn, setIsGameOn] = useState(null);
  // Removed inputs and errors as they are for new entry forms, not editing existing voucher data in this modal.
  // Removed name, SAId, players, submittedPlayers as top-level state, managing them within currentVoucherData or for the specific voucher.

  // Effect to clear state when modal opens/closes to ensure fresh data on each open
  useEffect(() => {
    setVoucherNumberInput("");
    setCurrentVoucherData(null);
    setMessage("");
    setIsVoucherSubmitted(false);
    setAmountPlayed({ OneD: 0, TwoD: 0, ThreeD: 0 }); // Reset totals
    setTargetTime(null); // Reset game status info
    setTimeLeft("");
    setError("");
    setIsGameOn(null);
  }, []);
  // Effect for countdown timer logic

  const calculateTotals = (entries) => {
    let total1D = 0,
      total2D = 0,
      total3D = 0;

    entries.forEach(({ input }) => {
      const { num, str, rumble } = input || {};
      const total = (Number(str) || 0) + (Number(rumble) || 0);

      if (/^\d$/.test(num)) {
        total1D += total;
      } else if (/^\d{2}$/.test(num)) {
        total2D += total;
      } else if (/^\d{3}$/.test(num)) {
        total3D += total;
      }
    });

    return { OneD: total1D, TwoD: total2D, ThreeD: total3D };
  };
  const validateEntry = (entry) => {
    const { num, str, rumble } = entry;

    // Allow completely empty row
    if (!num && !str && !rumble) return true;

    // Validate num: 1–3 digits and not "000"
    if (!/^\d{1,3}$/.test(num) || num === "000") return false;

    const numLength = num.length;
    const isStrValid = /^\d+$/.test(str);
    const isRumbleValid = /^\d+$/.test(rumble);

    if (numLength === 1) {
      // 1D: only str is allowed/required, rumble must be empty
      if (!isStrValid || rumble) return false;
    } else if (numLength === 2 || numLength === 3) {
      // 2D or 3D: allow at least one of str or rumble (or both)
      if (!str && !rumble) return false;
      if (str && !isStrValid) return false;
      if (rumble && !isRumbleValid) return false;
    } else {
      return false;
    }

    return true;
  };

  // Placeholder for handlePrint (replace with actual printing logic)
  const handlePrint = (player) => {
    const win = window.open("", "_blank");

    const formatRows = () => {
      const sortedData = [...player.entries].sort((a, b) => {
        return b.input.num.length - a.input.num.length;
      });

      const half = Math.ceil(sortedData.length / 2);
      const col1 = sortedData.slice(0, half);
      const col2 = sortedData.slice(half);

      const rows = [];

      for (let i = 0; i < Math.max(col1.length, col2.length); i++) {
        const c1 = col1[i]?.input || {};
        const c2 = col2[i]?.input || {};
        rows.push(`
        <tr>
          <td>${c1.num || ""}</td><td>${c1.str || ""}</td><td>${
          c1.rumble || ""
        }</td><td></td>
          <td>${c2.num || ""}</td><td>${c2.str || ""}</td><td>${
          c2.rumble || ""
        }</td>
        </tr>
      `);
      }

      return rows.join("");
    };

    win.document.write(`
    <html>
      <head>
        <title>Player Data</title>
        <style>
 @page { margin: 0; }
          body {
          width:80mm;
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #000;
            padding: 4px;
            margin: 0;
          }

          .container { width: 100%; }
 .first-container {
  border: 1px solid #000;
  padding: 4px;
  margin-bottom: 4px;
}
     
          h2 {
            font-size: 16px;
            margin: 4px 0;
            text-align: center;
            font-weight: bold;
          }
  h1 { font-size: 20px; text-align: center; margin: 2px 0; }
          p {
            font-size: 16px;
            text-align: center;
            margin: 4px 0;
          }

          .input-table {
            width: 100%;
            margin-top: 8px;
            border-collapse: collapse;
            font-size: 16px;
          }

          .input-table th,
          .input-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            text-align: center;
          }

          .totals-table {
            width: 100%;
            margin-top: 12px;
            border-collapse: collapse;
            font-size: 16px;
          }

          .totals-table th,
          .totals-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }

          .totals-table th {
            background: #f8f8f8;
            font-weight: bold;
          }

          .grand-total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
             <div class="first-container"> 
       <h2>${new Date(player.time).toLocaleString()}</h2>
          <h1>${player.voucher || ""}</h1>
          <p>Player: ${player.name || ""}     </p>
          <p> Sub Agent: ${player.SAId || ""}</p>
          </div>
    <table class="input-table">
            <thead>
              <tr>
                <th>Num</th><th>Str</th><th>Rum.</th><td></td>
                <th>Num</th><th>Str</th><th>Rum.</th>
              </tr>
            </thead>
            <tbody>
              ${formatRows()}
            </tbody>
          </table>

          <table class="totals-table">
           
            <tbody>
              <tr>
                <td>3D Total</td>
                <td>${player.amountPlayed.ThreeD}</td>
                <td>${(
                  player?.amountPlayed?.ThreeD *
                  (1 - player.cPercentages.threeD / 100)
                ).toFixed(0)}</td>
              </tr>
              <tr>
                <td>2D Total</td>
                <td>${player.amountPlayed.TwoD}</td>
                <td>${(
                  player?.amountPlayed?.TwoD *
                  (1 - player.cPercentages.twoD / 100)
                ).toFixed(0)}</td>
              </tr>
              <tr>
                <td>1D Total</td>
                <td>${player.amountPlayed.OneD}</td>
                <td>${
                  player?.amountPlayed?.OneD *
                  (1 - player.cPercentages.oneD / 100).toFixed(0)
                }</td>
              </tr>
              <tr  class="grand-total">
                <td colspan="2">Grand Total</td>
               
                <td>${(
                  player?.amountPlayed?.ThreeD *
                    (1 - player.cPercentages.threeD / 100) +
                  player?.amountPlayed?.TwoD *
                    (1 - player.cPercentages.twoD / 100) +
                  player?.amountPlayed?.OneD *
                    (1 - player.cPercentages.oneD / 100)
                ).toFixed(0)}</td>
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

  // Function to fetch voucher data based on the input voucher number
  const handleSearchVoucher = async () => {
    if (!voucherNumberInput.trim()) {
      setMessage("Please enter a voucher number to search.");
      return;
    }

    setLoading(true);
    setMessage("Searching for voucher...");

    try {
      const apiUrl = `/api/get-voucher-by-number?voucherNumber=${voucherNumberInput}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success && data.voucherData) {
        const entriesData = Array.isArray(data.voucherData.entries)
          ? data.voucherData.entries
          : [data.voucherData.entries];

        const formattedData = {
          ...data.voucherData,
          data: entriesData.map((entry) => ({
            ...entry,
            isEditing: false,
            editValue: entry.input,
            editError: false,
          })),
        };

        // ✅ Set voucher data
        setCurrentVoucherData(formattedData);

        // ✅ Auto-calculate totals
        const totals = calculateTotals(entriesData);
        console.log(totals, "totals");
        setAmountPlayed(totals);
        console.log(amountPlayed);
        // ✅ Track submission status
        setIsVoucherSubmitted(
          data.voucherData.isSubmittedToActiveGame || false
        );

        setMessage("");
      } else {
        setCurrentVoucherData(null);
        setMessage(`Voucher "${voucherNumberInput}" not found.`);
      }
    } catch (error) {
      console.error("Error fetching voucher:", error);
      if (
        error.message.includes("Unexpected token") &&
        error.message.includes("valid JSON")
      ) {
        setMessage(
          "Error: Received an invalid response from the server. The API might not be running or accessible."
        );
      } else {
        setMessage(
          `An error occurred while fetching voucher data: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Corrected handleEditChange to not expect playerIdx
  const handleEditChange = (entryIdx, field, newValue) => {
    setCurrentVoucherData((prevData) => {
      if (!prevData) return prevData;

      const updatedData = prevData.data.map((entry, idx) => {
        if (idx === entryIdx) {
          const newEdit = {
            ...entry.editValue,
            [field]: newValue,
          };
          const isValid = validateEntry(newEdit);
          return { ...entry, editValue: newEdit, editError: !isValid };
        }
        return entry;
      });

      return { ...prevData, data: updatedData };
    });
  };

  // Corrected handleSaveEdit to not expect playerIdx
  const handleSaveEdit = (entryIdx) => {
    setCurrentVoucherData((prevData) => {
      if (!prevData) return prevData;

      const entryToSave = prevData.data[entryIdx];
      const isValid = validateEntry(entryToSave.editValue);

      if (!isValid) {
        setMessage("Cannot save invalid entry. Please correct the error.");
        return {
          ...prevData,
          data: prevData.data.map((e, j) =>
            j === entryIdx ? { ...e, editError: true } : e
          ),
        };
      }

      const updatedData = prevData.data.map((entry, idx) => {
        if (idx === entryIdx) {
          return {
            ...entry,
            input: entry.editValue,
            isEditing: false,
            editError: false,
          };
        }
        return entry;
      });

      // ✅ Recalculate amountPlayed after saving
      const newTotals = calculateTotals(updatedData);
      setAmountPlayed(newTotals);
      setMessage("Entry saved successfully!");

      return { ...prevData, data: updatedData };
    });
  };

  // Corrected handleEdit to not expect playerIdx
  const handleEdit = (entryIdx) => {
    setCurrentVoucherData((prevData) => {
      if (!prevData) return prevData;

      const updatedData = prevData.data.map((entry, idx) => {
        if (idx === entryIdx) {
          return {
            ...entry,
            isEditing: true,
            editValue: entry.input,
            editError: false,
          };
        }
        return entry;
      });
      return { ...prevData, data: updatedData };
    });
  };

  // Corrected handleDelete to not expect playerIdx
  const handleDelete = (entryIdx) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    setCurrentVoucherData((prevData) => {
      if (!prevData) return prevData;

      const updatedData = prevData.data.filter((_, idx) => idx !== entryIdx);
      setMessage("Entry deleted successfully!");
      return { ...prevData, data: updatedData };
    });
  };

  // Modified handleSubmitAndPrint to use the state variables and logic from original code
  const handleEditAndPrint = async (player) => {
    const dataEntries = player.data || [];

    // Clean up and normalize the payload entries
    const parsedData = dataEntries.map((entry) => ({
      input: entry.input,
    }));

    // ⏱️ Recalculate totals just before sending
    const updatedTotals = calculateTotals(parsedData);

    const payload = {
      _id: player._id,
      voucher: player.voucher,
      agentId: player.agentId,
      name: player.name || "",
      SAId: player.SAId || "",
      data: parsedData,
      amountPlayed: updatedTotals,
    };

    try {
      const res = await fetch(`/api/updateSavePlayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("✅ Voucher data updated!");
        setIsVoucherSubmitted(true);
        handlePrint(player);
      } else {
        const err = await res.json();
        setMessage(`❌ Failed to update: ${err.message || res.status}`);
      }
    } catch (err) {
      console.error("Edit error:", err);
      setMessage("❌ Network error while editing.");
    }
  };
  const handleDeleteVoucher = async (_id) => {
    const confirmation = prompt(
      "Type 'del' to confirm deletion of this voucher:"
    );
    if (confirmation !== "del") {
      alert("❌ Deletion cancelled. You must type 'del' to proceed.");
      return;
    }

    try {
      const res = await fetch("/api/deleteVoucher", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
      });

      if (res.ok) {
        setMessage("🗑️ Voucher deleted successfully.");
        setIsVoucherSubmitted(false);

        // Optional: clear or refresh local view
        setCurrentVoucherData(null);
        setAmountPlayed({ OneD: 0, TwoD: 0, ThreeD: 0 });
      } else {
        const err = await res.json();
        setMessage(`❌ Delete failed: ${err.message || res.status}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Network error while deleting voucher.");
    }
  };
  console.log(amountPlayed);
  return (
    <div className="flex items-center justify-center ">
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-yellow-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative text-white font-mono">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-yellow-300 drop-shadow-lg">
          VOUCHER DETAILS
        </h2>

        {/* Voucher Search Input */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={voucherNumberInput}
            onChange={(e) => setVoucherNumberInput(e.target.value)}
            placeholder="Enter Voucher Number"
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-yellow-500 text-yellow-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
          <button
            onClick={handleSearchVoucher}
            className="py-3 px-6 bg-yellow-600 text-black font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "🔍 Search Voucher"}
          </button>
        </div>

        {/* Game Status/Countdown Display */}
        {targetTime && (
          <div className="text-center bg-gray-800 p-3 rounded-lg mb-4 border border-blue-500">
            <p className="text-blue-300 text-lg">
              Game ends in:{" "}
              <span className="font-bold text-xl text-blue-400">
                {timeLeft}
              </span>
            </p>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-lg mb-6 text-center ${
              message.includes("Error") ||
              message.includes("not found") ||
              message.includes("Failed")
                ? "bg-red-800 text-red-200"
                : "bg-blue-800 text-blue-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Voucher Data Display (Conditional) */}
        {currentVoucherData ? (
          <div className="my-8 bg-gray-800 p-5 rounded-xl border border-yellow-500 shadow-xl">
            <p className="text-yellow-300 font-bold text-xl text-center mb-4">
              Voucher:
              <span className="font-mono text-white">
                {currentVoucherData.voucher || "N/A"}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-bold mb-1 text-green-400">
                  Sub Agent: {currentVoucherData.SAId}
                </h4>
                <h4 className="text-xl font-bold mb-1 text-green-400">
                  Player name: {currentVoucherData.name}
                </h4>
                <p className="text-gray-400 text-sm mb-1">
                  Time: {new Date(currentVoucherData.time).toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm mb-1">
                  Updated Time:
                  {currentVoucherData?.updatedAt
                    ? new Date(currentVoucherData.updatedAt).toLocaleString()
                    : "Not Edited Yet"}
                </p>
                <p className="text-gray-400 text-sm">
                  Entries: {currentVoucherData?.entries.length}
                </p>
              </div>
              <button
                onClick={() => handleEditAndPrint(currentVoucherData)}
                className={`py-2 px-4 rounded font-semibold text-white transition mt-4 sm:mt-0 ${
                  isVoucherSubmitted
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isVoucherSubmitted ? "🖨️ Print" : "🚀 Submit"}
              </button>
              <button
                onClick={() => handleDeleteVoucher(currentVoucherData._id)}
                className="py-2 px-4 rounded font-semibold text-white transition mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 ml-2"
              >
                🗑️ Delete Voucher
              </button>
            </div>

            {/* Entries Table */}
            <div className="w-full overflow-x-auto rounded-lg shadow-lg border border-yellow-600">
              <table className="w-full border-collapse font-mono text-sm table-fixed min-w-[400px]">
                {/* min-w for horizontal scroll */}
                <thead>
                  <tr className="bg-yellow-600 text-white">
                    <th className="border px-3 py-2 text-left">#</th>
                    <th className="border px-3 py-2 text-center">Number</th>
                    <th className="border px-3 py-2 text-center">STR</th>
                    <th className="border px-3 py-2 text-center">RUMBLE</th>
                    <th className="border px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVoucherData.data.map((entry, entryIdx) => {
                    return (
                      <tr key={entryIdx}>
                        <td className="border border-gray-600 px-3 py-0">
                          {entryIdx + 1}
                        </td>

                        {entry.isEditing ? (
                          <>
                            {["num", "str", "rumble"].map((field) => (
                              <td
                                key={field}
                                className="border border-gray-600 px-3 py-1"
                              >
                                <input
                                  type="text"
                                  value={entry.editValue?.[field] ?? ""}
                                  onChange={(e) =>
                                    handleEditChange(
                                      entryIdx,
                                      field,
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-1 bg-black border-2 text-white rounded ${
                                    entry.editError
                                      ? "border-red-500"
                                      : "border-yellow-400"
                                  }`}
                                  placeholder={field.toUpperCase()}
                                />
                              </td>
                            ))}
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-600 px-3 py-1">
                              {entry.input.num}
                            </td>
                            <td className="border border-gray-600 px-3 py-1">
                              {entry.input.str}
                            </td>
                            <td className="border border-gray-600 px-3 py-1">
                              {entry.input.rumble}
                            </td>
                          </>
                        )}

                        <td className="border border-gray-600 px-3 py-0 space-x-2">
                          {!isVoucherSubmitted && (
                            <>
                              {entry.isEditing ? (
                                <button
                                  onClick={() => handleSaveEdit(entryIdx)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition"
                                >
                                  💾
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEdit(entryIdx)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded transition"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(entryIdx)}
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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
                      {(
                        amountPlayed?.ThreeD *
                        (1 - currentVoucherData.cPercentages.threeD / 100)
                      ).toFixed(0)}
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
                      {(
                        amountPlayed?.TwoD *
                        (1 - currentVoucherData.cPercentages.twoD / 100)
                      ).toFixed(0)}
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
                      {amountPlayed?.OneD *
                        (
                          1 -
                          currentVoucherData.cPercentages.threeD / 100
                        ).toFixed(0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-900 font-bold text-lg">
                    <td
                      colSpan={2}
                      className="border border-gray-600 px-4 py-2"
                    >
                      🔢 Grand Total
                    </td>

                    <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                      {(
                        amountPlayed?.ThreeD *
                          (1 - currentVoucherData.cPercentages.threeD / 100) +
                        amountPlayed?.TwoD *
                          (1 - currentVoucherData.cPercentages.twoD / 100) +
                        amountPlayed?.OneD *
                          (1 - currentVoucherData.cPercentages.oneD / 100)
                      ).toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading &&
          message &&
          !message.includes("Please enter") && (
            <div className="bg-gray-700 p-8 rounded-xl shadow-lg text-center text-red-400 text-lg">
              <p>No voucher data found for the given number.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
