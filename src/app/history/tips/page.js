"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LuckyNumbersPage() {
  const [tips, setTips] = useState([]);
  const totalInputs = 16;

  useEffect(() => {
    async function fetchTips() {
      try {
        const res = await fetch("/api/tips");
        if (!res.ok) throw new Error("Failed to fetch tips");
        const data = await res.json();
        if (Array.isArray(data) && data.length === totalInputs) {
          setTips(data);
        } else {
          setTips(Array(totalInputs).fill("--"));
        }
      } catch (e) {
        setTips(Array(totalInputs).fill("--"));
      }
    }
    fetchTips();
  }, []);

  const renderTip = (index) => (
    <p className="text-3xl text-cyan-300 font-extrabold px-4  py-2 rounded-xl bg-black bg-opacity-50 shadow-[0_0_15px_rgba(0,255,255,0.8)] tracking-widest animate-pulse w-[80px] text-center">
      {tips[index] || "--"}
    </p>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-black text-yellow-300 px-4 py-10 font-bangla">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 text-yellow-300 tracking-widest animate-pulse">
        সাপ্তাহিক নসীব ✨
      </h1>

      <div className="flex flex-col items-center gap-10 max-w-3xl mx-auto px-2">
        {/* Image 1 */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/queen.jpeg"
            alt="queen"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-pink-300 font-bold drop-shadow-lg">
            👑 রাণীর আশীর্বাদ
          </p>

          <div className="absolute md:top-24 md:left-48 left-10 top-12  flex gap-3">
            {renderTip(0)}
          </div>
          <div className="absolute md:top-48 md:right-24  top-20 right-7  flex gap-3">
            {renderTip(1)}
          </div>
          <div className="absolute md:bottom-72 md:left-44 bottom-32 left-16 flex gap-3">
            {renderTip(2)}
          </div>
        </div>

        {/* Image 2 */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/family.jpeg"
            alt="family"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded text-base text-green-300 font-semibold drop-shadow-lg">
            🏡 পারিবারিক সৌভাগ্য
          </p>

          <div className="absolute md:top-48 md:right-24 top-20 right-5 flex gap-3">
            {renderTip(3)}
          </div>
          <div className="absolute md:bottom-64 md:left-44 left-20 bottom-32 flex gap-3">
            {renderTip(4)}
          </div>
          <div className="absolute md:bottom-52 md:right-48 bottom-28 right-12 flex gap-3">
            {renderTip(5)}
          </div>
        </div>

        {/* Image 3 */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/frog.jpeg"
            alt="frog"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 px-4 py-1 rounded text-sm text-lime-300 font-medium drop-shadow-lg">
            🐸 ব্যাঙের লাফ = ভাগ্যর উল্লম্ফন!
          </p>

          <div className="absolute md:top-80 md:right-24 top-40 right-1 flex gap-3">
            {renderTip(6)}
          </div>
          <div className="absolute md:bottom-96 md:left-32 bottom-44 left-10 flex gap-3">
            {renderTip(7)}
          </div>
          <div className="absolute md:bottom-52 md:left-80 bottom-20 left-28 flex gap-3">
            {renderTip(8)}
          </div>
        </div>

        {/* Image 4 */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/magician.jpeg"
            alt="magician"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-4 text-purple-300 text-lg font-bold bg-black bg-opacity-70 px-3 py-1 rounded drop-shadow-lg">
            🧙 জাদুকরের ইশারা
          </p>

          <div className="absolute md:top-56 md:left-44 top-20 left-12 flex gap-3">
            {renderTip(9)}
          </div>
          <div className="absolute md:bottom-56 md:right-24 bottom-24 right-1 flex gap-3">
            {renderTip(10)}
          </div>
        </div>

        {/* Image 5 */}
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/star.jpeg"
            alt="star"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ নক্ষত্রের নসীব
          </p>

          <div className="absolute md:top-52 md:right-52 top-20 right-20 flex gap-3">
            {renderTip(11)}
          </div>
          <div className="absolute md:top-52 md:left-52 top-20 left-20 flex gap-3">
            {renderTip(12)}
          </div>
          <div className="absolute md:bottom-44 md:left-80 bottom-16 left-32 flex gap-3">
            {renderTip(13)}
          </div>
        </div>

        {/* Image 6 */}
      </div>
    </main>
  );
}
