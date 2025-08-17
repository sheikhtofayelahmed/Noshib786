"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LuckyNumbersPage() {
  const [tips, setTips] = useState([]);
  const totalInputs = 65;

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
  const renderTip = (index, wide = false) => (
    <p
      className={`py-2 px-3 text-4xl font-extrabold text-center
      bg-gradient-to-tr from-red-900 via-black to-red-900
      border-4 border-yellow-400 rounded-3xl
      shadow-[0_0_20px_4px_rgba(255,215,0,0.8)]
      font-mono tracking-widest text-yellow-400 uppercase
      select-none transform transition-transform duration-300
      hover:scale-110 hover:shadow-[0_0_40px_8px_rgba(255,215,0,1)]
      animate-pulse
      ${wide ? "w-[300px]" : "w-auto"}
    `}
    >
      {tips[index] || "--"}
    </p>
  );

  const data = [
    { src: "/queen.jpeg", title: "👑 রাণীর আশীর্বাদ", inputs: [0, 1, 2, 51] },
    {
      src: "/family.jpeg",
      title: "🏡 পারিবারিক সৌভাগ্য",
      inputs: [3, 4, 5, 52],
    },
    {
      src: "/frog.jpeg",
      title: "🐸 ব্যাঙের লাফ!",
      inputs: [6, 7, 8, 53],
    },
    { src: "/magician.jpeg", title: "🧙 জাদুকরের ইশারা", inputs: [9, 10, 54] },
    { src: "/star.jpeg", title: "⭐ নক্ষত্রের নসীব", inputs: [11, 12, 13, 55] },
    { src: "/horse.jpg", title: "⭐বেহেস্তি ঘোড়া", inputs: [14, 15, 16, 56] },
    { src: "/lion.jpg", title: "⭐ কাট নাম্বার", inputs: [17, 18, 57] },
    {
      src: "/richGuy.jpg",
      title: "⭐ জোকার",
      inputs: [19, 20, 21, 22, 23, 58],
    },
    {
      src: "/thaiGirl.jpg",
      title: "⭐ভি আই পি",
      inputs: [24, 25, 26, 27, 28, 59],
    },
    { src: "/tiger.jpg", title: "⭐ নসীব ", inputs: [29, 30, 31, 60] },
    { src: "/eagle.jpeg", title: "⭐ টাচ", inputs: [32, 33, 34, 61] },
    {
      src: "/fox.jpg",
      title: "🦊 ধূর্ত ভাগ্য",
      inputs: [35, 36, 37, 38, 39, 62],
    },
    { src: "/poorGuy.jpg", title: "💸 দরিদ্রের আশা", inputs: [40, 41, 42, 63] },
    {
      src: "/dragon.jpg",
      title: "🐉 ড্রাগনের শক্তি",
      inputs: [43, 44, 45, 46, 64],
    },
    { src: "/snake.jpg", title: "🐍 সাপের ছোবল", inputs: [48, 49, 50, 65] },
  ];

  return (
    <main className="max-w-[850px]  mx-auto min-h-screen bg-gradient-to-b from-black via-[#0d0d0d] to-black text-yellow-300 px-4 py-10 font-bangla">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-10 text-yellow-300 tracking-widest animate-pulse">
        সাপ্তাহিক নসীব ✨
      </h1>

      <div className="flex flex-col items-center gap-10 max-w-3xl mx-auto px-2"></div>
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[0].src}
          alt="queen"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          1
        </p>
        <p className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-pink-300 font-bold drop-shadow-lg">
          {data[0].title}
        </p>
        <div className="absolute md:top-24 md:left-48 left-10 top-12 flex gap-3">
          {renderTip(data[0].inputs[0])}
        </div>
        <div className="absolute md:top-48 md:right-24 top-20 right-7 flex gap-3">
          {renderTip(data[0].inputs[1])}
        </div>
        <div className="absolute md:bottom-72 md:left-44 bottom-32 left-16 flex gap-3">
          {renderTip(data[0].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[0].inputs[3], true)}
        </div>
      </div>

      {/* Image 2: Family */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[1].src}
          alt="family"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          2
        </p>
        <p className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-base text-green-300 font-semibold drop-shadow-lg">
          {data[1].title}
        </p>
        <div className="absolute md:top-48 md:right-24 top-20 right-5 flex gap-3">
          {renderTip(data[1].inputs[0])}
        </div>
        <div className="absolute md:bottom-64 md:left-44 left-20 bottom-32 flex gap-3">
          {renderTip(data[1].inputs[1])}
        </div>
        <div className="absolute md:bottom-52 md:right-48 bottom-28 right-12 flex gap-3">
          {renderTip(data[1].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[1].inputs[3], true)}
        </div>
      </div>

      {/* Image 3: Frog */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[2].src}
          alt="frog"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          3
        </p>
        <p className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-pink-300 font-bold drop-shadow-lg">
          {data[2].title}
        </p>
        <div className="absolute md:top-80 md:right-24 top-40 right-1 flex gap-3">
          {renderTip(data[2].inputs[0])}
        </div>
        <div className="absolute md:bottom-96 md:left-32 bottom-44 left-10 flex gap-3">
          {renderTip(data[2].inputs[1])}
        </div>
        <div className="absolute md:bottom-52 md:left-80 bottom-20 left-28 flex gap-3">
          {renderTip(data[2].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[2].inputs[3], true)}
        </div>
      </div>

      {/* Image 4: Magician */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[3].src}
          alt="magician"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          4
        </p>
        <p className="absolute top-4 left-4 text-purple-300 text-lg font-bold bg-black bg-opacity-70 px-3 py-1 rounded drop-shadow-lg">
          {data[3].title}
        </p>
        <div className="absolute md:top-56 md:left-44 top-20 left-12 flex gap-3">
          {renderTip(data[3].inputs[0])}
        </div>
        <div className="absolute md:bottom-56 md:right-24 bottom-24 right-1 flex gap-3">
          {renderTip(data[3].inputs[1])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[3].inputs[2], true)}
        </div>
      </div>

      {/* Image 5: Star */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[4].src}
          alt="star"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          5
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[4].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-20 flex gap-3">
          {renderTip(data[4].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-20 flex gap-3">
          {renderTip(data[4].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-32 flex gap-3">
          {renderTip(data[4].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[4].inputs[3], true)}
        </div>
      </div>

      {/* Image 6: Horse */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[5].src}
          alt="horse"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          6
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[5].title}
        </p>
        <div className="absolute md:top-32 md:right-60 top-20 right-20 flex gap-3">
          {renderTip(data[5].inputs[0])}
        </div>
        <div className="absolute md:top-44 md:left-60 top-20 left-20 flex gap-3">
          {renderTip(data[5].inputs[1])}
        </div>
        <div className="absolute md:bottom-72 md:left-80 bottom-32 left-40 flex gap-3">
          {renderTip(data[5].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[5].inputs[3], true)}
        </div>
      </div>

      {/* Image 7: Lion */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[6].src}
          alt="lion"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          7
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[6].title}
        </p>
        <div className="absolute md:top-96 md:right-52 top-40 left-20 flex gap-3">
          {renderTip(data[6].inputs[0])}
        </div>
        <div className="absolute md:top-80 md:left-52 top-20 left-12 flex gap-3">
          {renderTip(data[6].inputs[1])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[6].inputs[2], true)}
        </div>
      </div>

      {/* Image 8: Rich Guy (Joker) */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[7].src}
          alt="richGuy"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          8
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[7].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-20 flex gap-3">
          {renderTip(data[7].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-20 flex gap-3">
          {renderTip(data[7].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
          {renderTip(data[7].inputs[2])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-36 flex gap-3">
          {renderTip(data[7].inputs[3])}
        </div>
        <div className="absolute md:bottom-44 md:right-40 bottom-16 right-10 flex gap-3">
          {renderTip(data[7].inputs[4])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[7].inputs[5], true)}
        </div>
      </div>

      {/* Image 9: Thai Girl (VIP) */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[8].src}
          alt="thaiGirl"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          9
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[8].title}
        </p>
        <div className="absolute md:top-52 md:left-32 top-10 right-0 flex gap-3">
          {renderTip(data[8].inputs[0])}
        </div>
        <div className="absolute md:top-72 md:left-72 top-12 left-12 flex gap-3">
          {renderTip(data[8].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
          {renderTip(data[8].inputs[2])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-36 flex gap-3">
          {renderTip(data[8].inputs[3])}
        </div>
        <div className="absolute md:bottom-44 md:right-40 bottom-16 right-10 flex gap-3">
          {renderTip(data[8].inputs[4])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[8].inputs[5], true)}
        </div>
      </div>

      {/* Image 10: Tiger (Naseeb) */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[9].src}
          alt="tiger"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          10
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[9].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[9].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[9].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[9].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[9].inputs[3], true)}
        </div>
      </div>

      {/* Image 11: Eagle (Touch) */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[10].src}
          alt="eagle"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          11
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[10].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[10].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[10].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[10].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[10].inputs[3], true)}
        </div>
      </div>

      {/* Image 12: Fox */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[11].src}
          alt="fox"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          12
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[11].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[11].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[11].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[11].inputs[2])}
        </div>
        <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
          {renderTip(data[11].inputs[3])}
        </div>
        <div className="absolute md:bottom-44 md:right-40 bottom-16 right-10 flex gap-3">
          {renderTip(data[11].inputs[4])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[11].inputs[5], true)}
        </div>
      </div>

      {/* Image 13: Poor Guy */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[12].src}
          alt="poorGuy"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          13
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[12].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[12].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[12].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[12].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[12].inputs[3], true)}
        </div>
      </div>

      {/* Image 14: Dragon */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[13].src}
          alt="dragon"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          14
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[13].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[13].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[13].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[13].inputs[2])}
        </div>
        <div className="absolute md:bottom-44 md:left-40 bottom-16 left-10 flex gap-3">
          {renderTip(data[13].inputs[3])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[13].inputs[4], true)}
        </div>
      </div>

      {/* Image 15: Snake */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg my-10">
        <Image
          src={data[14].src}
          alt="snake"
          width={800}
          height={800}
          className="w-full h-auto object-cover"
        />
        <p className="absolute top-1 right-1 bg-black bg-opacity-70 px-3 py-1 rounded text-lg text-green-300 font-bold drop-shadow-lg">
          15
        </p>
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-yellow-100 bg-black bg-opacity-70 px-4 py-1 rounded text-base drop-shadow-lg">
          {data[14].title}
        </p>
        <div className="absolute md:top-52 md:right-52 top-20 right-12 flex gap-3">
          {renderTip(data[14].inputs[0])}
        </div>
        <div className="absolute md:top-52 md:left-52 top-20 left-16 flex gap-3">
          {renderTip(data[14].inputs[1])}
        </div>
        <div className="absolute md:bottom-44 md:left-80 bottom-16 left-40 flex gap-3">
          {renderTip(data[14].inputs[2])}
        </div>
        <div className="absolute bottom-0 left-0 flex gap-3">
          {renderTip(data[14].inputs[3], true)}
        </div>
      </div>
    </main>
  );
}
