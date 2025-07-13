"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { useAgent } from "@/context/AgentContext";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const SubAgentSummary = () => {
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [playersSA, setPlayersSA] = useState([]);
  const [agent, setAgent] = useState(null);
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [date, setDate] = useState("");
  const contentAllRef = useRef(null);
  const playerRefs = useRef({});
  const { agentId, subAgentId, loginAs } = useAgent();

  const fetchPlayersByAgentId = async (agentId) => {
    setLoading(true);
    setFetched(false);

    try {
      const [gameStatusRes, winStatusRes] = await Promise.all([
        fetch("/api/game-status"),
        fetch("/api/win-status"),
      ]);

      const gameStatusData = await gameStatusRes.json();
      const winStatusData = await winStatusRes.json();
      const winDate = winStatusData.date ? new Date(winStatusData.date) : null;

      setThreeUp(winStatusData.threeUp);
      setDownGame(winStatusData.downGame);
      setDate(winStatusData.date);
      const res = await fetch("/api/getPlayersByAgentId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const data = await res.json();
      if (res.ok) {
        const filtered =
          subAgentId && loginAs !== "agent"
            ? data.players.filter((p) => String(p.SAId) === String(subAgentId))
            : data.players.sort((a, b) => parseInt(a.SAId) - parseInt(b.SAId));
        setPlayersSA(filtered || []);
      } else {
        console.error(data.message || "Failed to fetch players.");
        setPlayersSA([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setPlayersSA([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const fetchAgent = async () => {
    try {
      const res = await fetch(`/api/getAgentById?agentId=${agentId}`);
      if (!res.ok) {
        console.error("Agent fetch error:", res.status);
        return;
      }
      const data = await res.json();
      setAgent(data.agent);
    } catch (error) {
      console.error("Error fetching agent:", error.message);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchPlayersByAgentId(agentId);
      fetchAgent();
    }
  }, [agentId]);

  const groupedBySAId = playersSA.reduce((acc, player) => {
    if (!player.SAId) return acc;
    if (!acc[player.SAId]) acc[player.SAId] = [];
    acc[player.SAId].push(player);
    return acc;
  }, {});
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
  const calculateDeductedTotal = (group) => {
    const base = group.reduce(
      (sum, p) => {
        const a = p.amountPlayed || {};
        return {
          OneD: sum.OneD + (a.OneD || 0),
          TwoD: sum.TwoD + (a.TwoD || 0),
          ThreeD: sum.ThreeD + (a.ThreeD || 0),
        };
      },
      { OneD: 0, TwoD: 0, ThreeD: 0 }
    );

    const p = agent?.cPercentages || { oneD: 0, twoD: 0, threeD: 0 };

    const deducted = {
      OneD: base.OneD * ((100 - p.oneD) / 100),
      TwoD: base.TwoD * ((100 - p.twoD) / 100),
      ThreeD: base.ThreeD * ((100 - p.threeD) / 100),
    };

    return {
      ...deducted,
      total: (deducted.OneD + deducted.TwoD + deducted.ThreeD).toFixed(0),
    };
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

  if (loading) return <p>Loading...</p>;
  if (Object.keys(groupedBySAId).length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white
 font-mono"
      >
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg p-6 shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">🎲 No Data Found</h2>
          <p className="text-sm">
            There are no subagent entries available at the moment.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen p-6 bg-gradient-to-br from-black via-gray-900 to-black text-white
 font-mono"
    >
      {Object.entries(groupedBySAId)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([saId, group], groupIndex) => {
          const { OneD, TwoD, ThreeD, total } = calculateDeductedTotal(group);
          return (
            <div key={saId} className="mb-20 max-w-4xl mx-auto">
              <h2 className="text-3xl text-yellow-400 font-extrabold text-center mb-2">
                🎯 {saId}-{group.length}
                <br />
                💰Total:
                <span className="text-green-400 font-mono text-3xl">
                  {total}
                </span>
                <br />
                <div className="text-center text-white font-mono text-lg mt-2">
                  <div className="inline-block bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.6)] border border-yellow-300">
                    <span className="mx-2 text-black font-extrabold tracking-wider">
                      🎯 1D:{" "}
                      <span className="text-white">{OneD.toFixed(0)}</span>
                    </span>
                    <span className="mx-2 text-black font-extrabold tracking-wider">
                      🎯 2D:{" "}
                      <span className="text-white">{TwoD.toFixed(0)}</span>
                    </span>
                    <span className="mx-2 text-black font-extrabold tracking-wider">
                      🎯 3D:{" "}
                      <span className="text-white">{ThreeD.toFixed(0)}</span>
                    </span>
                  </div>
                </div>
              </h2>

              <div
                ref={contentAllRef}
                className="mt-8 max-w-4xl mx-auto space-y-12"
              >
                <button
                  onClick={handleAllDownloadPdf}
                  className="px-16 py-7 mx-auto rounded-xl bg-gray-200 transition duration-300"
                  title="Download Player Info"
                >
                  <img
                    src="/download.svg"
                    alt="Download"
                    className="w-10 h-10"
                  />
                </button>
                {group.forEach((player) => {
                  if (!playerRefs.current[player.voucher]) {
                    playerRefs.current[player.voucher] = React.createRef();
                  }
                })}

                {group.map((player, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      ref={playerRefs.current[player.voucher]}
                      className="bg-white rounded-lg border shadow-md text-black p-4 "
                    >
                      <div className="sm:w-80 mx-auto flex items-center justify-between">
                        <button
                          onClick={() =>
                            handlePlayerDownloadPdf(player.voucher)
                          }
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
                                  if (field === "str" && str > 0)
                                    shouldHighlight = true;
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
                                  if (field === "str" && str > 0)
                                    shouldHighlight = true;
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
                                  highlight
                                    ? "text-red-500 font-bold text-xl"
                                    : ""
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
                            <th className="bg-white px-2 py-1 border">
                              Category
                            </th>
                            <th className="bg-white px-2 py-1 border">
                              Amount
                            </th>
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
                    {idx !== group.length - 1 && (
                      <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse " />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {groupIndex !== Object.keys(groupedBySAId).length - 1 && (
                <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
              )}
            </div>
          );
        })}
      <ScrollToTopButton />
    </div>
  );
};

export default SubAgentSummary;
