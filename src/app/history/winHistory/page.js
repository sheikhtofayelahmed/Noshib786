"use client";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

const WinHistoryTable = () => {
  const [winningData, setWinningData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllWins = async () => {
    try {
      const res = await fetch("/api/win-history");
      const result = await res.json();
      if (res.ok) {
        // Show most recent first by sorting descending by createdAt
        const sorted = result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

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

  return (
    <div className=" w-full mb-">
      <div className="glow mt-10 p-4 max-w-4xl mx-auto  bg-gradient-to-br from-black via-gray-900 to-black">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-violet-500 bg-clip-text mb-6 tracking-wider drop-shadow-md">
          🎰 Noshib Win History ✨
        </h2>

        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : (
          <div className="rounded-2xl bg-black/20 backdrop-blur-md shadow-[0_0_30px_rgba(255,0,255,0.2)] ring-2 ring-purple-700/30">
            <table className="min-w-full text-sm text-center text-white border-separate border-spacing-y-2">
              <thead className="bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-700 text-xs uppercase tracking-widest shadow-md rounded-t-xl">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">🎯 Draw Date</th>
                  <th className="py-3 px-4">🔮 3UP</th>
                  <th className="py-3 px-4">🧿 DOWN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-600/40">
                {winningData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:scale-[1.01] transition-transform hover:bg-purple-800/20 duration-200"
                  >
                    <td className="py-2 px-4 text-fuchsia-300 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 text-cyan-300 font-semibold">
                      {item.gameDate}
                    </td>
                    <td className="py-2 px-4 font-extrabold text-green-300 text-lg drop-shadow-md">
                      {item.threeUp || "—"}
                    </td>
                    <td className="py-2 px-4 font-extrabold text-yellow-300 text-lg drop-shadow-md">
                      {item.downGame || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WinHistoryTable;
