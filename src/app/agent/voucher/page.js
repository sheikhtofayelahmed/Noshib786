"use client";
import { useAgent } from "@/context/AgentContext";
import React, { useState, useEffect } from "react";

// VoucherModal component for searching, displaying, and editing voucher data
export default function VoucherModal() {
  // Existing state for modal functionality
  const [voucherNumberInput, setVoucherNumberInput] = useState("");
  const [currentVoucherData, setCurrentVoucherData] = useState(null); // Stores the fetched player/voucher data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { agentId } = useAgent();
  const [error, setError] = useState("");

  // State variables integrated from the provided code
  const [amountPlayed, setAmountPlayed] = useState({
    OneD: 0,
    TwoD: 0,
    ThreeD: 0,
  });

  // Effect to clear state when modal opens/closes to ensure fresh data on each open
  useEffect(() => {
    setVoucherNumberInput("");
    setCurrentVoucherData(null);
    setMessage("");
    setAmountPlayed({ OneD: 0, TwoD: 0, ThreeD: 0 }); // Reset totals

    setError("");
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

  // Function to fetch voucher data based on the input voucher number
  const handleSearchVoucher = async () => {
    if (!voucherNumberInput.trim()) {
      setMessage("Please enter a voucher number to search.");
      return;
    }

    setLoading(true);
    setMessage("Searching for voucher...");

    try {
      const apiUrl = `/api/get-voucher-by-number?voucherNumber=${agentId}-${voucherNumberInput}`;
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
        setAmountPlayed(totals);

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
            <button
              onClick={() => handlePrint(currentVoucherData)}
              className="w-14 h-14 mx-auto flex items-center justify-center rounded text-white text-2xl"
            >
              🖨️
            </button>
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

                <p className="text-gray-400 text-sm">
                  Entries: {currentVoucherData?.entries.length}
                </p>
              </div>
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
                  </tr>
                </thead>
                <tbody>
                  {currentVoucherData.data.map((entry, entryIdx) => {
                    return (
                      <tr key={entryIdx}>
                        <td className="border border-gray-600 px-3 py-0">
                          {entryIdx + 1}
                        </td>

                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.num}
                        </td>
                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.str}
                        </td>
                        <td className="border border-gray-600 px-3 py-1">
                          {entry.input.rumble}
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
