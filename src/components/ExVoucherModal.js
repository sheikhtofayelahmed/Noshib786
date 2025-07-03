"use client";
import { useEffect, useState } from "react";
import React, { useRef } from "react";
// import html2pdf from "html2pdf.js";
import { parseISO, format, isValid } from "date-fns";
import Loading from "./Loading";
const ExVoucher = ({ item, visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [players, setPlayers] = useState([]);
  const [date, setDate] = useState("");
  const [agent, setAgent] = useState({});
  const [error, setError] = useState(null);
  const playerRefs = useRef({});
  const { agentId, gameDate, threeUp, downGame } = item; // replace with actual data source  // Single useEffect to fetch all initial data that depends on agentId
  useEffect(() => {
    if (!agentId) return;

    setLoading(true);
    setFetched(false);
    setError("");

    const fetchAllData = async () => {
      try {
        // 1. Fetch game status and winning numbers in parallel

        // 2. Fetch agent info
        const agentRes = await fetch(
          `/api/getAgentById?agentId=${agentId}`,
          {}
        );
        if (!agentRes.ok) throw new Error("Failed to fetch agent data");

        const agentData = await agentRes.json();
        setAgent(agentData.agent);

        // 4. Fetch players

        const playersRes = await fetch("/api/getExPlayers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, gameDate, threeUp, downGame }),
        });

        if (playersRes.ok) {
          const playersJson = await playersRes.json();
          setPlayers(playersJson.players || []);
        } else {
          const errMsg = await playersRes.text();
          setError("⚠️ Could not load players: " + errMsg);
          setPlayers([]);
        }
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
  }, [agentId]);

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

  if (loading) return <Loading></Loading>;
  if (fetched && players.length === 0)
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
        <div className="relative max-w-fit bg-gradient-to-br from-black to-red-900 text-white font-mono rounded-xl  w-full max-h-[90vh] overflow-y-auto p-6">
          <p className="m-5">No players found for this agent.</p>
          <button
            onClick={onClose}
            className="absolute top-1 right-1 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2 "
          >
            ✕
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="relative bg-gradient-to-br from-black to-red-900 text-white font-mono rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
        {loading && (
          <p className="text-yellow-300 mt-6">⏳ Loading player data...</p>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
        >
          ✕
        </button>
        {!loading && fetched && players.length === 0 && (
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-pink-400 text-3xl font-bold text-center">
              😕 No player data found for this agent.
            </p>
          </div>
        )}
        {!loading && players.length >= 0 && (
          <div className="mt-8 w-full">
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
                          <th className="bg-gray-200 border-hidden" />
                          <th className="border px-0">Num</th>
                          <th className="border px-0">Str</th>
                          <th className="border px-0">Rum.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedData = [...player.entries].sort(
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
                          <th className="bg-white px-2 py-1 border">
                            Category
                          </th>
                          <th className="bg-white px-2 py-1 border">Amount</th>
                          <th className="bg-white px-2 py-1 border">
                            After Deduction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="bg-white px-2 py-1 border">
                            3D Total
                          </td>
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
                          <td className="bg-white px-2 py-1 border">
                            2D Total
                          </td>
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
                          <td className="bg-white px-2 py-1 border">
                            1D Total
                          </td>
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
      </div>
    </div>
  );
};

export default ExVoucher;
