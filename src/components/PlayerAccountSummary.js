"use client";
import { useEffect, useState } from "react";
import React, { useRef } from "react";
// import html2pdf from "html2pdf.js";

const PlayerAccountSummary = ({ agentId }) => {
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
  const hasUploadedRef = useRef(false); // to prevent duplicate uploads
  const contentRef = useRef(null);
  const playerRefs = useRef({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setDate(data.date);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/getAgentById?agentId=${agentId}`);

        // Check status and log for debug
        if (!res.ok) {
          const text = await res.text();
          console.error("Response not OK:", res.status, text);
          throw new Error("Failed to fetch agent data");
        }

        const data = await res.json();
        setAgent(data.agent);
      } catch (error) {
        console.error("Error fetching agent:", error.message);
      }
    };

    fetchAgent();
  }, [agentId]);

  const fetchPlayersByAgentId = async (agentId) => {
    setLoading(true);
    setFetched(false);

    try {
      const res = await fetch("/api/getPlayersByAgentId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlayers(data.players || []);
      } else {
        console.error(data.message || "Failed to fetch players.");
        setPlayers([]);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      setPlayers([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const res = await fetch("/api/game-status");
        const data = await res.json();
        setIsGameOn(data.isGameOn);
      } catch (error) {
        console.error("Failed to fetch game status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStatus();
  }, []);

  useEffect(() => {
    if (agentId) {
      fetchPlayersByAgentId(agentId);
    }
  }, [agentId]);

  useEffect(() => {
    async function fetchWins() {
      if (agentId && threeUp && downGame) {
        try {
          const res = await fetch("/api/getWinningPlays", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId, threeUp, downGame }),
          });

          if (!res.ok) throw new Error("Failed to fetch wins");

          const data = await res.json();
          setTotalWins(data.totalWins);
        } catch (err) {
          setError(err.message);
        }
      }
    }
    fetchWins();
  }, [agentId, threeUp, downGame]);

  const getPermutations = (str) => {
    if (!str || str.length <= 1) return [str || ""];
    let perms = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(0, i) + str.slice(i + 1);
      for (const perm of getPermutations(remaining)) {
        perms.push(char + perm);
      }
    }
    return [...new Set(perms)];
  };

  const getMatchType = (input, threeUp, downGame) => {
    if (!input || !threeUp || !downGame) {
      return { match: false, type: null };
    }
    const parts = input.split(".");
    const number = parts[0];
    const amounts = parts.slice(1).map(Number);

    const permutations = getPermutations(threeUp);
    const reversedDown = downGame?.split("").reverse().join("");
    const sumOfDigits = threeUp
      .split("")
      .reduce((sum, d) => sum + parseInt(d), 0);
    const lastDigitOfSum = sumOfDigits % 10;

    if (number.length === 3) {
      if (number === threeUp) {
        return { match: true, type: "str" };
      }
      if (permutations.includes(number) && amounts.length >= 2) {
        return { match: true, type: "rumble" };
      }
    }

    if (number.length === 2) {
      if (number === downGame) {
        return { match: true, type: "down" };
      }
      if (number === reversedDown && amounts.length >= 2) {
        return { match: true, type: "rumble" };
      }
    }

    if (number.length === 1) {
      if (parseInt(number) === lastDigitOfSum) {
        return { match: true, type: "single" };
      }
    }

    return { match: false, type: null };
  };
  useEffect(() => {
    if (totalWins && agent?.percentage) {
      const totalAmounts = players.reduce(
        (acc, player) => {
          acc.ThreeD += player.amountPlayed.ThreeD || 0;
          acc.TwoD += player.amountPlayed.TwoD || 0;
          acc.OneD += player.amountPlayed.OneD || 0;
          return acc;
        },
        { ThreeD: 0, TwoD: 0, OneD: 0 }
      );

      const afterThreeD = Math.floor(
        totalAmounts.ThreeD * (1 - agent.percentage.threeD / 100)
      );
      const afterTwoD = Math.floor(
        totalAmounts.TwoD * (1 - agent.percentage.twoD / 100)
      );
      const afterOneD = Math.floor(
        totalAmounts.OneD * (1 - agent.percentage.oneD / 100)
      );
      const afterSTR = Math.floor(totalWins.STR3D * agent.percentage.str);
      const afterRUMBLE = Math.floor(
        totalWins.RUMBLE3D * agent.percentage.rumble
      );
      const afterDOWN = Math.floor(totalWins.DOWN * agent.percentage.down);
      const afterSINGLE = Math.floor(
        totalWins.SINGLE * agent.percentage.single
      );

      const totalGame = afterThreeD + afterTwoD + afterOneD;
      const totalWin = afterSTR + afterRUMBLE + afterDOWN + afterSINGLE;
      const WL = totalGame - totalWin;

      setMoneyCal({
        afterThreeD,
        afterTwoD,
        afterOneD,
        afterSTR,
        afterRUMBLE,
        afterDOWN,
        afterSINGLE,
        totalGame,
        totalWin,
        totalAmounts,
        WL,
      });
    }
  }, [totalWins, agent?.percentage, players]);
  useEffect(() => {
    const uploadSummary = async () => {
      if (!moneyCal || Object.keys(moneyCal).length === 0) return;

      const res = await fetch("/api/save-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agentId,
          date: date,
          summary: moneyCal,
        }),
      });

      const result = await res.json();
      if (result.success) {
        console.log("✅ Summary saved");
      } else {
        console.log("⚠️ Summary not saved:", result.message || result.error);
      }
    };
    if (
      (moneyCal.afterThreeD,
      moneyCal.afterTwoD,
      moneyCal.afterOneD,
      moneyCal.afterSTR,
      moneyCal.afterRUMBLE,
      moneyCal.afterDOWN,
      moneyCal.afterSINGLE,
      moneyCal.totalGame,
      moneyCal.totalWin,
      moneyCal.totalAmounts,
      moneyCal.WL)
    ) {
      uploadSummary();
    }
  }, [moneyCal, agentId, date]);

  const handleSummaryPrint = (
    agent,
    date,
    threeUp,
    downGame,
    moneyCal,
    totalWins
  ) => {
    // Default empty objects to prevent errors if data is null or undefined
    const safeAgent = agent || { name: "", percentage: {} };
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
            font-size: 18px;
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
                <td>${safeAgent.percentage?.threeD || 0}</td>
                <td>${safeAgent.percentage?.twoD || 0}</td>
                <td>${safeAgent.percentage?.oneD || 0}</td>
                <td class="highlight">${safeAgent.percentage?.str || 0}</td>
                <td class="highlight">${safeAgent.percentage?.rumble || 0}</td>
                <td class="highlight">${safeAgent.percentage?.down || 0}</td>
                <td class="highlight">${safeAgent.percentage?.single || 0}</td>
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
                <td colSpan="1" class="final-calc"> (এডমিন পাবে)</td>
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
    const amountPlayed = player.amountPlayed || { OneD: 0, TwoD: 0, ThreeD: 0 };

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
            font-size: 14px;
            color: #000;
            padding: 4px;
            margin: 0;
          }

          .container {
            width: 100%;
          }

          h2 {
            font-size: 16px;
            margin: 4px 0;
            text-align: center;
            font-weight: bold;
          }

          p {
            font-size: 14px;
            text-align: center;
            margin: 4px 0;
          }

          .input-table {
            width: 100%;
            margin-top: 8px;
            border-collapse: collapse;
            font-size: 14px;
          }

          .input-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            width: 50%;
          }

          .totals-table {
            width: 100%;
            margin-top: 12px;
            border-collapse: collapse;
            font-size: 14px;
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

          .grand-total {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${player.voucher || ""}</h2>
          <h2>Player: ${player.name || ""} || Sub Agent: ${
      player.SAId || ""
    }</h2>
          <p>Date: ${new Date(player.time).toLocaleString()}</p>

          <table class="input-table">
            <tbody>
              ${(() => {
                const sortedData = [...player.entries].sort((a, b) => {
                  const aPrefix = a.input.split(".")[0];
                  const bPrefix = b.input.split(".")[0];
                  return bPrefix.length - aPrefix.length;
                });

                const half = Math.ceil(sortedData.length / 2);
                const col1 = sortedData.slice(0, half);
                const col2 = sortedData.slice(half);

                const maxRows = Math.max(col1.length, col2.length);
                const rows = [];

                for (let i = 0; i < maxRows; i++) {
                  const c1 = col1[i]?.input || "";
                  const c2 = col2[i]?.input || "";
                  rows.push(`<tr><td>${c1}</td><td>${c2}</td></tr>`);
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
                <td>${(
                  amountPlayed?.ThreeD +
                  amountPlayed?.TwoD +
                  amountPlayed?.OneD
                ).toFixed(0)}</td>
                <td>${(
                  amountPlayed?.ThreeD * 0.6 +
                  amountPlayed?.TwoD * 0.8 +
                  amountPlayed?.OneD
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
        image: { type: "jpeg", quality: 0.98 },
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

  if (loading) return <p>Loading...</p>;
  if (fetched && players.length === 0)
    return <p>No players found for this agent.</p>;

  return (
    <div className=" min-h-screen p-6 bg-gradient-to-br from-black to-red-900 text-white font-mono">
      {loading && (
        <p className="text-yellow-300 mt-6">⏳ Loading player data...</p>
      )}

      {!loading && fetched && players.length === 0 && (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-pink-400 text-3xl font-bold text-center">
            😕 No player data found for this agent.
          </p>
        </div>
      )}
      {!loading && players.length > 0 && (
        <div className="mt-8 w-full">
          <div className="overflow-x-auto mt-8 mb-8 max-w-4xl mx-auto">
            <div
              ref={contentRef}
              className="overflow-x-auto my-4 bg-gray-900 bg-opacity-80 rounded-lg shadow-md ring-2 ring-yellow-500 p-6 text-center"
            >
              {/* Flex container to position title and button */}
              <div className="flex justify-between items-center mb-6">
                {/* Title (pushed to the left) */}
                <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl  font-bold text-yellow-400 animate-pulse">
                  📊 Game & Player Summary
                </h2>

                {/* Button container (pushed to the right) */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={handleDownloadPdf}
                    className="p-2 rounded-xl bg-white transition duration-300 flex items-center justify-center"
                    title="Download Player Info"
                  >
                    <img
                      src="/download.svg"
                      alt="Download"
                      className="w-8 h-8" // Equivalent to width: 32px, height: 32px
                    />
                  </button>

                  <button
                    onClick={() =>
                      handleSummaryPrint(
                        agent,
                        date,
                        threeUp,
                        downGame,
                        moneyCal,
                        totalWins
                      )
                    }
                    className="py-2 px-2 bg-white rounded-xl transition duration-300 text-2xl font-medium"
                    title="Print Summary"
                  >
                    🖨️
                  </button>
                </div>
              </div>
              <table className="overflow-x-auto w-full border-collapse font-mono text-sm rounded-lg overflow-hidden shadow-lg">
                <tbody>
                  <tr className="bg-black border border-yellow-700">
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-base sm:text-lg md:text-2xl lg:text-3xl  font-extrabold text-yellow-500 tracking-widest"
                    >
                      {agent?.name}
                    </td>

                    <td
                      colSpan="2"
                      className="px-6 py-4 text-xl font-bold text-white"
                    >
                      {date}
                    </td>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-4xl font-extrabold text-yellow-500 tracking-widest"
                    >
                      {threeUp || "XXX"}
                    </td>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-4xl font-extrabold text-pink-500 tracking-widest"
                    >
                      {downGame || "XX"}
                    </td>
                  </tr>

                  {/* All Players Total Summary Section */}

                  <tr className="bg-green-800 text-white text-lg">
                    <th className="border border-gray-700 px-4 py-3 text-center">
                      Category
                    </th>
                    <th className="border border-gray-700 px-4 py-3 text-center">
                      🎯 3D
                    </th>
                    <th className="border border-gray-700 px-4 py-3 text-center">
                      🎯 2D
                    </th>
                    <th className="border border-gray-700 px-4 py-3 text-center">
                      🎯 1D
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      STR
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      RUMBLE
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      DOWN
                    </th>
                    <th className="border bg-yellow-800 border-gray-700 px-4 py-3 text-center">
                      SINGLE
                    </th>
                  </tr>

                  <tr className="bg-gray-800 text-green-400">
                    <td className="border border-gray-700 px-4 py-2 font-semibold">
                      Total
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.totalAmounts?.ThreeD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.totalAmounts?.TwoD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.totalAmounts?.OneD.toFixed(0)}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins?.STR3D || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500 ">
                      {totalWins?.RUMBLE3D || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins?.DOWN || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {totalWins?.SINGLE || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-800 text-green-400">
                    <td className="border border-gray-700 px-4 py-2 font-semibold">
                      % / -
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {agent?.percentage?.threeD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {agent?.percentage?.twoD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {agent?.percentage?.oneD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.str || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.rumble || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.down || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {agent?.percentage?.single || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-700 text-green-400">
                    <td className="border border-gray-700 px-4 py-2 font-semibold">
                      After Deduction
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.afterThreeD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.afterTwoD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center">
                      {moneyCal?.afterOneD || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal?.afterSTR || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal?.afterRUMBLE || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal?.afterDOWN || 0}
                    </td>
                    <td className="border border-gray-700 px-4 py-2 text-center text-yellow-500">
                      {moneyCal?.afterSINGLE || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-900 font-bold text-lg text-white">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2"
                    >
                      Total Game
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 "
                    >
                      {moneyCal?.totalGame || 0}
                    </td>
                  </tr>

                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-yellow-300"
                    >
                      Total Win
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-yellow-300"
                    >
                      {moneyCal?.totalWin || 0}
                    </td>
                  </tr>
                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="font-bangla border border-gray-700 px-4 py-2 text-red-400"
                    >
                      এডমিন পাবে
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-red-400"
                    >
                      {moneyCal?.totalGame - moneyCal?.totalWin >= 0
                        ? moneyCal?.totalGame - moneyCal?.totalWin
                        : 0}
                    </td>
                  </tr>
                  <tr className="bg-gray-900 font-bold text-lg text-yellow-300">
                    <td
                      colSpan={2}
                      className="font-bangla border border-gray-700 px-4 py-2 text-white"
                    >
                      এজেন্ট পাবে
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-700 px-4 py-2 text-white"
                    >
                      {moneyCal?.totalWin - moneyCal?.totalGame >= 0
                        ? moneyCal?.totalWin - moneyCal?.totalGame
                        : 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-2xl text-yellow-400 mb-6 font-semibold text-center">
            🎉 Player Summary 🎉
          </h3>
          <div className="mt-8 max-w-4xl mx-auto space-y-12">
            {players.forEach((player) => {
              if (!playerRefs.current[player.voucher]) {
                playerRefs.current[player.voucher] = React.createRef();
              }
            })}

            {players.map((player, idx) => (
              <React.Fragment key={idx}>
                <div
                  ref={playerRefs.current[player.voucher]}
                  className="relative bg-white rounded-lg border shadow-md text-black p-4 print:p-1 print:text-black print:shadow-none print:border-none print:rounded-none"
                >
                  {/* Header */}
                  <h2 className="text-lg font-bold text-center mb-2 print:mb-1">
                    {player.voucher || ""}
                  </h2>
                  <h2 className="text-lg font-semibold text-center mb-1 print:mb-1">
                    Player: {player.name || ""} || Sub Agent:{" "}
                    {player.SAId || ""}
                  </h2>
                  <p className="text-center text-sm print:text-xs mb-2">
                    Date: {new Date(player.time).toLocaleString()}
                  </p>

                  <div className="absolute top-2 right-2 print:hidden flex gap-2">
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
                    <button
                      onClick={() => handlePrint(player)}
                      className="w-14 h-14 flex items-center justify-center rounded text-white text-2xl"
                    >
                      🖨️
                    </button>
                  </div>

                  {/* Entries Table */}
                  <table
                    className="w-full text-sm border border-black print:text-xs print:border-collapse print:w-full"
                    border="1"
                  >
                    <tbody>
                      {(() => {
                        const sortedData = [...player.entries].sort((a, b) => {
                          const aPrefix = a.input.split(".")[0];
                          const bPrefix = b.input.split(".")[0];
                          return bPrefix.length - aPrefix.length;
                        });

                        const half = Math.ceil(sortedData.length / 2);
                        const col1 = sortedData.slice(0, half);
                        const col2 = sortedData.slice(half);

                        const maxRows = Math.max(col1.length, col2.length);
                        const rows = [];

                        for (let i = 0; i < maxRows; i++) {
                          const c1 = col1[i]?.input || "";
                          const c2 = col2[i]?.input || "";
                          rows.push(
                            <tr key={i}>
                              <td className="bg-white border px-2 py-1 print:p-1">
                                {c1}
                              </td>
                              <td className="bg-white border px-2 py-1 print:p-1">
                                {c2}
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
                    className="w-full mt-4 border border-black border-collapse text-sm print:text-xs"
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
                          {(player?.amountPlayed?.ThreeD * 0.6).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-white px-2 py-1 border">2D Total</td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.TwoD}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {(player?.amountPlayed?.TwoD * 0.8).toFixed(0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-white px-2 py-1 border">1D Total</td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.OneD}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {player?.amountPlayed?.OneD.toFixed(0)}
                        </td>
                      </tr>
                      <tr className="font-bold">
                        <td className="bg-white px-2 py-1 border">
                          Grand Total
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {(
                            player?.amountPlayed?.ThreeD +
                            player?.amountPlayed?.TwoD +
                            player?.amountPlayed?.OneD
                          ).toFixed(0)}
                        </td>
                        <td className="bg-white px-2 py-1 border">
                          {(
                            player?.amountPlayed?.ThreeD * 0.6 +
                            player?.amountPlayed?.TwoD * 0.8 +
                            player?.amountPlayed?.OneD
                          ).toFixed(0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Divider */}
                {idx !== players.length - 1 && (
                  <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse print:hidden" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAccountSummary;
