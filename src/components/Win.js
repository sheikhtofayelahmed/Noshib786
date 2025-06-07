"use client";

import { useEffect, useState } from "react";

export default function Win() {
  const [threeUp, setThreeUp] = useState("XXX");
  const [downGame, setDownGame] = useState("X");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setDate(data.date);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="my-4 mx-auto max-w-3xl bg-gray-900 bg-opacity-80 rounded-sm shadow-md ring-2 ring-yellow-500 p-4 text-center">
      <h2 className="text-xl font-bold text-yellow-400 mb-4 animate-pulse">
        🏆 Latest Winning Numbers
      </h2>

      <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
        {/* 3UP Game */}
        <div className="bg-gradient-to-br from-yellow-500 to-red-500 text-black rounded-lg px-6 py-4 shadow-lg w-64">
          <h3 className="text-xl font-bold mb-2">🎯 3UP Game</h3>
          <p className="text-4xl font-extrabold tracking-widest">{threeUp}</p>
        </div>

        {/* Date */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-yellow-400 text-xl animate-pulse">🗓️</span>
          <span className="font-semibold text-gray-200">Date:</span>
          <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text font-bold text-lg">
            {date}
          </span>
        </div>

        {/* DOWN Game */}
        <div className="bg-gradient-to-br from-pink-500 to-red-500 text-black rounded-lg px-6 py-4 shadow-lg w-64">
          <h3 className="text-xl font-bold mb-2">💥 DOWN Game</h3>
          <p className="text-4xl font-extrabold tracking-widest">{downGame}</p>
        </div>
      </div>
    </div>
  );
}
