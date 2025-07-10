"use client";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ProfitLossTable() {
  const [data, setData] = useState({ threeD: [], twoD: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThreeD, setSelectedThreeD] = useState(null);
  const [selectedTwoD, setSelectedTwoD] = useState(null);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [modalAgents, setModalAgents] = useState([]);
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
                ({
                  number,
                  str,
                  rumble,
                  payout,
                  total,
                  PL,
                  profitLoss,
                  agents,
                }) => (
                  <tr
                    key={number}
                    onClick={() => {
                      if (view === "threeD")
                        setSelectedThreeD({
                          number,
                          str,
                          rumble,
                          payout,
                          total,
                          PL,
                          profitLoss,
                          agents,
                        });
                      if (view === "twoD")
                        setSelectedTwoD({
                          number,
                          str,
                          rumble,
                          payout,
                          total,
                          PL,
                          profitLoss,
                          agents,
                        });
                    }}
                    className={`cursor-pointer hover:bg-yellow-900/40 transition-colors duration-200 text-sm h-7 ${
                      (view === "threeD" &&
                        selectedThreeD?.number === number) ||
                      (view === "twoD" && selectedTwoD?.number === number)
                        ? "bg-gradient-to-r from-green-500 to-green-700  text-white font-bold"
                        : "even:bg-black/30"
                    }`}
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
  const InfoRow = ({ label, value, onClick, isInteractive }) => (
    <>
      <div className="text-gray-300">{label}</div>
      <div
        className={`font-bold ${
          isInteractive
            ? "cursor-pointer hover:text-yellow-300 transition-colors"
            : "text-green-400"
        }`}
        onClick={onClick}
      >
        {value}
      </div>
    </>
  );

  const SummaryRow = ({ label, value }) => (
    <tr className="border-b border-green-300 bg-green-900/30">
      <td className="px-4 py-2 text-yellow-200 font-semibold text-left">
        {label}
      </td>
      <td className="px-4 py-2 text-right font-bold text-white">
        {value != null ? value.toLocaleString() : "—"}
      </td>
    </tr>
  );
  const labelMap = {
    threeD: "3 D",
    twoD: "2 D",
    oneD: "1 D",
  };

  return (
    <main className="max-w-[7xl] mx-auto p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.3)] border-4 border-yellow-500">
      <h1 className="text-center text-yellow-300 font-extrabold text-4xl tracking-widest uppercase drop-shadow-[0_0_5px_rgba(255,215,0,0.9)] mb-12">
        🎯 Profit & Loss
      </h1>
      <div className="max-w-[1024px] my-5">
        <div className="overflow-x-auto  flex flex-row flex-nowrap gap-6 justify-center">
          {/* Selected 2D Box */}

          {selectedTwoD && (
            <div className="w-full sm:w-[22rem] p-6 rounded-xl border-4 border-yellow-400 bg-gradient-to-br from-black via-red-900 to-black shadow-[0_0_25px_rgba(255,215,0,0.6)] text-white font-mono animate-fade-in">
              <h2 className="text-3xl font-extrabold text-yellow-300 text-left mb-4">
                🎲 2 D
              </h2>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <InfoRow label="🔢 Number" value={selectedTwoD?.number} />
                <InfoRow label="🧾 STR" value={selectedTwoD?.str} />
                <InfoRow label="🎯 Rumble" value={selectedTwoD?.rumble} />
                <InfoRow label="💸 Payout" value={selectedTwoD?.payout} />
                <InfoRow label="🧮 Total" value={selectedTwoD?.total} />
                <InfoRow label="📈 PL" value={selectedTwoD?.PL} />
                <InfoRow
                  label="🏁 P/L"
                  value={selectedTwoD?.profitLoss}
                  isProfit={selectedTwoD?.profitLoss >= 0}
                />
                <InfoRow
                  label="📈 Agents"
                  value={
                    <span className="flex items-center gap-2">
                      {selectedTwoD?.agents?.length || 0}
                      <span className="text-blue-300">ℹ️</span>
                    </span>
                  }
                  onClick={() => {
                    setModalAgents(selectedTwoD?.agents || []);
                    setShowAgentsModal(true);
                  }}
                  isInteractive
                />
              </div>
            </div>
          )}

          {/* Totals Box */}
          <div className="w-full sm:w-[22rem] p-6 bg-gradient-to-br from-gray-900 via-black to-red-900 rounded-2xl shadow-2xl border-4 border-yellow-500 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6 tracking-wide uppercase drop-shadow-md">
              🎯 Total
            </h2>
            <div className="space-y-4 text-center font-mono text-lg">
              {["threeD", "twoD", "oneD"].map((key) => (
                <div
                  key={key}
                  className="flex justify-between px-4 py-2 bg-gray-800 rounded-lg shadow-inner"
                >
                  <span className="text-red-300 font-bold">
                    {labelMap[key] ?? key}
                  </span>
                  <span className="text-white">
                    {data?.finalTotals?.[key] ?? "—"}
                  </span>
                </div>
              ))}

              {selectedThreeD && selectedTwoD ? (
                <table className="w-full text-sm font-mono text-white bg-gradient-to-r from-green-700 to-green-500 rounded-xl shadow-lg border border-green-300 mt-4">
                  <tbody>
                    <SummaryRow
                      label="Total Game"
                      value={data?.finalTotals?.total}
                    />
                    <SummaryRow
                      label="Payout"
                      value={selectedThreeD.payout + selectedTwoD.payout}
                    />
                    <SummaryRow
                      label="P/L"
                      value={
                        data.finalTotals.total -
                        selectedThreeD.payout -
                        selectedTwoD.payout
                      }
                    />
                    <SummaryRow
                      label="%"
                      value={`${(
                        ((data.finalTotals.total -
                          selectedThreeD.payout -
                          selectedTwoD.payout) /
                          data?.finalTotals?.total) *
                        100
                      ).toFixed(2)}%`}
                    />
                  </tbody>
                </table>
              ) : (
                <div className="flex justify-between px-4 py-3 bg-gradient-to-r from-green-700 to-green-500 rounded-xl shadow-lg border border-green-300 mt-4">
                  <span className="text-white font-bold text-xl">💰 Total</span>
                  <span className="text-yellow-300 font-extrabold text-xl">
                    {data?.finalTotals?.total ?? "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Selected 3D Box */}
          {selectedThreeD && (
            <div className="w-full sm:w-[22rem] p-6 rounded-xl border-4 border-yellow-400 bg-gradient-to-br from-black via-red-900 to-black shadow-[0_0_25px_rgba(255,215,0,0.6)] text-white font-mono animate-fade-in">
              <h2 className="text-3xl font-extrabold text-yellow-300 text-left mb-4">
                🎲 3 D
              </h2>
              <div className="grid grid-cols-2 gap-4 text-lg">
                <InfoRow label="🔢 Number" value={selectedThreeD?.number} />
                <InfoRow label="🧾 String" value={selectedThreeD?.str} />
                <InfoRow label="🎯 Rumble" value={selectedThreeD?.rumble} />
                <InfoRow label="💸 Payout" value={selectedThreeD?.payout} />
                <InfoRow label="🧮 Total" value={selectedThreeD?.total} />
                <InfoRow label="📈 PL" value={selectedThreeD?.PL} />
                <InfoRow
                  label="🏁 P/L"
                  value={selectedThreeD?.profitLoss}
                  isProfit={selectedThreeD?.profitLoss >= 0}
                />
                <InfoRow
                  label="📈 Agents"
                  value={
                    <span className="flex items-center gap-2">
                      {selectedThreeD?.agents?.length || 0}
                      <span className="text-blue-300">ℹ️</span>
                    </span>
                  }
                  onClick={() => {
                    setModalAgents(selectedThreeD?.agents || []);
                    setShowAgentsModal(true);
                  }}
                  isInteractive
                />
              </div>
            </div>
          )}
        </div>
      </div>
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
          2-Digit
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-bold text-xl transition ${
            view === "threeD"
              ? "bg-yellow-500 text-black shadow-lg"
              : "bg-yellow-800 text-yellow-200 hover:bg-yellow-700"
          }`}
          onClick={() => setView("threeD")}
        >
          3-Digit
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
      {showAgentsModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-100 via-red-100 to-pink-100 text-black rounded-xl shadow-2xl border-4 border-yellow-400 p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-extrabold text-center text-red-700 mb-6 tracking-wide uppercase">
              🧑‍💼 Agents
            </h2>

            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-transparent">
              {modalAgents.map((agent, idx) => (
                <li
                  key={idx}
                  className="bg-white/90 rounded-lg px-4 py-2 shadow-inner border-l-4 border-yellow-500"
                >
                  <div className="font-bold text-lg text-red-800">
                    {agent.id}
                  </div>
                  <div className="text-sm text-gray-700">
                    🎯 STR:
                    <span className="font-semibold text-black">
                      {agent.str}
                    </span>
                    &nbsp;|&nbsp; 🔄 RUMBLE:{" "}
                    <span className="font-semibold text-black">
                      {agent.rumble}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-center text-sm text-gray-800 font-semibold">
              💰 Total STR:{" "}
              <span className="text-green-700">
                {modalAgents.reduce((sum, a) => sum + a.str, 0)}
              </span>{" "}
              | 🔁 Total RUMBLE:{" "}
              <span className="text-blue-700">
                {modalAgents.reduce((sum, a) => sum + a.rumble, 0)}
              </span>
            </div>

            <button
              onClick={() => setShowAgentsModal(false)}
              className="mt-8 w-full py-2 bg-gradient-to-r from-red-600 via-yellow-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:brightness-110 transition-all duration-300"
            >
              🎬 Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
