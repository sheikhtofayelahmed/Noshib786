"use client";

import { useEffect, useState } from "react";

// Ticker Component - Modernized with a richer neon glow

// NumberTable Component - Transformed into a visually striking casino grid
const NumberTable = ({ rows, data, title }) => (
  <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
    <div className="p-6 overflow-x-auto">
      <h3 className="text-3xl font-bold text-yellow-400 mb-8 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
        {title} Game Board
      </h3>
      <table className="w-full border-collapse text-center text-white font-mono">
        <tbody>
          {title !== "Single" && (
            <tr>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row, i) => (
                <td
                  key={i}
                  className="text-5xl text-green-600 p-4 border border-gray-500"
                >
                  {row}
                </td>
              ))}
            </tr>
          )}

          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((num, j) => {
                const found = data.find((d) => d._id === String(num));
                const played = found?.totalPlayed || 0;

                const isHot = played > 0;
                const cellClasses = `
                  relative p-4 text-3xl font-extrabold uppercase select-none
                  border border-gray-700 transition-all duration-300 ease-in-out
                  ${
                    isHot
                      ? "bg-gradient-to-br from-yellow-600 to-red-700 text-white shadow-xl transform scale-105"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }
                `;

                return (
                  <td key={j} className={cellClasses}>
                    {num}
                    {isHot && (
                      <div className="absolute bottom-1 right-2 text-xl font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md">
                        {played}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Main Page Component - Overall casino lounge feel
export default function HappyNewYear() {
  const [numberData, setNumberData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/happyNewYear");
      if (!res.ok) {
        console.error("Failed to fetch number stats:", res.statusText);
        return;
      }
      const data = await res.json();
      setNumberData(data);
    };
    fetchData();
  }, []);

  const singleRows = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]];

  const columns = Array.from({ length: 10 }, (_, i) => i); // 0–9 columns

  const columnData = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  numberData.forEach((item) => {
    const numStr = item._id;
    const played = item.totalPlayed;

    if (played > 100) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;

      columnData[columnKey].push({ number: numStr, played });
    }
  }); // ✅ <-- fixed missing parenthesis

  return (
    <div className="w-full p-8 bg-gradient-to-b from-black to-red-950 min-h-screen font-sans text-gray-100 select-none overflow-x-hidden">
      <h1 className="text-center text-6xl font-extrabold mb-16 uppercase tracking-widest text-red-500 drop-shadow-lg animate-pulse-light">
        🎰 Thai Lottery Agent 🎲
      </h1>

      <NumberTable title="Single" rows={singleRows} data={numberData} />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
