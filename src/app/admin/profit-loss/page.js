"use client";
import React, { useEffect, useState } from "react";

export default function ProfitLossTable() {
  const [data, setData] = useState({ threeD: [], twoD: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For toggling views
  const [view, setView] = useState("twoD"); // 'twoD' or 'threeD'

  // Pagination state for 3D only
  const [page, setPage] = useState(1);
  const rowsPerPage = 100;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/profitLoss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sort descending profitLoss
  const sortByProfitLoss = (arr) =>
    [...arr].sort((a, b) => b.profitLoss - a.profitLoss);

  // Pagination logic for 3D only
  const totalPages = Math.ceil(data.threeD.length / rowsPerPage);
  const pagedThreeD = sortByProfitLoss(data.threeD).slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin-slow text-6xl text-yellow-300">🎲</div>
      </div>
    );
  if (error)
    return (
      <p className="text-center text-red-500 mt-10 text-xl">
        ❌ Error: {error}
      </p>
    );

  const Table = ({ numbers, paginated, page, setPage, totalPages }) => (
    <section className="mb-12">
      <div className="overflow-auto rounded-xl border-2 border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.6)] max-h-[600px]">
        <table className="min-w-full table-auto border-collapse bg-black bg-opacity-90 text-yellow-100">
          <thead className="bg-gradient-to-r from-yellow-800 via-yellow-700 to-yellow-800 sticky top-0">
            <tr className="text-sm h-8">
              {[
                "Number",
                "Str",
                "Rumble",
                "Payout",
                "Total",
                "P/L",
                "Profit/Loss (%)",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 text-center text-yellow-100 font-bold uppercase tracking-wider border-b border-yellow-400 select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numbers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-4 text-yellow-400 italic text-sm"
                >
                  No data available
                </td>
              </tr>
            ) : (
              numbers.map(
                ({ number, str, rumble, payout, total, PL, profitLoss }) => (
                  <tr
                    key={number}
                    className="even:bg-black/30 hover:bg-yellow-900/40 transition-colors duration-200 text-sm h-7"
                  >
                    <td className="px-3 text-center font-mono">{number}</td>
                    <td className="px-3 text-center font-mono">{str}</td>
                    <td className="px-3 text-center font-mono">{rumble}</td>
                    <td className="px-3 text-center font-mono">
                      {payout.toLocaleString()}
                    </td>
                    <td className="px-3 text-center font-mono">
                      {total.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 text-center font-mono ${
                        PL > 0
                          ? "text-green-400 font-bold"
                          : PL < 0
                          ? "text-red-500 font-bold"
                          : "text-yellow-300"
                      }`}
                    >
                      {PL.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 text-center font-mono ${
                        profitLoss > 0
                          ? "text-green-400 font-bold"
                          : profitLoss < 0
                          ? "text-red-500 font-bold"
                          : "text-yellow-300"
                      }`}
                    >
                      {profitLoss}%
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination for 3D only */}
      {paginated && totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-3 select-none">
          <button
            className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ◀ Prev
          </button>
          <span className="text-yellow-300 font-mono">
            Page {page} / {totalPages}
          </span>
          <button
            className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}
    </section>
  );

  return (
    <main className="max-w-7xl mx-auto p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.3)] border-4 border-yellow-500">
      <h1 className="text-center text-yellow-300 font-extrabold text-4xl tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,215,0,0.9)] mb-12">
        🎯 Profit & Loss
      </h1>

      {/* Navigation Buttons */}
      <div className="flex justify-center mb-8 gap-6 select-none">
        <button
          className={`px-6 py-2 rounded-lg font-bold text-xl transition ${
            view === "twoD"
              ? "bg-yellow-500 text-black shadow-lg"
              : "bg-yellow-800 text-yellow-200 hover:bg-yellow-700"
          }`}
          onClick={() => setView("twoD")}
        >
          2-Digit Numbers
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-bold text-xl transition ${
            view === "threeD"
              ? "bg-yellow-500 text-black shadow-lg"
              : "bg-yellow-800 text-yellow-200 hover:bg-yellow-700"
          }`}
          onClick={() => setView("threeD")}
        >
          3-Digit Numbers
        </button>
      </div>

      {/* Render selected table */}
      {view === "twoD" ? (
        <Table numbers={sortByProfitLoss(data.twoD)} />
      ) : (
        <Table
          numbers={pagedThreeD}
          paginated={true}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </main>
  );
}
