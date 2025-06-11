"use client";

import { useEffect, useState } from "react";

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
      console.log(data, "fetch dataa");
      setNumberData(data);
    };
    fetchData();
  }, []);

  const doubleRows = [
    ["000", "001", "002", "003", "004", "005", "006", "007", "008", "009"],
    ["010", "011", "020", "022", "030", "033", "040", "044", "050", "055"],
    ["060", "066", "070", "077", "080", "088", "090", "099", "100", "101"],
    ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
    ["121", "122", "131", "133", "141", "144", "151", "155", "161", "166"],
    ["171", "177", "181", "188", "191", "199", "200", "202", "211", "212"],
    ["220", "221", "222", "223", "224", "225", "226", "227", "228", "229"],
    ["232", "233", "242", "244", "252", "255", "262", "266", "272", "277"],
    ["282", "288", "292", "299", "300", "303", "311", "313", "322", "323"],
    ["330", "331", "332", "333", "334", "335", "336", "337", "338", "339"],
    ["343", "344", "353", "355", "363", "366", "373", "377", "383", "388"],
    ["393", "399", "400", "404", "411", "414", "422", "424", "433", "434"],
    ["440", "441", "442", "443", "444", "445", "446", "447", "448", "449"],
    ["454", "455", "464", "466", "474", "477", "484", "488", "494", "499"],
    ["500", "505", "511", "515", "522", "525", "533", "535", "544", "545"],
    ["550", "551", "552", "553", "554", "555", "556", "557", "558", "559"],
    ["565", "566", "575", "577", "585", "588", "595", "599", "600", "606"],
    ["611", "616", "622", "626", "633", "636", "644", "646", "655", "656"],
    ["660", "661", "662", "663", "664", "665", "666", "667", "668", "669"],
    ["676", "677", "686", "688", "696", "699", "700", "707", "711", "717"],
    ["722", "727", "733", "737", "744", "747", "755", "757", "766", "767"],
    ["770", "771", "772", "773", "774", "775", "776", "777", "778", "779"],
    ["787", "788", "797", "799", "800", "808", "811", "818", "822", "828"],
    ["833", "838", "844", "848", "855", "858", "866", "868", "877", "878"],
    ["880", "881", "882", "883", "884", "885", "886", "887", "888", "889"],
    ["898", "899", "900", "909", "911", "919", "922", "929", "933", "939"],
    ["944", "949", "955", "959", "966", "969", "977", "979", "988", "989"],
    ["990", "991", "992", "993", "994", "995", "996", "997", "998", "999"],
  ];

  const columns = Array.from({ length: 10 }, (_, i) => i);
  const columnDataBySum = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  const patternData = {
    xxx: [],
    xxy: [],
    xyy: [],
    xyx: [],
  };

  numberData.forEach((item) => {
    const numStr = item._id;
    const played = item.totalPlayed;

    // Group by last digit of digit sum
    if (played > 100) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;
      columnDataBySum[columnKey].push({ number: numStr, played });
    }

    // Group by 3-digit patterns
    if (numStr.length === 3 && played > 100) {
      const [a, b, c] = numStr;
      let type = null;
      if (a === b && b === c) {
        type = "xxx"; // All digits are the same (e.g., 111, 222)
      } else if (a === b && b !== c) {
        type = "xxy"; // First two are the same, third is different (e.g., 112, 330)
      } else if (a !== b && b === c) {
        type = "xyy"; // Last two are the same, first is different (e.g., 122, 455)
      } else if (a === c && a !== b) {
        // This covers "xyx" where middle is different
        type = "xyx"; // First and third are the same, middle is different (e.g., 121, 050)
      }
      if (type) {
        console.log(numStr, played, a, b, c, type);
        patternData[type].push({ number: numStr, played });
      }
    }
  });

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
              {columns.map((_, modIndex) => {
                const matchingNumbers = [];

                // Loop through each pattern type
                Object.keys(patternData).forEach((patternType) => {
                  patternData[patternType].forEach(({ number, played }) => {
                    const digitSumMod =
                      number
                        .toString()
                        .split("")
                        .reduce((acc, d) => acc + Number(d), 0) % 10;

                    if (digitSumMod === modIndex) {
                      matchingNumbers.push(
                        <div
                          key={`${patternType}-${number}`}
                          className=" text-green-400 font-bold text-2xl mb-1 px-1"
                        >
                          <span className="text-white">{number}</span> ={" "}
                          {played}
                        </div>
                      );
                    }
                  });
                });

                return (
                  <td
                    key={modIndex}
                    className="bg-gray-900 p-4 rounded-lg border border-gray-700 align-top"
                  >
                    {matchingNumbers.length > 0 && (
                      <ul className="list-disc list-inside text-white">
                        {matchingNumbers}
                      </ul>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <NumberTable
        title="Double (3 Digit - 2 Aligned)"
        rows={doubleRows}
        data={numberData}
      />
    </div>
  );
}
