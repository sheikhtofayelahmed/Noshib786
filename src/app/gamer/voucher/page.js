"use client";
import { useGamer } from "@/context/GamerContext";
import React, { useState, useEffect, useRef } from "react";

// VoucherModal component for searching, displaying, and editing voucher data
export default function VoucherModal() {
  // Existing state for modal functionality
  const [voucherNumberInput, setVoucherNumberInput] = useState("");
  const [currentVoucherData, setCurrentVoucherData] = useState(null); // Stores the fetched currentVoucherData/voucher data
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { gamerId } = useGamer();
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [error, setError] = useState("");
  const contentRef = useRef(null);

  // Effect to clear state when modal opens/closes to ensure fresh data on each open
  useEffect(() => {
    setVoucherNumberInput("");
    setCurrentVoucherData(null);
    setMessage("");

    setError("");
  }, []);
  // Effect for countdown timer logic

  useEffect(() => {
    if (!gamerId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setError("");

    const fetchAllData = async () => {
      try {
        // 1. Fetch game status and winning numbers in parallel
        const [gameStatusRes, winStatusRes] = await Promise.all([
          fetch("/api/game-status", { signal }),
          fetch("/api/win-status", { signal }),
        ]);

        if (!gameStatusRes.ok || !winStatusRes.ok) {
          throw new Error("Failed to fetch game or win status");
        }

        const winStatusData = await winStatusRes.json();
        if (winStatusData.winStatus) {
          setThreeUp(winStatusData.threeUp);
          setDownGame(winStatusData.downGame);
          setDate(winStatusData.date);
        }

        // setIsGameOn(gameStatusData.isGameOn);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("⏹️ Request aborted");
          return;
        }
        console.error("❌ Error in fetchAllData:", err);
        setError("❌ Unexpected error occurred");
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    fetchAllData();

    return () => controller.abort(); // Cleanup on unmount or gamerId change
  }, [gamerId]);

  // Function to fetch voucher data based on the input voucher number
  const handleSearchVoucher = async () => {
    if (!voucherNumberInput.trim()) {
      setMessage("Please enter a voucher number to search.");
      return;
    }

    setLoading(true);
    setMessage("Searching for voucher...");

    try {
      const apiUrl = `/api/get-voucher-by-number?voucherNumber=${gamerId}-${voucherNumberInput}`;
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
  const getPermutations = (str) => {
    if (!str || str.length <= 1) return [str || ""];
    const perms = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const rest = str.slice(0, i) + str.slice(i + 1);
      for (const perm of getPermutations(rest)) {
        perms.push(char + perm);
      }
    }
    return [...new Set(perms)];
  };

  const getMatchType = (input, threeUp, downGame) => {
    if (!input || !threeUp || !downGame) return { match: false, type: null };

    const number = input.num;
    const permutations = getPermutations(threeUp);
    const reversedDown = downGame.split("").reverse().join("");

    if (number.length === 3) {
      if (number === threeUp) return { match: true, type: "exact3" };
      if (permutations.includes(number)) return { match: true, type: "perm3" };
    }

    if (number.length === 2) {
      if (number === downGame) return { match: true, type: "exact2" };
      if (number === reversedDown) return { match: true, type: "reverse2" };
    }

    if (number.length === 1 && threeUp.includes(number)) {
      return { match: true, type: "single" };
    }

    return { match: false, type: null };
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
                         <h1 class="banglaText">নসীব ৭৮৬</h1>

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
                ).toFixed(1)}</td>
              </tr>
              <tr>
                <td>2D Total</td>
                <td>${player.amountPlayed.TwoD}</td>
                <td>${(
                  player?.amountPlayed?.TwoD *
                  (1 - player.cPercentages.twoD / 100)
                ).toFixed(1)}</td>
              </tr>
              <tr>
                <td>1D Total</td>
                <td>${player.amountPlayed.OneD}</td>
                <td>${
                  player?.amountPlayed?.OneD *
                  (1 - player.cPercentages.oneD / 100).toFixed(1)
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
                ).toFixed(1)}</td>
              </tr>

            </tbody>
          </table>
            <div style="margin-top: 24px; text-align: center;">
          <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">
            ✍️  Agent Signature
          </p>
         <div style="
            display: inline-block;
            width: 200px;
            height: 60px;
            vertical-align: top;
            background-color: #e5e5e5;
            border: 1px solid #ccc;
            box-sizing: border-box;
          "></div>
        </div>
          
          
        </div>
<h2 style="
           margin-top: 10px;
          ">https://noshib786.vercel.app/history</h2>
        </div>
      </body>
    </html>
  `);

    win.document.close();
    win.print();
  };
  const handlePlayerDownloadPdf = async (currentVoucherData) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = contentRef.current; // get the correct ref element
    if (element) {
      const options = {
        margin: 10,
        filename: `${currentVoucherData.voucher}.${gamerId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          background: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found for voucher:", voucher);
    }
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
          <div
            ref={contentRef}
            className="bg-white rounded-lg border shadow-md text-black p-4 "
          >
            <div className="sm:w-80 mx-auto flex items-center justify-between">
              <button
                onClick={() => handlePlayerDownloadPdf(currentVoucherData)}
                className="w-14 h-14 flex items-center justify-center rounded"
              >
                <img src="/download.svg" alt="Download" className="w-8 h-8" />
              </button>
              <h2 className="text-lg font-bold text-center ">
                {currentVoucherData.voucher || ""}
              </h2>{" "}
              <button
                onClick={() => handlePrint(currentVoucherData)}
                className="w-14 h-14 flex items-center justify-center rounded text-white text-2xl"
              >
                🖨️
              </button>
            </div>
            <h2 className="text-lg font-bangla font-semibold text-center mb-1 ">
              Name: {currentVoucherData.name || ""} || Sub Agent:{" "}
              {currentVoucherData.SAId || ""}
            </h2>
            <p className="text-center text-sm mb-2">
              Date: {new Date(currentVoucherData.time).toLocaleString()}
            </p>
            {/* Entries Table */}
            <table className="w-full sm:w-80 text-sm border border-black mx-auto text-center">
              <thead>
                <tr className="bg-gray-200 ">
                  <th className="border px-0">Num</th>
                  <th className="border px-0">Str</th>
                  <th className="border px-0">Rum.</th>
                  <th className="bg-gray-200 border-hidden" />
                  <th className="border px-0">Num</th>
                  <th className="border px-0">Str</th>
                  <th className="border px-0">Rum.</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sortedData = [...currentVoucherData.entries].sort(
                    (a, b) => {
                      const lengthA = String(a.input.num).length || 0;
                      const lengthB = String(b.input.num).length || 0;
                      return lengthB - lengthA;
                    }
                  );

                  const half = Math.ceil(sortedData.length / 2);
                  const col1 = sortedData.slice(0, half);
                  const col2 = sortedData.slice(half);
                  const maxRows = Math.max(col1.length, col2.length);
                  const rows = [];

                  const renderCell = (entry, field) => {
                    if (!entry || !entry.input) return "";

                    const value = entry.input[field];
                    const str = Number(entry.input.str || 0);
                    const rumble = Number(entry.input.rumble || 0);
                    const digitLength = entry.input.num?.length;
                    const { match, type } = getMatchType(
                      entry.input,
                      threeUp,
                      downGame
                    );

                    let shouldHighlight = false;

                    if (!match) return renderValue(value, false);

                    switch (type) {
                      case "exact3":
                        if (field === "num") shouldHighlight = true;
                        if (field === "str" && str > 0) shouldHighlight = true;
                        if (field === "rumble" && rumble > 0)
                          shouldHighlight = true;
                        break;

                      case "perm3":
                        if (rumble > 0) {
                          if (field === "num" || field === "rumble")
                            shouldHighlight = true;
                        }
                        break;

                      case "exact2":
                        if (field === "num") shouldHighlight = true;
                        if (field === "str" && str > 0) shouldHighlight = true;
                        break;

                      case "reverse2":
                        if (field === "rumble" && rumble > 0)
                          shouldHighlight = true;
                        break;

                      case "single":
                        if (str > 0) {
                          if (field === "num" || field === "str")
                            shouldHighlight = true;
                        }
                        break;

                      default:
                        shouldHighlight = false;
                    }

                    return renderValue(value, shouldHighlight);
                  };

                  const renderValue = (value, highlight) => (
                    <span
                      className={
                        highlight ? "text-red-500 font-bold text-xl" : ""
                      }
                    >
                      {value ?? "—"}
                    </span>
                  );

                  for (let i = 0; i < maxRows; i++) {
                    rows.push(
                      <tr key={i}>
                        {/* col1 */}
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col1[i], "num")}
                        </td>
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col1[i], "str")}
                        </td>
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col1[i], "rumble")}
                        </td>

                        {/* spacer */}
                        <td className="bg-gray-200 border-hidden" />

                        {/* col2 */}
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col2[i], "num")}
                        </td>
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col2[i], "str")}
                        </td>
                        <td className="bg-white border px-2 py-1">
                          {renderCell(col2[i], "rumble")}
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })()}
              </tbody>
            </table>
            {/* Totals */}
            <table
              className="w-full sm:w-80 mx-auto mt-4 border border-black border-collapse text-sm "
              border="1"
            >
              <thead>
                <tr>
                  <th className="bg-white px-2 py-1 border">Category</th>
                  <th className="bg-white px-2 py-1 border">Amount</th>
                  <th className="bg-white px-2 py-1 border">After Deduction</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-white px-2 py-1 border">3D Total</td>
                  <td className="bg-white px-2 py-1 border">
                    {currentVoucherData?.amountPlayed?.ThreeD}
                  </td>
                  <td className="bg-white px-2 py-1 border">
                    {(
                      currentVoucherData?.amountPlayed?.ThreeD *
                      (1 - currentVoucherData.cPercentages.threeD / 100)
                    ).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="bg-white px-2 py-1 border">2D Total</td>
                  <td className="bg-white px-2 py-1 border">
                    {currentVoucherData?.amountPlayed?.TwoD}
                  </td>
                  <td className="bg-white px-2 py-1 border">
                    {(
                      currentVoucherData?.amountPlayed?.TwoD *
                      (1 - currentVoucherData.cPercentages.twoD / 100)
                    ).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td className="bg-white px-2 py-1 border">1D Total</td>
                  <td className="bg-white px-2 py-1 border">
                    {currentVoucherData?.amountPlayed?.OneD}
                  </td>
                  <td className="bg-white px-2 py-1 border">
                    {currentVoucherData?.amountPlayed?.OneD *
                      (1 - currentVoucherData.cPercentages.oneD / 100).toFixed(
                        0
                      )}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td
                    colSpan={2}
                    className="bg-white px-2 py-1 border text-right"
                  >
                    Grand Total
                  </td>
                  {/* <td className="bg-white px-2 py-1 border">
                          {(
                            currentVoucherData?.amountPlayed?.ThreeD +
                            currentVoucherData?.amountPlayed?.TwoD +
                            currentVoucherData?.amountPlayed?.OneD
                          ).toFixed(1)}
                        </td> */}
                  <td className="bg-white px-2 py-1 border">
                    {(
                      currentVoucherData?.amountPlayed?.ThreeD *
                        (1 - currentVoucherData.cPercentages.threeD / 100) +
                      currentVoucherData?.amountPlayed?.TwoD *
                        (1 - currentVoucherData.cPercentages.twoD / 100) +
                      currentVoucherData?.amountPlayed?.OneD *
                        (1 - currentVoucherData.cPercentages.oneD / 100)
                    ).toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
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
