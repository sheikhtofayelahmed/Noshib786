import React, { useState, useEffect } from "react";

// VoucherModal component for searching, displaying, and editing voucher data
export default function VoucherModal({ isOpen, onClose }) {
  // Existing state for modal functionality
  const [voucherNumberInput, setVoucherNumberInput] = useState("");
  const [currentVoucherData, setCurrentVoucherData] = useState(null); // Stores the fetched player/voucher data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isVoucherSubmitted, setIsVoucherSubmitted] = useState(false); // Tracks if the voucher is submitted/printed

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
    if (isOpen) {
      setVoucherNumberInput("");
      setCurrentVoucherData(null);
      setMessage("");
      setIsVoucherSubmitted(false);
      setAmountPlayed({ OneD: 0, TwoD: 0, ThreeD: 0 }); // Reset totals
      setTargetTime(null); // Reset game status info
      setTimeLeft("");
      setError("");
      setIsGameOn(null);
    }
  }, [isOpen]);

  // Effect for countdown timer logic

  // Effect to calculate amountPlayed based on currentVoucherData.data
  useEffect(() => {
    let total1D = 0,
      total2D = 0,
      total3D = 0;

    if (currentVoucherData && currentVoucherData.data) {
      currentVoucherData.data.forEach((entry) => {
        const parts = entry.input.split("=");
        const num = parts[0];
        const amounts = parts
          .slice(1)
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0); // Ensure positive amounts

        if (amounts.length === 0) {
          return; // Skip if no valid amounts
        }

        const sum = amounts.reduce((a, b) => a + b, 0);

        if (/^\d$/.test(num)) {
          total1D += sum;
        } else if (/^\d{2}$/.test(num)) {
          total2D += sum;
        } else if (/^\d{3}$/.test(num)) {
          total3D += sum;
        }
      });
    }
    setAmountPlayed({ OneD: total1D, TwoD: total2D, ThreeD: total3D });
  }, [currentVoucherData]); // Recalculate when currentVoucherData changes

  // Utility function for validation
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

  // Placeholder for handlePrint (replace with actual printing logic)
  const handlePrint = (player) => {
    setMessage(`Printing voucher ${player.voucher}...`);
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
      // Corrected API URL: Assuming API routes are served directly from /api/
      const apiUrl = `/api/get-voucher-by-number?voucherNumber=${voucherNumberInput}`;
      const response = await fetch(apiUrl);

      // Check if response is OK (status 200) before trying to parse JSON
      if (!response.ok) {
        // If not OK, try to get error message from server response, or use status text
        const errorText = await response.text(); // Read as text to avoid JSON parsing errors for non-JSON responses
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success && data.voucherData) {
        // --- IMPORTANT FIX: Handle `data.voucherData.data` being a single object ---
        // Ensure `data.voucherData.data` is always an array of entries for consistency.
        // If it's a single object, wrap it in an array.
        const entriesData = Array.isArray(data.voucherData.entries)
          ? data.voucherData.entries
          : [data.voucherData.entries]; // This is the key change: always make it an array

        // Ensure all entries have necessary fields for editing
        const formattedData = {
          ...data.voucherData,
          data: entriesData.map((entry) => ({
            ...entry,
            isEditing: false,
            editValue: entry.input, // Initialize editValue with current input
            editError: false,
          })),
        };
        setCurrentVoucherData(formattedData);
        setMessage("");
        // Check if this voucher was already submitted based on your criteria
        // For demonstration, assuming a field like `isSubmittedToActiveGame`
        // You might need to adjust this based on your actual backend data structure
        setIsVoucherSubmitted(
          data.voucherData.isSubmittedToActiveGame || false
        );
      } else {
        setCurrentVoucherData(null);
        setMessage(`Voucher "${voucherNumberInput}" not found.`);
      }
    } catch (error) {
      console.error("Error fetching voucher:", error);
      // Display a more user-friendly error message, especially for SyntaxError
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
  const handleEditChange = (entryIdx, newValue) => {
    setCurrentVoucherData((prevData) => {
      if (!prevData) return prevData;

      const updatedData = prevData.data.map((entry, idx) => {
        if (idx === entryIdx) {
          const isValid = validateEntry(newValue);
          return { ...entry, editValue: newValue, editError: !isValid };
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
          // Send update to backend
          // Example:
          // fetch(`/api/update-voucher-entry`, { // Corrected API URL
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     voucher: prevData.voucher,
          //     entryId: entry.id,
          //     newValue: entry.editValue
          //   })
          // })
          // .then(res => res.json())
          // .then(data => {
          //   if (!data.success) {
          //     setMessage('Failed to save entry on server.');
          //   }
          // }).catch(err => {
          //   setMessage('Error saving entry to server.');
          //   console.error(err);
          // });
          setMessage("Entry saved successfully!");
          return {
            ...entry,
            input: entry.editValue,
            isEditing: false,
            editError: false,
          };
        }
        return entry;
      });
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
      // Send delete request to backend
      // Example:
      // fetch(`/api/delete-voucher-entry`, { // Corrected API URL
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     voucher: prevData.voucher,
      //     entryId: prevData.data[entryIdx].id
      //   })
      // })
      // .then(res => res.json())
      // .then(data => {
      //   if (!data.success) {
      //     setMessage('Failed to delete entry on server.');
      //   }
      // }).catch(err => {
      //   setMessage('Error deleting entry from server.');
      //   console.error(err);
      // });
      setMessage("Entry deleted successfully!");
      return { ...prevData, data: updatedData };
    });
  };

  // Modified handleSubmitAndPrint to use the state variables and logic from original code
  const handleEditAndPrint = async (player) => {
    const dataEntries = player.data || [];

    // if (dataEntries.length === 0) {
    //   setMessage("ℹ️ No game entries found for this voucher. Edit cancelled.");
    //   return;
    // }

    const parsedData = dataEntries.map((entry) => ({ input: entry.input }));

    // if (
    //   amountPlayed.OneD === 0 &&
    //   amountPlayed.TwoD === 0 &&
    //   amountPlayed.ThreeD === 0
    // ) {
    //   setMessage(
    //     "⚠️ Entries exist, but total played amount is zero or invalid. Edit cancelled."
    //   );
    //   return;
    // }

    const payload = {
      _id: player._id, // This is required to target the document
      voucher: player.voucher,
      agentId: player.agentId,
      name: player.name || "",
      SAId: player.SAId || "",
      data: parsedData,
      amountPlayed: amountPlayed,
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
        // You can clear currentVoucherData or refresh the list if needed
      } else {
        const err = await res.json();
        setMessage(`❌ Delete failed: ${err.message || res.status}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Network error while deleting voucher.");
    }
  };

  // Calculate lengths for colored rows
  const totalEntries = currentVoucherData?.data.length || 0;
  const oneThirdLength = Math.ceil(totalEntries / 3);
  const twoThirdsLength = Math.ceil(totalEntries / 3) * 2;

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl border-2 border-yellow-500 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative text-white font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300 transition text-2xl font-bold"
        >
          &times;
        </button>

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
              Voucher:{" "}
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
                    <th className="border border-gray-600 px-3 py-2 text-left w-1/6">
                      #
                    </th>
                    <th className="border border-gray-600 px-3 py-2 text-left w-3/6">
                      Input
                    </th>
                    <th className="border border-gray-600 px-3 py-2 text-left w-2/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentVoucherData.data.map((entry, entryIdx) => {
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
                        key={entry._id}
                        className={`${
                          entryIdx % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                        } ${rowTextColorClass}`}
                      >
                        <td className="border border-gray-600 px-3 py-0">
                          {entry.serial}
                        </td>
                        <td className="border border-gray-600 px-3 py-0">
                          {entry.isEditing ? (
                            <div>
                              <input
                                type="text"
                                value={entry.editValue}
                                onChange={
                                  (e) =>
                                    handleEditChange(entryIdx, e.target.value) // Removed playerIdx (idx)
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
                        <td className="border border-gray-600 px-3 py-0 space-x-2">
                          {!isVoucherSubmitted && ( // Only show edit/delete if not submitted
                            <>
                              {entry.isEditing ? (
                                <button
                                  onClick={() => handleSaveEdit(entryIdx)} // Removed playerIdx (idx)
                                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition"
                                >
                                  💾
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEdit(entryIdx)} // Removed playerIdx (idx)
                                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded transition"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(entryIdx)} // Removed playerIdx (idx)
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
