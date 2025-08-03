"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LuckyNumbersPage() {
  const [tips, setTips] = useState([]);
  const totalInputs = 32;

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
    <p className=" py-1    w-[100px] text-4xl font-extrabold text-center    bg-gradient-to-tr from-red-900 via-black to-red-900    border-4 border-yellow-400 rounded-3xl    shadow-[0_0_20px_4px_rgba(255,215,0,0.8)]    font-mono tracking-widest text-yellow-400    uppercase    select-none    transform transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_40px_8px_rgba(255,215,0,1)]    animate-pulse  ">
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

        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/mohadeb.jpeg"
            alt="mohadeb"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ মহাদেব
          </p>

          <div className="absolute md:top-32 md:right-60 top-20 right-20 flex gap-3">
            {renderTip(14)}
          </div>
          <div className="absolute md:top-44 md:left-60 top-20 left-20 flex gap-3">
            {renderTip(15)}
          </div>
          <div className="absolute md:bottom-72 md:left-80 bottom-32 left-40 flex gap-3">
            {renderTip(16)}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/krishna.jpeg"
            alt="krishna"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ কাট নাম্বার
          </p>

          <div className="absolute md:top-96 md:right-52 top-40 left-20 flex gap-3">
            {renderTip(17)}
          </div>
          <div className="absolute md:top-80 md:left-52 top-20 left-12 flex gap-3">
            {renderTip(18)}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/durga.jpeg"
            alt="durga"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ জোকার
          </p>

          <div className="absolute md:top-52 md:right-52 top-20 right-20 flex gap-3">
            {renderTip(19)}
          </div>
          <div className="absolute md:top-52 md:left-52 top-20 left-20 flex gap-3">
            {renderTip(20)}
          </div>
          <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
            {renderTip(21)}
          </div>
          <div className="absolute md:bottom-44 md:left-80 bottom-16 left-36 flex gap-3">
            {renderTip(22)}
          </div>
          <div className="absolute md:bottom-44 md:right-40 bottom-16 right-10 flex gap-3">
            {renderTip(23)}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/honuman.jpeg"
            alt="honuman"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ভি আই পি
          </p>

          <div className="absolute md:top-52 md:left-32 top-10 right-0 flex gap-3">
            {renderTip(24)}
          </div>
          <div className="absolute md:top-72 md:left-72 top-12 left-12 flex gap-3">
            {renderTip(25)}
          </div>
          <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
            {renderTip(26)}
          </div>
          <div className="absolute md:bottom-44 md:left-80 bottom-16 left-36 flex gap-3">
            {renderTip(27)}
          </div>
          <div className="absolute md:bottom-44 md:right-40 bottom-16 right-10 flex gap-3">
            {renderTip(28)}
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src="/eagle.jpeg"
            alt="eagle"
            width={800}
            height={800}
            className="w-full h-auto object-cover"
          />
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
            ⭐ টাচ
          </p>

          <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
            {renderTip(29)}
          </div>
          <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
            {renderTip(30)}
          </div>
          <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
            {renderTip(31)}
          </div>
        </div>

        {/* Image 6 */}
      </div>
    </main>
  );
}
