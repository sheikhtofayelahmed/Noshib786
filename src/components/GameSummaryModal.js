"use client";
import { useEffect, useState } from "react";
import React, { useRef } from "react";
// import html2pdf from "html2pdf.js";
import { parseISO, format, isValid } from "date-fns";
import Loading from "./Loading";
const GameSummaryModal = ({ item, visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");
  const contentRef = useRef(null);
  const playerRefs = useRef({});
  const [summaryData, setSummaryData] = useState(null);
  const [thisGame, setThisGame] = useState("");
  const [thisGameAmt, setThisGameAmt] = useState("");
  const [exGame, setExGame] = useState("");
  const [exGameAmt, setExGameAmt] = useState("");
  const [currentGame, setCurrentGame] = useState("");
  const [currentGameOperation, setCurrentGameOperation] = useState("");
  const [currentGameAmt, setCurrentGameAmt] = useState("");
  const [jomaType, setJomaType] = useState("");
  const [jomaAmt, setJomaAmt] = useState("");
  const [finalCalType, setFinalCalType] = useState("");
  const [finalCalAmt, setFinalCalAmt] = useState("");
  const [finalCalOperation, setFinalCalOperation] = useState("");
  console.log(currentGame, currentGameAmt, "currentGamecurrentGameAmt");
  const { agentId, gameDate, name, threeUp, downGame, percentages } = item;
  const safeDate = (dateInput) => {
    if (!dateInput) return "Invalid Date";

    let dateObj;

    if (typeof dateInput === "string") {
      dateObj = parseISO(dateInput);
    } else if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else {
      return "Invalid Date";
    }

    return isValid(dateObj) ? format(dateObj, "dd/MM/yyyy") : "Invalid Date";
  };
  // Single useEffect to fetch all initial data that depends on agentId
  useEffect(() => {
    if (!agentId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setFetched(false);
    setError("");

    const fetchAllData = async () => {
      try {
        // 3. Fetch summary data
        // if (formattedDate) {
        const query = new URLSearchParams({
          agentId,
          gameDate,
        }).toString();
        const summaryRes = await fetch(`/api/get-summaries-id-date?${query}`, {
          signal,
        });

        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          setSummaryData(summaryJson.summary || {});
        } else {
          console.warn("⚠️ Could not fetch summary:", await summaryRes.text());
        }
        // }
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

    return () => controller.abort(); // Cleanup on unmount or agentId change
  }, [agentId]);

  const uploadSummary = async () => {
    const cal = {
      thisGame,
      thisGameAmt: Number(thisGameAmt),
      exGame,
      exGameAmt: Number(exGameAmt),
      currentGame,
      currentGameAmt: Number(currentGameAmt),
      currentGameOperation,
      joma: {
        date: new Date().toISOString().split("T")[0],
        jomaType,
        jomaAmt: Number(jomaAmt),
      },
      finalCalType,
      finalCalAmt: Number(finalCalAmt),
      finalCalOperation,
    };

    // Make the API call
    try {
      const res = await fetch("/api/save-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          gameDate: gameDate,
          cal,
        }),
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Summary saved or updated");
      } else {
        alert("⚠️ Summary not saved: " + (result.message || result.error));
      }
    } catch (error) {
      alert("❌ Network error: " + error.message);
    }
  };
  useEffect(() => {
    setThisGame(summaryData?.calculation?.thisGame);
    setThisGameAmt(summaryData?.calculation?.thisGameAmt);
    setExGame(summaryData?.calculation?.exGame);
    setExGameAmt(summaryData?.calculation?.exGameAmt);
    setCurrentGame(summaryData?.calculation?.finalCalType);
    setCurrentGameAmt(summaryData?.calculation?.finalCalAmt);
    // setCurrentGameOperation(summaryData?.calculation?.currentGameOperation);
    // setFinalCalType(summaryData?.calculation?.finalCalType);
    // setFinalCalAmt(summaryData?.calculation?.finalCalAmt);
    // setFinalCalOperation(summaryData?.calculation?.finalCalOperation);
  }, [summaryData]);
  const handleSummaryPrint = (
    agent,
    date,
    threeUp,
    downGame,
    summaryData,
    totalWins
  ) => {
    // Default empty objects to prevent errors if data is null or undefined
    const safeAgent = agent || { name: "", percentages: {} };
    const safeMoneyCal = moneyCal || {
      totalAmounts: { ThreeD: 0, TwoD: 0, OneD: 0 },
      totalGame: 0,
      totalWin: 0,
    };
    const safeTotalWins = totalWins || {};

    const win = window.open("", "_blank");
    win.document.write(`
    <html>
      <head>
        <title>Agent Summary</title>
        <style>
          @page {
            size: 210mm 297mm /* Standard thermal printer paper width */
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 20px;
            color: #000;
            padding: 8px 4px;
            margin: 0;
          }
          .container {
            width: 100%;
          }
          h2 {
            font-size: 20px;
            margin: 4px 0;
            text-align: center;
            font-weight: bold;
          }
          .header-table, .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }
          .header-table td {
            padding: 8px 4px;
            font-size: 20px;
            text-align: center;
            font-weight: bold;
          }
          .summary-table th, .summary-table td {
            border: 1px solid #000;
            padding: 8px 4px; /* Increased from 3px to 5px */
            text-align: center;
            font-size: 16px;
          }
          .summary-table th {
            font-weight: bold;
            background-color: #eee;
          }
          .category-header {
            text-align: left;
            font-weight: bold;
          }
          .total-row td {
            font-weight: bold;
            font-size: 16px;
            padding: 8px 4px;
          }
          .highlight {
            font-weight: bold;
          }
          .final-calc {
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Game & Player Summary</h2>

          <table class="header-table">
            <tr>
              <td>Agent: ${safeAgent.name}</td>
              <td>Date: ${date || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td>3UP: ${threeUp || "XXX"}</td>
              <td>DOWN: ${downGame || "XX"}</td>
            </tr>
          </table>

          <table class="summary-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>3D</th>
                <th>2D</th>
                <th>1D</th>
                <th>STR</th>
                <th>RUM</th>
                <th>DOWN</th>
                <th>SGL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="category-header">Total</td>
                <td>${(safeMoneyCal.totalAmounts?.ThreeD || 0).toFixed(0)}</td>
                <td>${(safeMoneyCal.totalAmounts?.TwoD || 0).toFixed(0)}</td>
                <td>${(safeMoneyCal.totalAmounts?.OneD || 0).toFixed(0)}</td>
                <td class="highlight">${safeTotalWins.STR3D || 0}</td>
                <td class="highlight">${safeTotalWins.RUMBLE3D || 0}</td>
                <td class="highlight">${safeTotalWins.DOWN || 0}</td>
                <td class="highlight">${safeTotalWins.SINGLE || 0}</td>
              </tr>
              <tr>
                <td class="category-header">% / -</td>
                <td>${safeAgent.percentages?.threeD || 0}</td>
                <td>${safeAgent.percentages?.twoD || 0}</td>
                <td>${safeAgent.percentages?.oneD || 0}</td>
                <td class="highlight">${safeAgent.percentages?.str || 0}</td>
                <td class="highlight">${safeAgent.percentages?.rumble || 0}</td>
                <td class="highlight">${safeAgent.percentages?.down || 0}</td>
                <td class="highlight">${safeAgent.percentages?.single || 0}</td>
              </tr>
              <tr>
                <td class="category-header">After Ded.</td>
                <td>${(safeMoneyCal.afterThreeD || 0).toFixed(0)}</td>
                <td>${(safeMoneyCal.afterTwoD || 0).toFixed(0)}</td>
                <td>${(safeMoneyCal.afterOneD || 0).toFixed(0)}</td>
                <td class="highlight">${(safeMoneyCal.afterSTR || 0).toFixed(
                  0
                )}</td>
                <td class="highlight">${(safeMoneyCal.afterRUMBLE || 0).toFixed(
                  0
                )}</td>
                <td class="highlight">${(safeMoneyCal.afterDOWN || 0).toFixed(
                  0
                )}</td>
                <td class="highlight">${(safeMoneyCal.afterSINGLE || 0).toFixed(
                  0
                )}</td>
              </tr>
              
              <tr class="total-row">
                <td colSpan="1" class="final-calc">Total Game</td>
                <td colSpan="1">${(safeMoneyCal.totalGame || 0).toFixed(0)}</td>
                  <td colSpan="2"><td/>
                   <td colSpan="2"><td/>
              </tr>
              <tr class="total-row">
                <td colSpan="1" class="final-calc">Total Win</td>
                <td colSpan="1">${(safeMoneyCal.totalWin || 0).toFixed(0)}</td>
                  <td colSpan="2"><td/>
                   <td colSpan="2"><td/>
              </tr>
              <tr class="total-row">
                <td colSpan="1" class="final-calc"> (ব্যাংকার পাবে)</td>
                <td colSpan="1">${Math.max(
                  0,
                  safeMoneyCal.totalGame - safeMoneyCal.totalWin
                ).toFixed(0)}</td>
                  <td colSpan="2"><td/>
                   <td colSpan="2"><td/>
              </tr>
              <tr class="total-row">
                <td colSpan="1" class="final-calc">(এজেন্ট পাবে)</td>
                <td colSpan="1">${Math.max(
                  0,
                  safeMoneyCal.totalWin - safeMoneyCal.totalGame
                ).toFixed(0)}</td>
                <td colSpan="2"><td/>
                   <td colSpan="2"><td/>
              </tr>
           
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
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

  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = contentRef.current;
    if (element) {
      const options = {
        margin: 10,
        filename: `${name}.${agentId}.${gameDate}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
          background: "#ffffff", // Explicitly set white background for the canvas
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found!");
    }
  };
  const handlePlayerDownloadPdf = async (voucher) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = playerRefs.current[voucher]?.current; // get the correct ref element
    if (element) {
      const options = {
        margin: 10,
        filename: `${voucher}.${agent?.name}.${agentId}.${date}.pdf`,
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

  const calculateCurrentGameAmt = (thisGameAmt, exGameAmt, operation) => {
    const thisGame = parseFloat(thisGameAmt) || 0;
    const exGame = parseFloat(exGameAmt) || 0;
    let currentResult = 0;

    if (operation === "plusCurrent") {
      currentResult = thisGame + exGame;
    } else if (operation === "minusCurrent") {
      currentResult = thisGame - exGame;
    }

    return currentResult.toFixed(0);
  };
  const calculateFinalCalAmt = (currentGameAmt, jomaAmt, operation) => {
    const current = parseFloat(currentGameAmt) || 0;
    const joma = parseFloat(jomaAmt) || 0;
    let finalResult = 0;

    if (operation === "plusFinal") {
      finalResult = current + joma;
    } else if (operation === "minusFinal") {
      finalResult = current - joma;
    }

    return finalResult.toFixed(0);
  };
  if (loading) return <Loading></Loading>;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="relative bg-gradient-to-br from-black to-red-900 text-white font-mono rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
        >
          ✕
        </button>
        {!loading && (
          <div className="mt-8 w-full">
            <div className="overflow-x-auto mt-8 mb-8 max-w-4xl mx-auto">
              <div
                ref={contentRef}
                className="overflow-x-auto my-4 rounded-lg shadow-md ring-2 ring-gray-400 bg-white p-6 text-center"
              >
                <div className="flex justify-between items-center mb-6">
                  {/* <div className="flex items-center gap-4 mt-4"> */}
                  <button
                    onClick={handleDownloadPdf}
                    className="p-2 rounded-xl bg-gray-200 transition duration-300"
                    title="Download Player Info"
                  >
                    <img
                      src="/download.svg"
                      alt="Download"
                      className="w-8 h-8"
                    />
                  </button>

                  <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                    📊 Game & Player Summary
                  </h2>
                  <button
                    onClick={uploadSummary}
                    className="py-2 px-2 bg-gray-200 text-black rounded-xl transition duration-300 text-lg font-medium"
                  >
                    Save
                  </button>
                  {/* </div> */}
                </div>

                <table className="w-full border-collapse font-mono text-sm rounded-lg shadow border border-gray-400">
                  <tbody>
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="px-6 py-4 text-2xl font-bold">
                        {name}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-xl">
                        {safeDate(gameDate)}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-2xl">
                        {threeUp || "XXX"}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-2xl">
                        {downGame || "XX"}
                      </td>
                    </tr>

                    {/* Headers */}
                    <tr className="bg-gray-200 text-gray-900 font-semibold text-sm">
                      <th className="border p-2">Category</th>
                      <th className="border p-2">🎯 3D</th>
                      <th className="border p-2">🎯 2D</th>
                      <th className="border p-2">🎯 1D</th>
                      <th className="border p-2">STR</th>
                      <th className="border p-2">RUMBLE</th>
                      <th className="border p-2">DOWN</th>
                      <th className="border p-2">SINGLE</th>
                    </tr>

                    {/* Total Amounts */}
                    <tr className="bg-gray-50 text-green-700">
                      <td className="border px-4 py-2 font-semibold">Total</td>
                      <td className="border text-center">
                        {summaryData?.totalAmounts?.ThreeD.toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {summaryData?.totalAmounts?.TwoD.toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {summaryData?.totalAmounts?.OneD.toFixed(0)}
                      </td>

                      <td className="border text-center">
                        {summaryData?.totalWins?.STR3D || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.totalWins?.RUMBLE3D || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.totalWins?.DOWN || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.totalWins?.SINGLE || 0}
                      </td>
                    </tr>

                    {/* Percentagess */}
                    <tr className="bg-gray-50 text-gray-700">
                      <td className="border px-4 py-2 font-semibold">% / -</td>
                      <td className="border text-center">
                        {percentages?.threeD || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.twoD || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.oneD || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.str || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.rumble || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.down || 0}
                      </td>
                      <td className="border text-center">
                        {percentages?.single || 0}
                      </td>
                    </tr>

                    <tr className="bg-gray-50 text-gray-800">
                      <td className="border px-4 py-2 font-semibold">
                        After Deduction
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterThreeD || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterTwoD || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterOneD || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterSTR || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterRUMBLE || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterDOWN || 0}
                      </td>
                      <td className="border text-center">
                        {summaryData?.afterSINGLE || 0}
                      </td>
                    </tr>

                    {/* Total Game and Win */}
                    <tr className="bg-gray-100 font-bold text-gray-900">
                      <td colSpan={2} className="border px-4 py-2">
                        Total Game
                      </td>

                      <td className="border px-4 py-2">
                        {summaryData?.totalGame || 0}
                      </td>

                      <td colSpan={5} className="border px-4 py-2 font-bangla">
                        সর্বমোট হিসাব
                      </td>
                    </tr>
                    <tr className="bg-gray-100 font-bold text-gray-900">
                      <td colSpan={2} className="border px-4 py-2">
                        Total Win
                        {summaryData?.expense && summaryData?.totalWin > 0 && (
                          <p className="font-bangla">
                            খরচ {summaryData.Expense}
                          </p>
                        )}
                        {summaryData?.tenPercent &&
                          summaryData?.totalWin > 0 && (
                            <p className="font-bangla">
                              আন্ডার ({summaryData?.tenPercentAmt ?? 0}%) =
                              {summaryData
                                ? summaryData?.underPercentage.toFixed(0)
                                : "0"}
                            </p>
                          )}
                      </td>
                      <td className="border px-4 py-2">
                        {summaryData?.totalWin || 0}
                      </td>
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        <select
                          value={thisGame}
                          onChange={(e) => setThisGame(e.target.value)}
                          className="w-full bg-white border px-2 py-1 text-center"
                        >
                          <option value="option">ই - গেম</option>
                          <option value="adminTGame">
                            ই - গেম ব্যাংকার পাবে
                          </option>
                          <option value="agentTGame">
                            ই - গেম এজেন্ট পাবে
                          </option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 text-red-600"></td>
                      <td className="border px-4 py-2 text-red-600">
                        <input
                          type="number"
                          value={thisGameAmt}
                          onChange={(e) => setThisGameAmt(e.target.value)}
                          placeholder="পরিমাণ"
                          className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                        />
                      </td>
                    </tr>

                    {/* Admin Gets Row */}
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="border px-4 py-2 font-bangla">
                        ব্যাংকার পাবে
                      </td>
                      <td className="border px-4 py-2">
                        {summaryData?.totalGame - summaryData?.totalWin >= 0
                          ? summaryData?.totalGame - summaryData?.totalWin
                          : 0}
                      </td>
                      <td colSpan={3} className="font-bangla border px-4 py-2">
                        <select
                          value={exGame}
                          onChange={(e) => setExGame(e.target.value)}
                          className="w-full bg-white border px-2 py-1 text-center"
                        >
                          <option value="option">সাবেক</option>
                          <option value="adminEx">ব্যাংকার সাবেক</option>
                          <option value="agentEx">এজেন্ট সাবেক</option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 text-red-600"></td>

                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          value={exGameAmt}
                          onChange={(e) => setExGameAmt(e.target.value)}
                          placeholder="পরিমাণ"
                          className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                        />
                      </td>
                    </tr>

                    {/* Agent Gets and Summary Logic */}
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="border px-4 py-2 font-bangla">
                        এজেন্ট পাবে
                      </td>
                      <td className="border px-4 py-2">
                        {summaryData?.totalWin - summaryData?.totalGame >= 0
                          ? summaryData?.totalWin - summaryData?.totalGame
                          : 0}
                      </td>

                      {summaryData?.calculation ? (
                        currentGameAmt && (
                          <>
                            <td
                              colSpan={3}
                              className="font-bangla border px-4 py-2 text-red-700 font-bold"
                            >
                              {currentGame === "finalCalBanker"
                                ? "বর্তমানে ব্যাংকার পাবে"
                                : currentGame === "finalCalAgent"
                                ? "বর্তমানে এজেন্ট পাবে"
                                : ""}
                            </td>
                            <td className="border px-4 py-2 font-bangla"></td>
                            <td className="border px-4 py-2 font-bangla">
                              {currentGameAmt}
                            </td>
                          </>
                        )
                      ) : (
                        <>
                          <td
                            colSpan={3}
                            className="font-bangla border px-4 py-2"
                          >
                            <select
                              value={currentGame}
                              onChange={(e) => setCurrentGame(e.target.value)}
                              className="w-full bg-white border px-2 py-1 text-center"
                            >
                              <option value="option">বর্তমান</option>
                              <option value="adminCurrent">
                                বর্তমানে ব্যাংকার পাবে
                              </option>
                              <option value="agentCurrent">
                                বর্তমানে এজেন্ট পাবে
                              </option>
                            </select>
                          </td>
                          <td className="border px-4 py-2 font-bangla">
                            <select
                              value={currentGameOperation}
                              onChange={(e) => {
                                const value = e.target.value;
                                setCurrentGameOperation(value);
                                const result = calculateCurrentGameAmt(
                                  thisGameAmt,
                                  exGameAmt,
                                  value
                                );
                                setCurrentGameAmt(result);
                              }}
                              className="w-full bg-white border py-1 text-center"
                            >
                              <option value="" disabled>
                                + / -
                              </option>
                              <option value="plusCurrent">+</option>
                              <option value="minusCurrent">−</option>
                            </select>
                          </td>
                          <td className="border px-4 py-2 font-bangla">
                            {currentGameAmt}
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Joma Record */}
                    <tr className="bg-gray-100 text-gray-800">
                      <td
                        colSpan={3}
                        rowSpan={2}
                        className="font-bangla text-sm px-4 py-2 border text-left"
                      >
                        <ol>
                          {summaryData?.calculation?.joma
                            ?.filter((entry) => entry.jomaAmt !== 0)
                            .map((entry, i) => (
                              <li key={i}>
                                📅 {entry.date} (
                                {entry.jomaType === "jomaRegular"
                                  ? "জমা"
                                  : entry.jomaType === "jomaWin"
                                  ? "উইন জমা"
                                  : entry.jomaType === "jomaCash"
                                  ? "নগদ জমা"
                                  : ""}
                                ) 💰 {""}
                                {entry.jomaAmt.toLocaleString("en-US")}
                              </li>
                            ))}
                        </ol>
                      </td>
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        <select
                          value={jomaType}
                          onChange={(e) => setJomaType(e.target.value)}
                          className="w-full bg-white border px-2 py-1 text-center"
                        >
                          <option value="option">জমার ধরণ</option>
                          <option value="jomaRegular">জমা</option>
                          <option value="jomaWin">উইন জমা</option>
                          <option value="jomaCash">নগদ জমা</option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 text-red-600"></td>

                      <td colSpan={2} className="border px-4 py-2">
                        <input
                          type="number"
                          value={jomaAmt}
                          onChange={(e) => setJomaAmt(e.target.value)}
                          placeholder="পরিমাণ"
                          className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                        />
                      </td>
                    </tr>

                    {/* Final Summary */}
                    <tr className="bg-gray-100 text-gray-900 font-bold">
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        <select
                          value={finalCalType}
                          onChange={(e) => setFinalCalType(e.target.value)}
                          className="w-full bg-white border px-2 py-1 text-center"
                        >
                          <option value="option">মোট বর্তমান হিসাব</option>
                          <option value="finalCalBanker">
                            ব্যাংকার মোট পাবে
                          </option>
                          <option value="finalCalAgent">এজেন্ট মোট পাবে</option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 text-red-600">
                        <select
                          value={finalCalOperation}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFinalCalOperation(value);
                            const result = calculateFinalCalAmt(
                              currentGameAmt,
                              jomaAmt,
                              value
                            );
                            setFinalCalAmt(result);
                          }}
                          className="w-full bg-white border py-1 text-center"
                        >
                          <option value="option">+/-</option>
                          <option value="plusFinal">+</option>
                          <option value="minusFinal">−</option>
                        </select>
                      </td>
                      <td className="border px-4 py-2 text-red-600">
                        {finalCalAmt}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSummaryModal;
