"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function LuckyNumbersPage() {
  const [threeUp, setThreeUp] = useState(null);
  const [downGame, setDownGame] = useState(null);
  const [date, setDate] = useState(null);
  const [winStatus, setWinStatus] = useState(false);
  const [tips, setTips] = useState([]);
  const totalInputs = 65; // Change to actual number of input fields
  const [winningData, setWinningData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllWins = async () => {
    try {
      const res = await fetch("/api/win-history");
      const result = await res.json();
      if (res.ok) {
        // Sort descending by date and take only the latest 12
        const sorted = result.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10); // 👈 Limit to 12 entries

        setWinningData(sorted);
      } else {
        alert(result.error || "Failed to fetch winning records.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong while loading winning history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWins();
  }, []);
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
  // Fetch tips on mount
  useEffect(() => {
    async function fetchTips() {
      try {
        const res = await fetch("/api/tips");
        if (!res.ok) throw new Error("Failed to fetch tips");
        const data = await res.json();
        if (Array.isArray(data) && data.length === totalInputs) {
          setTips(data);
        } else {
          // Initialize with empty strings if nothing saved or length mismatch
          setTips(Array(totalInputs).fill(""));
        }
      } catch (e) {
        setTips(Array(totalInputs).fill(""));
      }
    }
    fetchTips();
  }, []);

  // Save tips to DB on blur or change with debounce (simple approach: on blur)
  async function saveTips(newTips) {
    try {
      await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tips: newTips }),
      });
    } catch (e) {
      console.error("Failed to save tips", e);
    }
  }

  // Update single input value
  function handleChange(index, val) {
    const updatedTips = [...tips];
    updatedTips[index] = val;
    setTips(updatedTips);
  }

  function handleBlur() {
    saveTips(tips);
  }

  // Helper to render input styled like your <p> "11" element
  function renderInput(index) {
    return (
      <input
        key={index}
        type="text"
        value={tips[index] || ""}
        onChange={(e) => handleChange(index, e.target.value)}
        onBlur={handleBlur}
        className={`${
          index >= 51 && index <= 65 ? "w-full" : "w-9"
        } text-center border border-gray-400 rounded px-1 py-0.5 text-sm`}
      />
    );
  }

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
    { src: "/horse.jpg", title: "⭐বেহেস্তি ঘোড়া", inputs: [14, 15, 16, 56] },
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
  // const ContentRef = useRef(null);
  // const handleDownloadPdf = async () => {
  //   const html2pdf = (await import("html2pdf.js")).default;
  //   const element = ContentRef.current;
  //   if (element) {
  //     const options = {
  //       margin: 10,
  //       filename: `tips.pdf`,
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: {
  //         scale: 2,
  //         // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
  //         background: "#ffffff", // Explicitly set white background for the canvas
  //       },
  //       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  //     };
  //     html2pdf().set(options).from(element).save();
  //   } else {
  //     console.error("Content div not found!");
  //   }
  // };
  const hexPositions = [
    { top: 75, left: 30 },
    { top: 75, left: 130 },
    { top: 35, left: 50 },
    { top: 120, left: 30 },
    { top: 120, left: 130 },
    // Add more positions as needed
  ];
  return (
    <main
      // ref={ContentRef}
      className="min-h-screen bg-white text-black px-4 py-4 font-bangla"
    >
      {/* <button
        onClick={handleDownloadPdf}
        className="p-1 mx-4 rounded-xl bg-gray-200 transition duration-300"
        title="Download Player Info"
      >
        <img src="/download.svg" alt="Download" className="w-8 h-8" />
      </button> */}
      <h1 className="text-xl font-extrabold text-center mb-1 tracking-widest">
        সাপ্তাহিক নসীব
      </h1>
      {/* Top Cards Section */}
      <div className="flex flex-col sm:flex-row justify-around items-center gap-4 text-center mb-10 max-w-[22cm] mx-auto px-4">
        <div className="bg-white border border-gray-300 rounded-2xl px-3 py-2 shadow w-40">
          <div className="flex items-center justify-center gap-1 mb-1 text-sm font-semibold">
            🎯
            <span className="font-extrabold text-base text-black">
              নসীব 3UP
            </span>
          </div>
          <p className="text-base font-black tracking-wide text-black">
            {typeof winStatus === "boolean" && winStatus
              ? threeUp || "XXX"
              : "XXX"}
          </p>
        </div>

        <div className="flex flex-col items-center gap-0">
          🗓️
          <span className="font-extrabold text-base text-black leading-none">
            নসীব তারিখ
          </span>
          <span className="text-base font-bold tracking-wide leading-none">
            {typeof winStatus === "boolean" && winStatus
              ? date || "---"
              : "---"}
          </span>
        </div>

        <div className="bg-white border border-gray-300 rounded-2xl px-3 py-2 shadow w-40">
          <div className="flex items-center justify-center gap-1 mb-1 text-sm font-semibold">
            💥
            <span className="font-extrabold text-base text-black">
              নসীব DOWN
            </span>
          </div>
          <p className="text-base font-black tracking-wide text-black">
            {typeof winStatus === "boolean" && winStatus
              ? downGame || "XX"
              : "XX"}
          </p>
        </div>
      </div>
      {/* Grid of Images */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 max-w-[21cm] mx-auto px-4  print:bg-white print:text-black ">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="border relative border-gray-300 rounded-xl shadow overflow-hidden bg-white  mb-5"
          >
            <div className=" w-full">
              <Image
                src={item.src}
                alt={item.title}
                width={800}
                height={800}
                className="w-full h-auto object-cover filter grayscale"
              />
              <p className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded font-semibold shadow">
                {item.title}
              </p>
            </div>

            {item.inputs.map((input, index) => {
              const isLast = index === item.inputs.length - 1;
              const positionStyle = isLast
                ? { bottom: 0, left: 0, position: "absolute" }
                : {
                    top: `${hexPositions[index]?.top || 0}px`,
                    left: `${hexPositions[index]?.left || 0}px`,
                    position: "absolute",
                  };

              return (
                <div key={index} style={positionStyle}>
                  {renderInput(input)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="glow mt-10 p-4 max-w-[21cm] mx-auto px-4 py-1  bg-white">
        <h2 className="text-3xl font-extrabold text-center  bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-violet-500 bg-clip-text mb-6 tracking-wider drop-shadow-md">
          🎰 Noshib Win History ✨
        </h2>

        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : (
          <div className="rounded-xl bg-white shadow ring-1 ring-gray-300">
            <table className="min-w-full text-sm text-center text-gray-800 border-separate border-spacing-y-2">
              <thead className="text-base bg-gray-100 uppercase tracking-wider rounded-t-xl">
                <tr className="bg-gray-100 transition-colors duration-200">
                  <th className="py-1 px-4">#</th>
                  <th className="py-1 px-4">🎯 Draw Date</th>
                  <th className="py-1 px-4">🔮 3UP</th>
                  <th className="py-1 px-4">🧿 DOWN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 text-xl">
                {winningData.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-gray-100 transition-colors duration-200"
                  >
                    <td className="py-0 px-4 font-semibold text-gray-700">
                      {index + 1}
                    </td>
                    <td className="py-0 px-4 font-medium text-gray-600">
                      {item.gameDate}
                    </td>
                    <td className="py-0 px-4 font-bold text-gray-900">
                      {item.threeUp || "—"}
                    </td>
                    <td className="py-0 px-4 font-bold text-gray-900">
                      {item.downGame || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
