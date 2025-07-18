"use client";
import React, { useEffect, useState } from "react";

export default function ProfitLossTable() {
  const [data, setData] = useState({ threeD: [], twoD: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThreeD, setSelectedThreeD] = useState(null);
  const [selectedTwoD, setSelectedTwoD] = useState(null);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [unPlayedModal, setUnPlayedModal] = useState(false);
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
  //unplayed

  const playedTwoD = new Set(data.twoD.map((n) => n.number));
  const playedThreeD = new Set(data.threeD.map((n) => n.number));
  const allTwoD = Array.from({ length: 100 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const allThreeD = Array.from({ length: 1000 }, (_, i) =>
    i.toString().padStart(3, "0")
  );
  const unplayedTwoD = allTwoD.filter((num) => !playedTwoD.has(num));
  const unplayedThreeD = allThreeD.filter((num) => !playedThreeD.has(num));

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

  const Table = ({
    numbers,
    paginated,
    view,
    page,
    setPage,
    selectedThreeD,
    selectedTwoD,
    setSelectedThreeD,
    setSelectedTwoD,
  }) => {
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(numbers);

    const pageSize = 100;
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Filter data on search
    useEffect(() => {
      if (!search.trim()) {
        setFiltered(numbers);
      } else {
        const query = search.trim().toLowerCase();
        setFiltered(
          numbers.filter(({ number }) => number.toLowerCase().includes(query))
        );
        setPage(1); // Reset to first page after search
      }
    }, [search, numbers]);
    const topRumbleByBucket = {};

    filtered.forEach((entry) => {
      const bucket = Math.floor(entry.profitLoss);
      if (
        !topRumbleByBucket[bucket] ||
        entry.rumble > topRumbleByBucket[bucket].rumble
      ) {
        topRumbleByBucket[bucket] = entry;
      }
    });
    const highlightClass =
      " text-green-500 font-bold text-center text-2xl shadow-md";
    return (
      <section className="mb-12">
        {/* 🔍 Search Bar */}
        <div className="mb-4 flex justify-center gap-3">
          <input
            type="text"
            placeholder="🎲 Enter Lucky Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 border-yellow-500 bg-gradient-to-br from-black via-zinc-900 to-black text-yellow-300 placeholder-yellow-600 font-mono shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={() => setSearch(search)}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold shadow-[0_0_15px_rgba(255,0,0,0.7)] transition-all duration-200"
          >
            🔍
          </button>
        </div>

        {/* 📊 Table */}
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
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-4 text-yellow-400 italic text-sm"
                  >
                    No matching numbers found
                  </td>
                </tr>
              ) : (
                paged.map((entry) => {
                  const isSelected =
                    (view === "threeD" &&
                      selectedThreeD?.number === entry.number) ||
                    (view === "twoD" && selectedTwoD?.number === entry.number);
                  const bucket = Math.floor(entry.profitLoss);
                  const isTopRumble =
                    topRumbleByBucket[bucket]?.number === entry.number;

                  return (
                    <tr
                      key={entry.number}
                      onClick={() => {
                        const selected = { ...entry };
                        if (view === "threeD") setSelectedThreeD(selected);
                        if (view === "twoD") setSelectedTwoD(selected);
                      }}
                      className={`cursor-pointer transition-colors duration-200 text-sm h-7 ${
                        isSelected
                          ? "bg-gradient-to-r from-green-500 to-green-700 text-white font-bold"
                          : "hover:bg-yellow-900/40 even:bg-black/30"
                      }`}
                    >
                      <td className="px-3 text-center font-mono">
                        {entry.number}
                      </td>
                      <td className="px-3 text-center font-mono">
                        {entry.str}
                      </td>
                      <td
                        className={`cursor-pointer transition-colors duration-200  h-7 ${
                          isTopRumble
                            ? `${highlightClass} hover:brightness-110`
                            : "px-3 text-center font-mono"
                        }`}
                      >
                        {entry.rumble}
                      </td>
                      <td className="px-3 text-center font-mono">
                        {entry.payout.toLocaleString()}
                      </td>
                      <td className="px-3 text-center font-mono">
                        {entry.total.toLocaleString()}
                      </td>
                      <td
                        className={`px-3 text-center font-mono ${
                          entry.PL > 0
                            ? "text-green-400 font-bold"
                            : entry.PL < 0
                            ? "text-red-500 font-bold"
                            : "text-yellow-300"
                        }`}
                      >
                        {entry.PL.toLocaleString()}
                      </td>
                      <td
                        className={`px-3 text-center font-mono ${
                          entry.profitLoss > 0
                            ? "text-green-400 font-bold"
                            : entry.profitLoss < 0
                            ? "text-red-500 font-bold"
                            : "text-yellow-300"
                        }`}
                      >
                        {entry.profitLoss}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination */}
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
              className="bg-yellow-700 hover:bg-yellow-800 px-3 py-1 rounded disabled={page === totalPages}"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next ▶
            </button>
          </div>
        )}
      </section>
    );
  };

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
                      ).toFixed(1)}%`}
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
                <InfoRow label="🧾 STR" value={selectedThreeD?.str} />
                <InfoRow label="🎯 Rumble" value={selectedThreeD?.rumble} />
                {selectedThreeD?.singleDetails?.length > 0 && (
                  <InfoRow
                    label="🎯 Single"
                    value={
                      <div className="space-y-1">
                        {selectedThreeD.singleDetails.map((d, idx) => (
                          <div key={idx}>
                            <span className="text-yellow-300">{d.digit}</span>
                            <span className="text-white">--</span>
                            <span className="text-green-400 font-bold">
                              {d.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                )}

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
              ? "bg-green-500 text-black shadow-lg"
              : "bg-green-800 text-yellow-200 hover:bg-green-700"
          }`}
          onClick={() => setUnPlayedModal(true)}
        >
          UnPlayed
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
        <Table
          numbers={sortByProfitLoss(data.twoD)}
          view="twoD"
          paginated={false} // explicitly disable pagination
          page={page}
          setPage={setPage}
          selectedTwoD={selectedTwoD}
          setSelectedTwoD={setSelectedTwoD}
        />
      ) : (
        <Table
          view={"threeD"}
          numbers={sortByProfitLoss(data.threeD)}
          paginated={true}
          page={page}
          setPage={setPage}
          selectedThreeD={selectedThreeD}
          setSelectedThreeD={setSelectedThreeD}
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
                    &nbsp;|&nbsp; 🔄 RUMBLE:
                    <span className="font-semibold text-black">
                      {agent.rumble}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-center text-sm text-gray-800 font-semibold">
              💰 Total STR:
              <span className="text-green-700">
                {modalAgents.reduce((sum, a) => sum + a.str, 0)}
              </span>
              | 🔁 Total RUMBLE:
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
      {unPlayedModal && (
        <div className="fixed inset-0 z-50 bg-gradient-to-tr from-black via-[#0b0b0b] to-black bg-opacity-90 backdrop-blur-md flex justify-center items-center">
          <div className="relative bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white font-mono rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 ring-4 ring-lime-400 shadow-[0_0_40px_10px_rgba(0,255,0,0.3)]">
            <button
              onClick={() => setUnPlayedModal(false)}
              className="absolute top-4 right-4 text-white bg-red-700 hover:bg-red-600 rounded-full p-2 shadow-md transition-transform hover:scale-105"
            >
              ✕
            </button>

            <div className="mx-auto mt-8 bg-gradient-to-br from-[#142d14] to-[#0c1f0c] rounded-xl ring-2 ring-yellow-500 shadow-[0_0_15px_5px_rgba(255,215,0,0.2)] p-6">
              <h2 className="text-yellow-300 text-3xl font-extrabold mb-6 text-center tracking-wider drop-shadow-md">
                🃏 Unplayed Numbers 🃏
              </h2>

              <p className="text-lime-300 font-bold mb-2 text-lg tracking-wide">
                2-Digit ({unplayedTwoD.length}):
              </p>
              <div className="grid grid-cols-12 gap-2 text-lime-200 text-sm">
                {unplayedTwoD.map((num) => (
                  <span
                    key={num}
                    className="bg-[#101c10] border border-lime-400 px-1 py-1 rounded text-center shadow-inner shadow-lime-600 hover:scale-105 hover:bg-[#1a2e1a] transition-transform duration-150"
                  >
                    {num}
                  </span>
                ))}
              </div>

              <p className="text-red-300 font-bold mt-6 mb-2 text-lg tracking-wide">
                3-Digit ({unplayedThreeD.length}):
              </p>
              <div className="grid grid-cols-12 gap-2 text-yellow-100 text-sm">
                {unplayedThreeD.map((num) => (
                  <span
                    key={num}
                    className="bg-[#1e1a10] border border-yellow-400 px-1 py-1 rounded text-center shadow-inner shadow-yellow-500 hover:scale-105 hover:bg-[#2c2214] transition-transform duration-150"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
