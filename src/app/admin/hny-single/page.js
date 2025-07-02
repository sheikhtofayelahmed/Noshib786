"use client";

import Loading from "@/components/Loading";
import NumberTableSingle from "@/components/NumberTableSingle";
import { useEffect, useState } from "react";
export default function HappyNewYear() {
  const [numberData, setNumberData] = useState([]);

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

  const singleRows = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]];

  const [loading, setLoading] = useState(false);
  if (loading) {
    return <Loading></Loading>;
  }
  return (
    <div className="w-full p-8 bg-gradient-to-b from-black to-red-950 min-h-screen font-sans text-gray-100 select-none overflow-x-hidden">
      <h1 className="text-center text-6xl font-extrabold mb-16 uppercase tracking-widest text-red-500 drop-shadow-lg animate-pulse-light">
        🎰 Thai Lottery Agent 🎲
      </h1>

      <NumberTableSingle
        title="Single"
        rows={singleRows}
        data={numberData}
        single={true}
      />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
