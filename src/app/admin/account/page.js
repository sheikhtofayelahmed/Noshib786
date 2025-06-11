"use client";
import React, { useEffect, useState } from "react";

export default function Account() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const res = await fetch(`/api/get-summaries`);
        const data = await res.json();

        if (data.success) {
          const sortedSummaries = [...data.summaries].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          setSummaries(sortedSummaries);
          setMessage("");

          if (sortedSummaries.length > 0) {
            setSelectedDate(sortedSummaries[0].date); // 🟡 Set the most recent date
          }
        } else {
          console.error("Failed to fetch summaries:", data.message);
          setMessage("Failed to load summaries. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
        setMessage("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, []);

  const filteredByDate = selectedDate
    ? summaries.filter((item) => item.date === selectedDate)
    : [];

  const yearlyTotals = summaries.reduce((acc, item) => {
    const { agentId } = item;
    if (!agentId) return acc;

    const keys = [
      "afterThreeD",
      "afterTwoD",
      "afterOneD",
      "afterSTR",
      "afterRUMBLE",
      "afterDOWN",
      "afterSINGLE",
      "totalGame",
      "totalWin",
      "totalAmounts",
    ];

    if (!acc[agentId]) {
      acc[agentId] = {
        agentId,
        afterThreeD: 0,
        afterTwoD: 0,
        afterOneD: 0,
        afterSTR: 0,
        afterRUMBLE: 0,
        afterDOWN: 0,
        afterSINGLE: 0,
        totalGame: 0,
        totalWin: 0,
        totalAmounts: 0,
      };
    }

    for (const key of keys) {
      if (typeof item[key] === "number") {
        acc[agentId][key] += item[key];
      }
    }

    return acc;
  }, {});

  const yearlyData = Object.values(yearlyTotals).map((item) => ({
    ...item,
    WL: item.totalGame - item.totalWin,
  }));

  return (
    <div className="p-4 min-h-screen text-white font-mono">
      {/* Date Selector */}
      <div className="mb-6">
        <label className="block mb-2 text-lg font-bold text-yellow-400">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-500"
        />
      </div>

      {/* Table for Selected Date */}
      {selectedDate && filteredByDate.length > 0 ? (
        <div className="mb-12 overflow-x-auto border border-yellow-600 rounded-xl">
          <h2 className="text-xl font-bold text-yellow-300 py-3 text-center">
            Summary for {selectedDate}
          </h2>
          <table className="w-full text-sm bg-gray-900 border border-collapse text-green-200 text-center">
            <thead className="bg-gray-800 text-yellow-300">
              <tr>
                <th className="p-2">Agent ID</th>
                <th className="p-2">3D</th>
                <th className="p-2">2D</th>
                <th className="p-2">1D</th>
                <th className="p-2">STR</th>
                <th className="p-2">RUMBLE</th>
                <th className="p-2">DOWN</th>
                <th className="p-2">SINGLE</th>
                <th className="p-2">Total Game</th>
                <th className="p-2">Total Win</th>
                <th className="p-2">W/L</th>
              </tr>
            </thead>
            <tbody>
              {filteredByDate.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="p-2">{item.agentId}</td>
                  <td className="p-2">{item.afterThreeD}</td>
                  <td className="p-2">{item.afterTwoD}</td>
                  <td className="p-2">{item.afterOneD}</td>
                  <td className="p-2">{item.afterSTR}</td>
                  <td className="p-2">{item.afterRUMBLE}</td>
                  <td className="p-2">{item.afterDOWN}</td>
                  <td className="p-2">{item.afterSINGLE}</td>
                  <td className="p-2">{item.totalGame}</td>
                  <td className="p-2">{item.totalWin}</td>
                  <td className="p-2">{item.totalGame - item.totalWin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        selectedDate && (
          <p className="text-yellow-400 text-center font-bold py-5 text-2xl">
            No data found for {selectedDate}
          </p>
        )
      )}

      {/* Yearly Summary */}
      <div className="overflow-x-auto border border-pink-600 rounded-xl">
        <h2 className="text-xl font-bold text-pink-400  py-3 text-center">
          Yearly Total by Agent
        </h2>
        <table className="w-full text-sm bg-gray-900 border border-collapse text-green-200 text-center">
          <thead className="bg-gray-800 text-pink-300">
            <tr>
              <th className="p-2">Agent ID</th>
              <th className="p-2">3D</th>
              <th className="p-2">2D</th>
              <th className="p-2">1D</th>
              <th className="p-2">STR</th>
              <th className="p-2">RUMBLE</th>
              <th className="p-2">DOWN</th>
              <th className="p-2">SINGLE</th>
              <th className="p-2">Total Game</th>
              <th className="p-2">Total Win</th>
              <th className="p-2">W/L</th>
            </tr>
          </thead>
          <tbody>
            {yearlyData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-700">
                <td className="p-2">{item.agentId}</td>
                <td className="p-2">{item.afterThreeD}</td>
                <td className="p-2">{item.afterTwoD}</td>
                <td className="p-2">{item.afterOneD}</td>
                <td className="p-2">{item.afterSTR}</td>
                <td className="p-2">{item.afterRUMBLE}</td>
                <td className="p-2">{item.afterDOWN}</td>
                <td className="p-2">{item.afterSINGLE}</td>
                <td className="p-2">{item.totalGame}</td>
                <td className="p-2">{item.totalWin}</td>
                <td
                  className={`p-2 ${
                    item.WL < 0 ? "text-red-500 font-bold" : ""
                  }`}
                >
                  {item.WL}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
