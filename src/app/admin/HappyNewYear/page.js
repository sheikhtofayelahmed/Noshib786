"use client";

import { useEffect, useState } from "react";

// Ticker Component - Modernized with a richer neon glow
const Ticker = ({ data, title }) => (
  <div className="w-full  overflow-hidden whitespace-nowrap py-3 border-b-2 border-red-600 mb-8 bg-gradient-to-r from-gray-900 to-black shadow-lg">
    <div className="animate-marquee text-2xl font-extrabold uppercase tracking-wider text-green-400">
      <span className="mr-24 px-4 py-2 bg-gradient-to-r from-red-700 to-yellow-500 text-white rounded-r-full shadow-inner">
        {title}:
      </span>
      {data.map((item, i) => (
        <span key={i} className="mr-16 text-yellow-300">
          <span className="text-white font-bold">{item._id}</span> ={" "}
          <span className="text-green-400">{item.totalPlayed}</span>
        </span>
      ))}
    </div>
  </div>
);

// NumberTable Component - Transformed into a visually striking casino grid
const NumberTable = ({ rows, data, title }) => (
  <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
    {/* <Ticker
      title={`Hot Numbers (${title})`}
      data={data.filter((n) => n.totalPlayed > 100)}
    /> */}
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
              ))}{" "}
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

  const downRows = [
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 0],
    [29, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    [38, 39, 49, 22, 23, 24, 25, 26, 27, 28],
    [47, 48, 58, 59, 69, 33, 34, 35, 36, 37],
    [56, 57, 67, 68, 78, 79, 89, 44, 45, 46],
    ["XX", 66, "XX", 77, "XX", 88, "XX", 99, "XX", 55],
  ];

  const doubleRows = [
    [100, 110, 166, 112, 113, 114, 115, 116, 117, 118],
    [119, 200, 229, 220, 122, 277, 133, 224, 144, 226],
    [155, 228, 300, 266, 177, 330, 188, 233, 199, 244],
    [227, 255, 337, 338, 339, 448, 223, 288, 225, 299],
    [335, 336, 355, 400, 366, 466, 377, 440, 388, 334],
    [344, 499, 445, 446, 447, 556, 449, 477, 559, 488],
    [399, 660, 599, 455, 500, 600, 557, 558, 577, 550],
    [588, 688, 779, 699, 799, 880, 566, 800, 667, 668],
    [669, 778, 788, 770, 889, 899, 700, 990, 900, 677],
    [777, 444, 111, 888, 555, 222, 999, 666, 333, "000"],
  ];

  const threeDigitRows = [
    [128, 129, 120, 130, 140, 123, 124, 125, 126, 127],
    [137, 138, 139, 149, 159, 150, 160, 134, 135, 136],
    [146, 147, 148, 158, 168, 169, 179, 170, 180, 145],
    [236, 156, 157, 167, 230, 178, 250, 189, 234, 190],
    [245, 237, 238, 239, 249, 240, 269, 260, 270, 235],
    [290, 246, 247, 248, 258, 259, 278, 279, 289, 280],
    [380, 345, 256, 257, 267, 268, 340, 350, 360, 370],
    [470, 390, 346, 347, 348, 349, 359, 369, 379, 389],
    [489, 480, 490, 356, 357, 358, 368, 378, 450, 460],
    [560, 570, 580, 590, 456, 367, 458, 459, 469, 479],
    [579, 589, 670, 680, 690, 457, 467, 468, 478, 569],
    [678, 679, 689, 789, 780, 790, 890, 567, 568, 578],
  ];
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
      <div className="mb-16 bg-gray-950 rounded-xl shadow-2xl border-2 border-yellow-600 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          🎯 Hot Numbers by Last Digit of Sum
        </h3>
        <table className="w-full text-center font-mono text-sm md:text-base text-white">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-2 bg-red-900 border border-gray-700 text-4xl"
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
                  {columnData[col].map(({ number, played }, idx) => (
                    <div
                      key={idx}
                      className="text-green-400 font-bold text-2xl mb-1 px-1"
                    >
                      <span className="text-white">{number}</span> = {played}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <NumberTable title="Single" rows={singleRows} data={numberData} />
      <NumberTable title="Down (2 Digit)" rows={downRows} data={numberData} />
      <NumberTable
        title="Double (3 Digit - 2 Aligned)"
        rows={doubleRows}
        data={numberData}
      />
      <NumberTable
        title="3 Digit Unique"
        rows={threeDigitRows}
        data={numberData}
      />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
