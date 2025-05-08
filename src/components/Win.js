'use client';

import { useEffect, useState } from 'react';

export default function Win() {
  const [straightWin, setStraightWin] = useState('XXX');
  const [singleWin, setSingleWin] = useState('X');
  const [gameNumber, setGameNumber] = useState('---');
  const [date, setDate] = useState('---');
  const [day, setDay] = useState('---');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/win');
        const data = await res.json();
        setStraightWin(data.straightWin);
        setSingleWin(data.singleWin);
        setGameNumber(data.gameNumber);
        setDate(data.date);
        setDay(data.day);
      } catch (error) {
        console.error('Error fetching winning numbers:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="my-6 bg-gray-900 bg-opacity-80 rounded-lg shadow-lg ring-2 ring-yellow-500 p-6 text-center">
      <h2 className="text-3xl font-extrabold text-yellow-400 mb-4 animate-pulse">
        🏆 Latest Winning Numbers
      </h2>

      <div className="mb-8 text-sm sm:text-base text-gray-300 bg-gray-800 bg-opacity-70 rounded-lg p-4 border-2 border-yellow-500 shadow-lg">
  <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
    <div className="flex items-center gap-2">
      <span className="text-yellow-400 text-xl animate-pulse">🗓️</span>
      <span className="font-semibold text-gray-200">Date:</span>
      <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-transparent bg-clip-text font-bold text-lg">{date}</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-yellow-400 text-xl animate-pulse">📅</span>
      <span className="font-semibold text-gray-200">Day:</span>
      <span className="bg-gradient-to-r from-pink-400 to-yellow-500 text-transparent bg-clip-text font-bold text-lg">{day}</span>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-yellow-400 text-xl animate-pulse">🎮</span>
      <span className="font-semibold text-gray-200">Game No:</span>
      <span className="bg-gradient-to-r from-red-500 to-yellow-400 text-transparent bg-clip-text font-bold text-lg">{gameNumber}</span>
    </div>
  </div>
</div>


      <div className="flex flex-col sm:flex-row justify-around items-center space-y-6 sm:space-y-0">
        {/* Straight / Rumbo Win */}
        <div className="bg-gradient-to-br from-yellow-500 to-red-500 text-black rounded-lg px-6 py-4 shadow-lg w-64">
          <h3 className="text-xl font-bold mb-2">🎯 Straight/Rumbo</h3>
          <p className="text-4xl font-extrabold tracking-widest">{straightWin}</p>
        </div>

        {/* Single Win */}
        <div className="bg-gradient-to-br from-pink-500 to-red-500 text-black rounded-lg px-6 py-4 shadow-lg w-64">
          <h3 className="text-xl font-bold mb-2">💥 Single</h3>
          <p className="text-4xl font-extrabold tracking-widest">{singleWin}</p>
        </div>
      </div>
    </div>
  );
}
