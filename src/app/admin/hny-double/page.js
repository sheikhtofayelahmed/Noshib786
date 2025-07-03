"use client";

import Loading from "@/components/Loading";
import NumberTable from "@/components/NumberTable";
import { useEffect, useState } from "react";

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
      console.log(data, "fetch dataa");
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
  const doubleRows = [
    ["100", "110", "166", "112", "113", "114", "115", "116", "117", "118"],
    ["010", "101", "616", "121", "131", "141", "151", "161", "171", "181"],
    ["001", "011", "661", "211", "311", "411", "511", "611", "711", "811"],
    ["119", "200", "229", "220", "122", "277", "133", "224", "144", "226"],
    ["191", "020", "292", "202", "212", "727", "313", "242", "414", "262"],
    ["911", "002", "922", "022", "221", "772", "331", "422", "441", "622"],
    ["155", "228", "300", "266", "177", "330", "188", "233", "199", "244"],
    ["515", "282", "030", "626", "717", "303", "818", "323", "919", "424"],
    ["551", "822", "003", "662", "771", "033", "881", "332", "991", "442"],
    ["227", "255", "337", "338", "339", "448", "223", "288", "225", "299"],
    ["272", "525", "373", "383", "393", "484", "232", "828", "252", "929"],
    ["722", "552", "733", "833", "933", "844", "322", "882", "522", "992"],
    ["335", "336", "355", "400", "366", "466", "377", "440", "388", "334"],
    ["353", "363", "535", "040", "636", "646", "737", "404", "838", "343"],
    ["533", "633", "553", "004", "663", "664", "773", "044", "883", "433"],
    ["344", "499", "445", "446", "447", "556", "449", "477", "559", "488"],
    ["434", "949", "454", "464", "474", "565", "494", "747", "595", "848"],
    ["443", "994", "544", "644", "744", "655", "944", "774", "955", "884"],
    ["399", "660", "599", "455", "500", "600", "557", "558", "577", "550"],
    ["939", "606", "959", "545", "050", "060", "575", "585", "757", "505"],
    ["993", "066", "995", "554", "005", "006", "755", "855", "775", "055"],
    ["588", "688", "779", "699", "799", "880", "566", "800", "667", "668"],
    ["858", "868", "797", "969", "979", "808", "656", "080", "676", "686"],
    ["885", "886", "977", "996", "997", "088", "665", "008", "766", "866"],
    ["669", "778", "788", "770", "889", "899", "700", "990", "900", "677"],
    ["696", "787", "878", "707", "898", "989", "070", "909", "090", "767"],
    ["966", "877", "887", "077", "988", "998", "007", "099", "009", "776"],
    ["777", "444", "111", "888", "555", "222", "999", "666", "333", "000"],
  ];

  const columns = [...Array(9).keys()].map((i) => i + 1).concat(0);
  const columnDataBySum = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  const patternData = {
    // xxx: [],
    // xxy: [],
    // xyy: [],
    xyx: [],
  };

  numberData.forEach((item) => {
    const numStr = item._id;
    const str = item.totalStr;
    const rumble = item.totalRumble;

    // Group by last digit of digit sum
    if (str > 100 || rumble > 100) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;
      columnDataBySum[columnKey].push({ number: numStr, str, rumble });
    }

    // Group by 3-digit patterns
    if (numStr.length === 3 && (str > 100 || rumble > 100)) {
      const [a, b, c] = numStr;
      let type = null;
      // if (a === b && b === c) {
      //   type = "xxx"; // All digits are the same (e.g., 111, 222)
      // } else if (a === b && b !== c) {
      //   type = "xxy"; // First two are the same, third is different (e.g., 112, 330)
      // } else if (a !== b && b === c) {
      //   type = "xyy"; // Last two are the same, first is different (e.g., 122, 455)
      // } else if (a === c && a !== b) {
      //   // This covers "xyx" where middle is different
      //   type = "xyx"; // First and third are the same, middle is different (e.g., 121, 050)
      // }
      if (!(a !== b && b !== c && a !== c)) {
        type = "xyx"; // All digits are the same (e.g., 111, 222)
      }

      if (type) {
        patternData[type].push({ number: numStr, str, rumble });
      }
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
      <div className="mb-16 bg-gray-950 rounded-xl shadow-2xl border-2 border-yellow-600 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          🎯 Hot Numbers
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

                Object.keys(patternData).forEach((patternType) => {
                  patternData[patternType].forEach(
                    ({ number, str, rumble }) => {
                      const digitSumMod =
                        number
                          .split("") // assuming number is a string like "123"
                          .reduce((acc, d) => acc + Number(d), 0) % 10;

                      if (digitSumMod === modIndex) {
                        matchingNumbers.push(
                          <div
                            key={`${patternType}-${number}`}
                            className="text-white text-3xl font-extrabold uppercase bg-gradient-to-br from-indigo-600 to-sky-500 p-2 rounded-lg mb-2 shadow-md transform transition-all duration-300"
                          >
                            <span>{number}</span>
                            <div className="flex justify-center space-x-2 mt-2">
                              <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md text-center min-w-[1.5rem]">
                                {str}
                              </div>
                              <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md text-center min-w-[1.5rem]">
                                {rumble}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                  );
                });

                return (
                  <td
                    key={modIndex}
                    className="bg-gray-900 p-4 rounded-lg border border-gray-700 align-top"
                  >
                    {matchingNumbers.length > 0 && (
                      <div className="flex flex-col items-center">
                        {matchingNumbers}
                      </div>
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
        line={3}
      />
    </div>
  );
}
