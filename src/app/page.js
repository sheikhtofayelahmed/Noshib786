"use client";

import AgentLayout from "@/components/AgentLayout";
import { useEffect, useState } from "react";

export default function Noshib786() {
  const [threeUp, setThreeUp] = useState(null);
  const [downGame, setDownGame] = useState(null);
  const [date, setDate] = useState(null);
  const [winStatus, setWinStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setDate(data.gameDate);
        setWinStatus(data.winStatus);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <AgentLayout>
      <div className="my-8 mx-auto max-w-4xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl shadow-lg ring-1 ring-cyan-700 p-6 text-center text-white">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 tracking-wider">
          🏆 Latest Winning Numbers
        </h2>

        <div className="flex flex-col sm:flex-row justify-around items-center gap-8">
          {/* 3UP Game */}
          <div className="bg-gradient-to-br from-cyan-300 to-teal-400 text-gray-900 rounded-xl px-6 py-5 shadow-md w-64 hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold mb-1">🎯 3UP Game</h3>
            <p className="text-4xl font-black tracking-wide">
              {typeof winStatus === "boolean"
                ? winStatus
                  ? threeUp || "XXX"
                  : "XXX"
                : "XXX"}
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-cyan-400 text-2xl">🗓️</span>
            <span className="text-sm text-gray-300">Draw Date</span>
            <span className="text-base font-bold bg-gradient-to-r from-blue-300 to-cyan-400 text-transparent bg-clip-text">
              {typeof winStatus === "boolean"
                ? winStatus
                  ? date || "---"
                  : "---"
                : "---"}
            </span>
          </div>

          {/* DOWN Game */}
          <div className="bg-gradient-to-br from-purple-300 to-blue-400 text-gray-900 rounded-xl px-6 py-5 shadow-md w-64 hover:shadow-xl transition duration-300">
            <h3 className="text-lg font-semibold mb-1">💥 DOWN Game</h3>
            <p className="text-4xl font-black tracking-wide">
              {typeof winStatus === "boolean"
                ? winStatus
                  ? downGame || "XX"
                  : "XX"
                : "XX"}
            </p>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
}
