"use client";
import { useEffect, useState } from "react";
import React, { useRef } from "react";
import { parseISO, format, isValid } from "date-fns";
import Loading from "./Loading";

const GameSummary = ({ item, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [isGameOn, setIsGameOn] = useState(null);
  const [players, setPlayers] = useState([]);
  const [threeUp, setThreeUp] = useState();
  const [downGame, setDownGame] = useState();
  const [totalWins, setTotalWins] = useState({});
  const [agent, setAgent] = useState({});
  const [error, setError] = useState("");
  const [moneyCal, setMoneyCal] = useState({});
  const [uploadStatus, setUploadStatus] = useState(null);
  const hasUploadedRef = useRef(false);
  const contentRef = useRef(null);
  const playerRefs = useRef({});
  const [selectedOption, setSelectedOption] = useState("");
  const [numberInput, setNumberInput] = useState(0);
  const [jomaInput, setJomaInput] = useState("");

  const safeDate = (dateStr) => {
    if (!dateStr) return "Invalid Date";
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, "dd/MM/yyyy") : "Invalid Date";
  };

  const handleDownloadPdf = async (agentId, name, date) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = contentRef.current;
    if (element) {
      const options = {
        margin: 10,
        filename: `${name}.${agentId}.${date}.pdf`,
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
  // -- render remains unchanged --

  console.log(item);
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
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800">
                    📊 Game & Player Summary
                  </h2>{" "}
                  <button
                    onClick={() =>
                      handleDownloadPdf(item.agentId, item.name, item.gameDate)
                    }
                    className="p-2 rounded-xl bg-gray-200 transition duration-300"
                    title="Download Player Info"
                  >
                    <img
                      src="/download.svg"
                      alt="Download"
                      className="w-8 h-8"
                    />
                  </button>
                  {/* </div> */}
                </div>

                <table className="w-full border-collapse font-mono text-sm rounded-lg shadow border border-gray-400">
                  <tbody>
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="px-6 py-4 text-2xl font-bold">
                        {item?.name}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-xl">
                        {safeDate(item.gameDate)}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-2xl">
                        {item.threeUp || "XXX"}
                      </td>
                      <td colSpan={2} className="px-6 py-4 text-2xl">
                        {item.downGame || "XX"}
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
                        {item?.totalAmounts?.ThreeD.toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {item?.totalAmounts?.TwoD.toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {item?.totalAmounts?.OneD.toFixed(0)}
                      </td>
                      <td className="border text-center">
                        {item?.totalWins?.STR3D || 0}
                      </td>
                      <td className="border text-center">
                        {item?.totalWins?.RUMBLE3D || 0}
                      </td>
                      <td className="border text-center">
                        {item?.totalWins?.DOWN || 0}
                      </td>
                      <td className="border text-center">
                        {item?.totalWins?.SINGLE || 0}
                      </td>
                    </tr>

                    {/* Percentagess */}
                    <tr className="bg-gray-50 text-gray-700">
                      <td className="border px-4 py-2 font-semibold">% / -</td>
                      <td className="border text-center">
                        {item?.percentages?.threeD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.twoD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.oneD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.str || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.rumble || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.down || 0}
                      </td>
                      <td className="border text-center">
                        {item?.percentages?.single || 0}
                      </td>
                    </tr>

                    {/* After Deduction */}
                    <tr className="bg-gray-50 text-gray-800">
                      <td className="border px-4 py-2 font-semibold">
                        After Deduction
                      </td>
                      <td className="border text-center">
                        {item?.afterThreeD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterTwoD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterOneD || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterSTR || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterRUMBLE || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterDOWN || 0}
                      </td>
                      <td className="border text-center">
                        {item?.afterSINGLE || 0}
                      </td>
                    </tr>

                    {/* Total Game and Win */}
                    <tr className="bg-gray-100 font-bold text-gray-900">
                      <td colSpan={2} className="border px-4 py-2">
                        Total Game
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        {item?.totalGame || 0}
                      </td>
                      <td colSpan={4} className="border px-4 py-2 font-bangla">
                        সর্বমোট হিসাব
                      </td>
                    </tr>

                    <tr className="bg-gray-100 font-bold text-gray-900">
                      <td colSpan={2} className="border px-4 py-2">
                        Total Win
                        {item.expense && item.totalWin > 0 && (
                          <p className="font-bangla">খরচ {item.Expense}</p>
                        )}
                        {item.tenPercent && item.totalWin > 0 && (
                          <p className="font-bangla">
                            আন্ডার ({item?.tenPercentAmt ?? 0}%) =
                            {item ? item?.underPercentage.toFixed(0) : "0"}
                          </p>
                        )}
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        {item?.totalWin || 0}
                      </td>
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        {item?.totalGame > item?.totalWin
                          ? "গেম এ ব্যাংকার পাবে"
                          : "গেম এ এজেন্ট পাবে"}
                      </td>
                      <td className="border px-4 py-2 text-red-600">
                        {Math.abs(
                          (item?.totalGame || 0) - (item?.totalWin || 0)
                        )}
                      </td>
                    </tr>

                    {/* Admin Gets Row */}
                    <tr className="bg-gray-100 text-gray-800">
                      <td colSpan={2} className="border px-4 py-2 font-bangla">
                        ব্যাংকার পাবে
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        {item?.totalGame - item?.totalWin >= 0
                          ? item?.totalGame - item?.totalWin
                          : 0}
                      </td>
                      <td colSpan={3} className="border px-4 py-2">
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-full bg-white border px-2 py-1 text-center"
                        >
                          <option value="option">সাবেক</option>
                          <option value="adminEx">ব্যাংকার সাবেক</option>
                          <option value="agentEx">এজেন্ট সাবেক</option>
                        </select>
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        <input
                          type="number"
                          value={numberInput}
                          onChange={(e) => setNumberInput(e.target.value)}
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
                      <td colSpan={2} className="border px-4 py-2">
                        {item?.totalWin - item?.totalGame >= 0
                          ? item?.totalWin - item?.totalGame
                          : 0}
                      </td>
                      {(() => {
                        const game = item?.totalGame || 0;
                        const win = item?.totalWin || 0;
                        const netNow = game - win;
                        const previous = Number(numberInput) || 0;
                        let finalNet = 0;

                        if (selectedOption === "adminEx")
                          finalNet = netNow + previous;
                        else if (selectedOption === "agentEx")
                          finalNet = netNow - previous;

                        return (
                          <>
                            <td
                              colSpan={3}
                              className="border px-4 py-2 font-bangla"
                            >
                              {finalNet > 0
                                ? "ব্যাংকার বর্তমান"
                                : "এজেন্ট বর্তমান"}
                            </td>
                            <td colSpan={3} className="border px-4 py-2">
                              {Math.abs(finalNet)}
                            </td>
                          </>
                        );
                      })()}
                    </tr>

                    {/* Joma Record */}
                    <tr className="bg-gray-100 text-gray-800">
                      <td
                        colSpan={4}
                        rowSpan={2}
                        className="text-sm px-4 py-2 border"
                      >
                        <ol>
                          {item?.joma
                            ?.filter((entry) => entry.amount !== 0)
                            .map((entry, i) => (
                              <li key={i}>
                                📅 {entry.date} 💰{" "}
                                {entry.amount.toLocaleString("en-US")}
                              </li>
                            ))}
                        </ol>
                      </td>
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        জমা
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        <input
                          type="number"
                          value={jomaInput}
                          onChange={(e) => setJomaInput(e.target.value)}
                          placeholder="পরিমাণ"
                          className="w-full font-bangla bg-gray-100 border text-center px-2 py-1"
                        />
                      </td>
                    </tr>

                    {/* Final Summary */}
                    <tr className="bg-gray-100 text-gray-900 font-bold">
                      <td colSpan={3} className="border px-4 py-2 font-bangla">
                        ফাইনাল হিসাব
                      </td>
                      <td colSpan={2} className="border px-4 py-2">
                        {(() => {
                          const game = moneyCal?.totalGame || 0;
                          const win = moneyCal?.totalWin || 0;
                          const netNow = game - win;
                          const previous = Number(numberInput) || 0;
                          const joma = Number(jomaInput) || 0;
                          let finalNet = 0;

                          if (selectedOption === "adminEx")
                            finalNet = netNow + previous;
                          else if (selectedOption === "agentEx")
                            finalNet = netNow - previous;

                          return finalNet - joma;
                        })()}
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

export default GameSummary;
