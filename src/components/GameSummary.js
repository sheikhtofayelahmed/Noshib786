"use client";
import { useEffect, useState } from "react";
import React, { useRef } from "react";
// import html2pdf from "html2pdf.js";
import { parseISO, format, isValid } from "date-fns";
import Loading from "./Loading";
import ScrollToTopButton from "./ScrollToTopButton";
const GameSummary = ({ agentId }) => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [isGameOn, setIsGameOn] = useState(null);
  const [players, setPlayers] = useState([]);
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [date, setDate] = useState("");
  const [totalWins, setTotalWins] = useState({});
  const [agent, setAgent] = useState({});
  const [error, setError] = useState("");
  const [moneyCal, setMoneyCal] = useState({});
  const [uploadStatus, setUploadStatus] = useState(null);
  const hasUploadedRef = useRef(false);
  const contentRef = useRef(null);
  const contentAllRef = useRef(null);
  const playerRefs = useRef({});
  const [summaryData, setSummaryData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [numberInput, setNumberInput] = useState(0);
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

    setLoading(true);
    setFetched(false);
    setError("");

    const fetchAllData = async () => {
      try {
        // 1. Fetch game status and winning numbers in parallel
        const [gameStatusRes, winStatusRes] = await Promise.all([
          fetch("/api/game-status"),
          fetch("/api/win-status"),
        ]);

        const gameStatusData = await gameStatusRes.json();
        const winStatusData = await winStatusRes.json();
        const winDate = winStatusData.date
          ? new Date(winStatusData.date)
          : null;

        setIsGameOn(gameStatusData.isGameOn);
        setThreeUp(winStatusData.threeUp);
        setDownGame(winStatusData.downGame);
        setDate(winStatusData.date);

        // 2. Fetch agent info
        const agentRes = await fetch(`/api/getAgentById?agentId=${agentId}`);
        if (!agentRes.ok) throw new Error("Failed to fetch agent data");
        const agentData = await agentRes.json();
        setAgent(agentData.agent);

        // 3. Fetch summary
        const formattedDate = winDate ? format(winDate, "yyyy-MM-dd") : null;

        const query = new URLSearchParams({
          agentId,
          gameDate: formattedDate,
        }).toString();

        try {
          const summaryRes = await fetch(`/api/get-summaries-id-date?${query}`);
          if (!summaryRes.ok) {
            console.warn("⚠️ Could not fetch summary");
          } else {
            const res = await summaryRes.json();
            const data = res.summary;
            setSummaryData(data || {});
          }
        } catch (summaryErr) {
          console.error("❌ Error fetching summary:", summaryErr);
        }

        // 4. Fetch players
        try {
          const playersRes = await fetch("/api/getPlayersByAgentId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId }),
          });

          if (!playersRes.ok) {
            const errMsg = await playersRes.text();
            setError("⚠️ Could not load players: " + errMsg);
            setPlayers([]);
            return;
          }

          const playersJson = await playersRes.json();
          setPlayers(playersJson.players || []);
        } catch (err) {
          console.error("❌ Error fetching players:", err);
          setError("❌ Network error: " + err.message);
        }
      } catch (err) {
        console.error("❌ Error in fetchAllData:", err);
        setError("❌ Unexpected error occurred");
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    fetchAllData();
  }, [agentId]);

  useEffect(() => {
    if (!players) return;

    const totalAmounts = players.reduce(
      (acc, p) => {
        acc.ThreeD += p.amountPlayed?.ThreeD || 0;
        acc.TwoD += p.amountPlayed?.TwoD || 0;
        acc.OneD += p.amountPlayed?.OneD || 0;
        return acc;
      },
      { ThreeD: 0, TwoD: 0, OneD: 0 }
    );

    setMoneyCal({
      totalAmounts,
    });
  }, [players]);
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
    const numAmounts = [Number(input.str || 0), Number(input.rumble || 0)];
    const permutations = getPermutations(threeUp);
    const reversedDown = downGame?.split("").reverse().join("");
    if (number.length === 3) {
      if (number === threeUp) return { match: true, type: "str" };
      if (permutations.includes(number) && numAmounts.length >= 2)
        return { match: true, type: "rumble" };
    }

    if (number.length === 2) {
      if (number === downGame) return { match: true, type: "down" };
      if (number === reversedDown && numAmounts.length >= 2)
        return { match: true, type: "rumble" };
    }

    if (number.length === 1 && threeUp.includes(number)) {
      return { match: true, type: "single" };
    }

    return { match: false, type: null };
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
    moneyCal,
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
             h1 { font-size: 20px; text-align: center; margin: 2px 0; }
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
             .first-container {
  border: 1px solid #000;
  padding: 4px;
  margin-bottom: 4px;
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
        filename: `${agent?.name}.${agentId}.${date}.pdf`,
        image: { type: "jpeg", quality: 0.2 },
        html2canvas: {
          scale: 2,
          // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
          background: "#ffffff", // Explicitly set white background for the canvas
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found!");
    }
  };
  const handleAllDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = contentAllRef.current;

    if (element) {
      // Get the element's dimensions
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      // Convert pixels to mm (1px ≈ 0.264583 mm)
      const pxToMm = (px) => px * 0.264583;
      const pdfWidth = pxToMm(elementWidth);
      const pdfHeight = pxToMm(elementHeight);

      const options = {
        margin: 0,
        filename: `All ${agent?.name}.${agentId}.${date}.pdf`,
        image: { type: "jpeg", quality: 0.2 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: [pdfWidth, pdfHeight],
          orientation: "portrait",
        },
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin-slow text-6xl text-yellow-300">🎲</div>
      </div>
    );
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;

  return (
    <div className=" min-h-screen p-6 bg-gradient-to-br from-black to-red-900 text-white font-mono">
      {/* {loading && (
        <p className="text-yellow-300 mt-6">⏳ Loading player data...</p>
      )} */}
      {!loading && fetched && players.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-pink-400 text-3xl font-bold text-center">
            😕 No player data found for this agent.
          </p>
        </div>
      )}
      {!loading && players.length >= 0 && (
        <div className="mt-8 w-full">
          <div className="overflow-x-auto mt-8 mb-8 max-w-4xl mx-auto">
            <div
              ref={contentRef}
              className="overflow-x-auto my-4 rounded-lg shadow-md ring-2 ring-gray-400 bg-white p-6 text-center"
            >
              <div className="flex justify-between items-center mb-6">
                {/* <div className="flex items-center gap-4 mt-4"> */}
                <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                  📊 Game & Player Summary
                </h2>
                <button
                  onClick={handleDownloadPdf}
                  className="p-2 rounded-xl bg-gray-200 transition duration-300"
                  title="Download Player Info"
                >
                  <img src="/download.svg" alt="Download" className="w-8 h-8" />
                </button>
              </div>

              <table className="w-full border-collapse font-mono text-sm rounded-lg shadow border border-gray-400">
                <tbody>
                  <tr className="bg-gray-100 text-gray-800">
                    <td colSpan={2} className="px-6 py-4 text-2xl font-bold">
                      {agent?.name}
                    </td>
                    <td colSpan={2} className="px-6 py-4 text-xl">
                      {safeDate(date)}
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
                      {moneyCal?.totalAmounts?.ThreeD.toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {moneyCal?.totalAmounts?.TwoD.toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {moneyCal?.totalAmounts?.OneD.toFixed(0)}
                    </td>
                    {summaryData ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <td className="border text-center">-</td>
                        <td className="border text-center">- </td>
                        <td className="border text-center">- </td>
                        <td className="border text-center">- </td>
                      </>
                    )}
                  </tr>

                  {/* Percentagess */}
                  <tr className="bg-gray-50 text-gray-700">
                    <td className="border px-4 py-2 font-semibold">% / -</td>
                    <td className="border text-center">
                      {agent?.percentages?.threeD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.twoD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.oneD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.str || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.rumble || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.down || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.percentages?.single || 0}
                    </td>
                  </tr>

                  {/* After Deduction */}
                  {summaryData ? (
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
                  ) : (
                    <tr className="bg-gray-50 text-gray-800">
                      <td className="border px-4 py-2 font-semibold">
                        After Deduction
                      </td>
                      <td className="border text-center">
                        {(
                          moneyCal?.totalAmounts?.ThreeD *
                          (1 - agent?.percentages?.threeD / 100)
                        ).toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {(
                          moneyCal?.totalAmounts?.TwoD *
                          (1 - agent?.percentages?.twoD / 100)
                        ).toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {(
                          moneyCal?.totalAmounts?.OneD *
                          (1 - agent?.percentages?.oneD / 100)
                        ).toFixed(0)}
                      </td>
                      <td className="border text-center">- </td>
                      <td className="border text-center">-</td>
                      <td className="border text-center">- </td>
                      <td className="border text-center">-</td>
                    </tr>
                  )}

                  {/* Total Game and Win */}
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="border px-4 py-2">
                      Total Game
                    </td>
                    {moneyCal.totalAmounts ? (
                      <td className="border px-4 py-2">
                        {(
                          moneyCal?.totalAmounts?.ThreeD *
                            (1 - agent?.percentages?.threeD / 100) +
                          moneyCal?.totalAmounts?.TwoD *
                            (1 - agent?.percentages?.twoD / 100) +
                          moneyCal?.totalAmounts?.OneD *
                            (1 - agent?.percentages?.oneD / 100)
                        ).toFixed(0)}
                      </td>
                    ) : (
                      <td className="border px-4 py-2">
                        {summaryData?.totalGame || 0}
                      </td>
                    )}
                    <td colSpan={5} className="border px-4 py-2 font-bangla">
                      সর্বমোট হিসাব
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="border px-4 py-2">
                      Total Win
                      {summaryData?.expense && summaryData?.totalWin > 0 && (
                        <p className="font-bangla">খরচ {summaryData.Expense}</p>
                      )}
                      {summaryData?.tenPercent && summaryData?.totalWin > 0 && (
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
                      {thisGame === "adminTGame"
                        ? " ই - গেম ব্যাংকার পাবে"
                        : currentGame === "agentTGame"
                        ? "ই - গেম এজেন্ট পাবে"
                        : ""}
                      {/* <select
                        value={thisGame}
                        onChange={(e) => setThisGame(e.target.value)}
                        className="w-full bg-white border px-2 py-1 text-center"
                      >
                        <option value="option">ই - গেম</option>
                        <option value="adminTGame">
                          ই - গেম ব্যাংকার পাবে
                        </option>
                        <option value="agentTGame">ই - গেম এজেন্ট পাবে</option>
                      </select> */}
                    </td>
                    <td colSpan={2} className="border px-4 py-2 text-red-600">
                      {thisGameAmt}
                      {/* <input
                        type="number"
                        value={thisGameAmt}
                        onChange={(e) => setThisGameAmt(e.target.value)}
                        placeholder="পরিমাণ"
                        className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                      /> */}
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
                      {exGame === "adminEx"
                        ? "ব্যাংকার সাবেক"
                        : currentGame === "agentEx"
                        ? "এজেন্ট সাবেক"
                        : ""}
                      {/* <select
                        value={exGame}
                        onChange={(e) => setExGame(e.target.value)}
                        className="w-full bg-white border px-2 py-1 text-center"
                      >
                        <option value="option">সাবেক</option>
                        <option value="adminEx">ব্যাংকার সাবেক</option>
                        <option value="agentEx">এজেন্ট সাবেক</option>
                      </select> */}
                    </td>

                    <td colSpan={2} className="border px-4 py-2">
                      {exGameAmt}
                      {/* <input
                        type="number"
                        value={exGameAmt}
                        onChange={(e) => setExGameAmt(e.target.value)}
                        placeholder="পরিমাণ"
                        className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                      /> */}
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

                    {summaryData?.calculation?.finalCalAmt ? (
                      <>
                        <td
                          colSpan={2}
                          className="font-bangla border px-4 py-2 text-red-700 font-bold"
                        >
                          {currentGame === "finalCalBanker"
                            ? "বর্তমানে ব্যাংকার পাবে"
                            : currentGame === "finalCalAgent"
                            ? "বর্তমানে এজেন্ট পাবে"
                            : ""}
                        </td>
                        <td className="border px-4 py-2 font-bangla">
                          {currentGameAmt}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          colSpan={3}
                          className="font-bangla border px-4 py-2 text-red-700 font-bold"
                        ></td>
                        <td
                          colSpan={2}
                          className="border px-4 py-2 font-bangla"
                        ></td>
                      </>
                    )}
                  </tr>

                  {/* Joma Record */}
                  <tr className="bg-gray-100 text-gray-800">
                    <td
                      colSpan={3}
                      className="border px-4 py-2 font-bangla"
                    ></td>
                    <td
                      colSpan={5}
                      rowSpan={2}
                      className="font-bangla text-sm px-4 py-2 border text-left"
                    >
                      <ol>
                        <p className="text-center">জমা বিবরনী</p>
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
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Agent-Customer */}
            <div className="overflow-x-auto my-4 rounded-lg shadow-md ring-2 ring-gray-400 bg-white p-6 text-center">
              <table className="w-full border-collapse font-mono text-sm rounded-lg shadow border ">
                <tbody>
                  {/* Headers */}
                  <tr className="bg-yellow-200 text-gray-900 font-semibold text-sm">
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
                      {moneyCal?.totalAmounts?.ThreeD.toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {moneyCal?.totalAmounts?.TwoD.toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {moneyCal?.totalAmounts?.OneD.toFixed(0)}
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
                      {agent?.cPercentages?.threeD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.twoD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.oneD || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.str || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.rumble || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.down || 0}
                    </td>
                    <td className="border text-center">
                      {agent?.cPercentages?.single || 0}
                    </td>
                  </tr>
                  {/* After Deduction */}
                  <tr className="bg-gray-50 text-gray-800">
                    <td className="border px-4 py-2 font-semibold">
                      After Deduction
                    </td>
                    <td className="border text-center">
                      {(
                        moneyCal?.totalAmounts?.ThreeD *
                        (1 - agent?.cPercentages?.threeD / 100)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        moneyCal?.totalAmounts?.TwoD *
                        (1 - agent?.cPercentages?.twoD / 100)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        moneyCal?.totalAmounts?.OneD *
                        (1 - agent?.cPercentages?.oneD / 100)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        (summaryData?.totalWins?.STR3D || 0) *
                        (agent?.cPercentages?.str || 0)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        (summaryData?.totalWins?.RUMBLE3D || 0) *
                        (agent?.cPercentages?.rumble || 0)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        (summaryData?.totalWins?.DOWN || 0) *
                        (agent?.cPercentages?.down || 0)
                      ).toFixed(0)}
                    </td>
                    <td className="border text-center">
                      {(
                        (summaryData?.totalWins?.SINGLE || 0) *
                        (agent?.cPercentages?.single || 0)
                      ).toFixed(0)}
                    </td>
                  </tr>
                  {/* Total Game and Win */}
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="border px-4 py-2">
                      Total Game
                    </td>
                    <td colSpan={2} className="border px-4 py-2">
                      {(
                        moneyCal?.totalAmounts?.ThreeD *
                          (1 - agent?.cPercentages?.threeD / 100) +
                        moneyCal?.totalAmounts?.TwoD *
                          (1 - agent?.cPercentages?.twoD / 100) +
                        moneyCal?.totalAmounts?.OneD *
                          (1 - agent?.cPercentages?.oneD / 100)
                      ).toFixed(0)}
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="border px-4 py-2">
                      Total Win
                    </td>
                    <td colSpan={2} className="border px-4 py-2">
                      {(
                        (summaryData?.totalWins?.STR3D || 0) *
                          (agent?.cPercentages?.str || 0) +
                        (summaryData?.totalWins?.RUMBLE3D || 0) *
                          (agent?.cPercentages?.rumble || 0) +
                        (summaryData?.totalWins?.DOWN || 0) *
                          (agent?.cPercentages?.down || 0) +
                        (summaryData?.totalWins?.SINGLE || 0) *
                          (agent?.cPercentages?.single || 0)
                      ).toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-2xl text-yellow-400 mb-6 font-semibold text-center">
            🎉 Player Summary 🎉
          </h3>
          <div
            ref={contentAllRef}
            className="mt-8 max-w-4xl mx-auto space-y-12"
          >
            <button
              onClick={handleAllDownloadPdf}
              className="px-16 py-7 mx-auto rounded-xl bg-gray-200 transition duration-300"
              title="Download Player Info"
            >
              <img src="/download.svg" alt="Download" className="w-10 h-10" />
            </button>
            {players.forEach((player) => {
              if (!playerRefs.current[player.voucher]) {
                playerRefs.current[player.voucher] = React.createRef();
              }
            })}

            {players.map((player, idx) => (
              <React.Fragment key={idx}>
                <div
                  ref={playerRefs.current[player.voucher]}
                  className="bg-white rounded-lg border shadow-md text-black p-4 "
                >
                  <div className="sm:w-80 mx-auto flex items-center justify-between">
                    <button
                      onClick={() => handlePlayerDownloadPdf(player.voucher)}
                      className="w-14 h-14 flex items-center justify-center rounded"
                    >
                      <img
                        src="/download.svg"
                        alt="Download"
                        className="w-8 h-8"
                      />
                    </button>
                    <h2 className="text-lg font-bold text-center ">
                      {player.voucher || ""}
                    </h2>{" "}
                    <button
                      onClick={() => handlePrint(player)}
                      className="w-14 h-14 flex items-center justify-center rounded text-white text-2xl"
                    >
                      🖨️
                    </button>
                  </div>
                  <h2 className="text-lg font-bangla font-semibold text-center mb-1 ">
                    Player: {player.name || ""} || Sub Agent:{" "}
                    {player.SAId || ""}
                  </h2>
                  <p className="text-center text-sm mb-2">
                    Date: {new Date(player.time).toLocaleString()}
                  </p>
                  {/* Entries Table */}
                  <table className="w-full sm:w-80 text-sm border border-black mx-auto text-center">
                    <thead>
                      <tr className="bg-gray-200 ">
                        <th className="border px-0">Num</th>
                        <th className="border px-0">Str</th>
                        <th className="border px-0">Rum.</th>
                        <th className="bg-gray-200" />
                        <th className="border px-0">Num</th>
                        <th className="border px-0">Str</th>
                        <th className="border px-0">Rum.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const sortedData = [...player.entries].sort((a, b) => {
                          const lengthA = String(a.input.num).length || 0;
                          const lengthB = String(b.input.num).length || 0;
                          return lengthB - lengthA;
                        });

                        const half = Math.ceil(sortedData.length / 2);
                        const col1 = sortedData.slice(0, half);
                        const col2 = sortedData.slice(half);
                        const maxRows = Math.max(col1.length, col2.length);
                        const rows = [];

                        const renderCell = (entry, field) => {
                          if (!entry || !entry.input) return "";

                          const value = entry.input[field];
                          const { match, type } = getMatchType(
                            entry.input,
                            threeUp,
                            downGame
                          );

                          const shouldHighlight =
                            match &&
                            (field === "num" ||
                              (field === "str" && type === "str") ||
                              (field === "rumble" &&
                                (type === "rumble" ||
                                  type === "down" ||
                                  type === "single")));

                          return (
                            <span
                              className={
                                shouldHighlight
                                  ? "text-red-500 font-bold text-xl"
                                  : ""
                              }
                            >
                              {value}
                            </span>
                          );
                        };

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
                        <th className="bg-white px-2 py-1 border">
                          After Deduction
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="bg-white px-2 py-1 border">3D Total</td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.ThreeD}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {(
                            player?.amountPlayed?.ThreeD *
                            (1 - player.cPercentages.threeD / 100)
                          ).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-white px-2 py-1 border">2D Total</td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.TwoD}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {(
                            player?.amountPlayed?.TwoD *
                            (1 - player.cPercentages.twoD / 100)
                          ).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-white px-2 py-1 border">1D Total</td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.OneD}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.OneD *
                            (1 - player.cPercentages.oneD / 100).toFixed(0)}
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
                            player?.amountPlayed?.ThreeD +
                            player?.amountPlayed?.TwoD +
                            player?.amountPlayed?.OneD
                          ).toFixed(0)}
                        </td> */}
                        <td className="bg-white px-2 py-1 border">
                          {(
                            player?.amountPlayed?.ThreeD *
                              (1 - player.cPercentages.threeD / 100) +
                            player?.amountPlayed?.TwoD *
                              (1 - player.cPercentages.twoD / 100) +
                            player?.amountPlayed?.OneD *
                              (1 - player.cPercentages.oneD / 100)
                          ).toFixed(0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Divider */}
                {idx !== players.length - 1 && (
                  <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse " />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
};

export default GameSummary;
