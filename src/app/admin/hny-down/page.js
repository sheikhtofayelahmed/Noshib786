"use client";

import Loading from "@/components/Loading";
import NumberTable from "@/components/NumberTable";
import NumberTableSingle from "@/components/NumberTableSingle";
import { useEffect, useState } from "react";

// NumberTable Component - Transformed into a visually striking casino grid
// const NumberTable = ({ rows, data, title }) => (
//   <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
//     {/* <Ticker
//       title={`Hot Numbers (${title})`}
//       data={data.filter((n) => n.totalPlayed > 100)}
//     /> */}
//     <div className="p-6 overflow-x-auto">
//       <h3 className="text-3xl font-bold text-yellow-400 mb-8 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
//         {title} Game Board
//       </h3>
//       <table className="w-full border-collapse text-center text-white font-mono">
//         <tbody>
//           {title !== "Single" && (
//             <tr>
//               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((row, i) => (
//                 <td
//                   key={i}
//                   className="text-5xl text-green-600 p-4 border border-gray-500"
//                 >
//                   {row}
//                 </td>
//               ))}
//             </tr>
//           )}

//           {rows.map((row, i) => (
//             <tr
//               key={i}
//               className={(i + 1) % 2 === 0 ? "border-b-4 border-red-600" : ""}
//             >
//               {row.map((num, j) => {
//                 const found = data.find((d) => d._id === String(num));
//                 const str = found?.totalStr || 0;
//                 const rumble = found?.totalRumble || 0;

//                 const isHot = str > 0 || rumble > 0;
//                 const cellClasses = `
//                   relative p-4 text-3xl font-extrabold uppercase select-none
//                   border border-gray-700 transition-all duration-300 ease-in-out
//                   ${
//                     isHot
//                       ? "bg-gradient-to-br from-yellow-600 to-red-700 text-white shadow-xl transform scale-105"
//                       : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
//                   }
//                 `;

//                 return (
//                   <td key={j} className={cellClasses}>
//                     <div className="relative flex flex-col items-center justify-center w-full h-full space-y-1">
//                       <span className="text-3xl leading-none">{num}</span>
//                       {isHot && (
//                         <div className="flex justify-between">
//                           <div className="mx-2 text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
//                             <span> {str}</span>
//                           </div>
//                           <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
//                             <span> {rumble}</span>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// Main Page Component - Overall casino lounge feel
export default function HappyNewYear() {
  const [numberData, setNumberData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/happyNewYear");
      if (!res.ok) {
        console.error("Failed to fetch number stats:", res.statusText);
        return;
      }
      const data = await res.json();
      setNumberData(data);
      setLoading(false);
    };
    fetchData();
  }, []);
  const getTotalAmountPlayed = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getTotalAmountPlayed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch totals");
      }

      const data = await response.json();
      setTotals(data.totals);
    } catch (err) {
      console.error("Error fetching totals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Call it immediately once
    getTotalAmountPlayed();
  }, []);
  const downRows = [
    ["10", "20", "30", "40", "50", "60", "70", "80", "90", "00"],
    ["01", "02", "03", "04", "05", "06", "07", "08", "09", "XX"],
    ["29", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    ["92", "XX", "21", "31", "41", "51", "61", "71", "81", "91"],
    ["38", "39", "49", "22", "23", "24", "25", "26", "27", "28"],
    ["83", "93", "94", "XX", "32", "42", "52", "62", "72", "82"],
    ["47", "48", "58", "59", "69", "33", "34", "35", "36", "37"],
    ["74", "84", "85", "95", "96", "XX", "43", "53", "63", "73"],
    ["56", "57", "67", "68", "78", "79", "89", "44", "45", "46"],
    ["65", "75", "76", "86", "87", "97", "98", "XX", "54", "64"],
    ["XX", "66", "XX", "77", "XX", "88", "XX", "99", "XX", "55"],
  ];
  const singleRows = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]];

  const columns = [...Array(9).keys()].map((i) => i + 1).concat(0);
  const columnData = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  numberData.forEach((item) => {
    const numStr = item._id.toString();
    const str = item.totalStr;
    const rumble = item.totalRumble;

    // Only process if the original string length is exactly 2
    if (numStr.length === 2 && (str > 100 || rumble > 100)) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;

      if (!columnData[columnKey]) columnData[columnKey] = [];
      columnData[columnKey].push({ number: numStr, str, rumble });
    }
  });
  if (loading) {
    return <Loading></Loading>;
  }
  return (
    <div className="w-full p-8 bg-gradient-to-b from-black to-red-950 min-h-screen font-sans text-gray-100 select-none overflow-x-hidden">
      <h1 className="text-center text-6xl font-extrabold mb-16 uppercase tracking-widest text-red-500 drop-shadow-lg animate-pulse-light">
        🎰 Thai Lottery Agent 🎲
      </h1>
      <div className="max-w-md mx-auto mb-12 p-6 bg-gradient-to-br from-gray-900 via-black to-red-900 rounded-2xl shadow-2xl border-4 border-yellow-500 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6 tracking-wide uppercase drop-shadow-md">
          🎯 Total Amount Played
        </h2>

        <div className="space-y-4 text-center font-mono text-lg">
          <div className="flex justify-between px-4 py-2 bg-gray-800 rounded-lg shadow-inner">
            <span className="text-red-300 font-bold">3D</span>
            <span className="text-white">{totals?.ThreeD ?? "—"}</span>
          </div>
          <div className="flex justify-between px-4 py-2 bg-gray-800 rounded-lg shadow-inner">
            <span className="text-red-300 font-bold">2D</span>
            <span className="text-white">{totals?.TwoD ?? "—"}</span>
          </div>
          <div className="flex justify-between px-4 py-2 bg-gray-800 rounded-lg shadow-inner">
            <span className="text-red-300 font-bold">1D</span>
            <span className="text-white">{totals?.OneD ?? "—"}</span>
          </div>
          <div className="flex justify-between px-4 py-3 bg-gradient-to-r from-green-700 to-green-500 rounded-xl shadow-lg border border-green-300 mt-4">
            <span className="text-white font-bold text-xl">💰 Total</span>
            <span className="text-yellow-300 font-extrabold text-xl">
              {totals?.total ?? "—"}
            </span>
          </div>
        </div>
      </div>
      <NumberTableSingle
        title="Single"
        rows={singleRows}
        data={numberData}
        single={true}
      />
      <div className="mb-16 bg-gray-950 rounded-xl shadow-2xl border-2 border-yellow-600 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          🎯 Hot Numbers
        </h3>
        <table className="w-full text-center font-mono text-sm md:text-base text-white border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-4 bg-red-900 border border-gray-700 text-4xl"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((col) => (
                <td
                  key={col}
                  className="align-top p-2 border border-gray-700 bg-gray-900"
                >
                  {columnData[col].map(({ number, str, rumble }, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center space-y-1 mb-2 p-2 rounded-lg transition-all duration-300 ease-in-out ${
                        idx % 2 !== 0
                          ? "bg-gradient-to-br from-indigo-600 to-sky-700 text-white shadow-xl transform scale-105"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span className="text-3xl font-extrabold uppercase">
                        {number}
                      </span>
                      <div className="flex justify-center space-x-2">
                        <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                          {str}
                        </div>
                        <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                          {rumble}
                        </div>
                      </div>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <NumberTable
        title="Down (2 Digit)"
        rows={downRows}
        data={numberData}
        line={2}
      />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
