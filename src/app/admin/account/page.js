"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import GameSummary from "@/components/GameSummaryModal";
import { AppWindow, FileText } from "lucide-react";
import ExVoucher from "@/components/ExVoucherModal";

export default function Account() {
  const [threeUp, setThreeUp] = useState("");
  const [downGame, setDownGame] = useState("");
  const [gameDate, setGameDate] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [allSummaries, setAllSummaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");
  const [summaryModal, setSummaryModal] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [exVoucherModalVisible, setExVoucherModalVisible] = useState(false);
  const [selectedSummaryItem, setSelectedSummaryItem] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const currentGameContentRef = useRef(null);
  const agentContentRef = useRef(null);
  const yearContentRef = useRef(null);
  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = currentGameContentRef.current;
    if (element) {
      const options = {
        margin: 10,
        filename: `${gameDate}.${threeUp}.${downGame}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
          background: "#ffffff", // Explicitly set white background for the canvas
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found!");
    }
  };
  const handleAgentDownloadPdf = async (selectedAgent) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = agentContentRef.current;
    if (element) {
      const options = {
        margin: 10,
        filename: `${selectedAgent}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
          background: "#ffffff", // Explicitly set white background for the canvas
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found!");
    }
  };
  const handleYearDownloadPdf = async (selectedYear) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = yearContentRef.current;
    if (element) {
      const options = {
        margin: 10,
        filename: `${selectedYear}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          // *** THIS IS THE KEY: Force a white background for the PDF rendering ***
          background: "#ffffff", // Explicitly set white background for the canvas
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found!");
    }
  };

  useEffect(() => {
    setLoading(true);
    setFetched(false);
    setError("");

    const fetchAllData = async () => {
      try {
        // 1. Fetch game status and winning numbers in parallel
        const [winStatusRes] = await Promise.all([fetch("/api/win-status")]);
        const winStatusData = await winStatusRes.json();

        setThreeUp(winStatusData.threeUp);
        setDownGame(winStatusData.downGame);
        setGameDate(winStatusData.date);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ type: "", message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCalculate = async () => {
    if (!threeUp || !downGame || !gameDate) {
      setToast({ type: "error", message: "All fields are required." });
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to proceed with the calculation?"
    );
    if (!confirmed) return;

    setSubmitting(true);
    setToast({ type: "", message: "" });

    try {
      const res = await fetch("/api/calculate-all-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threeUp,
          downGame,
          gameDate: format(gameDate, "yyyy-MM-dd"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Calculation failed");

      setToast({
        type: "success",
        message: `✅ ${data.summaries.length} summaries generated.`,
      });

      setThreeUp("");
      setDownGame("");
      setGameDate(null);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unexpected error." });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const res = await fetch("/api/get-summaries");
        const data = await res.json();
        if (data.success) {
          setAllSummaries(data.summaries);
          const dates = data.summaries.map((s) =>
            new Date(s.gameDate).toDateString()
          );
          const sortedDates = [...new Set(dates)].sort(
            (a, b) => new Date(b) - new Date(a)
          );
          if (sortedDates.length > 0) {
            setSelectedDate(sortedDates[0]);
          }
          const agents = Array.from(
            new Map(data.summaries.map((s) => [s.agentId, s])).values()
          );
          if (agents.length > 0) {
            setSelectedAgent(agents[0].agentId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch summaries:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, []);

  const uniqueDates = [
    ...new Set(allSummaries.map((s) => new Date(s.gameDate).toDateString())),
  ].sort((a, b) => new Date(b) - new Date(a));

  const uniqueAgents = [
    ...new Map(
      allSummaries.map((s) => [s.agentId, { agentId: s.agentId, name: s.name }])
    ).values(),
  ].sort((a, b) => a.agentId.localeCompare(b.agentId));

  const filteredSummaries = allSummaries.filter(
    (s) => new Date(s.gameDate).toDateString() === selectedDate
  );

  const filteredAgentSummaries = allSummaries
    .filter((s) => s.agentId === selectedAgent)
    .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
  //game summary modal
  const handleOpenModal = (agentId, gameDate) => {
    // Pass this info to your modal or state manager
    console.log("Open modal for:", agentId, gameDate);
    // Example: setModalData({ agentId, gameDate }); setShowModal(true);
    setSummaryModal(true);
  };
  const totalsBD = filteredSummaries.reduce(
    (acc, item) => {
      acc.afterSTR += item.afterSTR || 0;
      acc.afterRUMBLE += item.afterRUMBLE || 0;
      acc.afterDOWN += item.afterDOWN || 0;
      acc.afterSINGLE += item.afterSINGLE || 0;
      acc.totalGame += item.totalGame || 0;
      acc.totalWin += item.totalWin || 0;
      return acc;
    },
    {
      afterSTR: 0,
      afterRUMBLE: 0,
      afterDOWN: 0,
      afterSINGLE: 0,
      totalGame: 0,
      totalWin: 0,
    }
  );
  const totalsBA = filteredAgentSummaries.reduce(
    (acc, item) => {
      acc.afterSTR += item.afterSTR || 0;
      acc.afterRUMBLE += item.afterRUMBLE || 0;
      acc.afterDOWN += item.afterDOWN || 0;
      acc.afterSINGLE += item.afterSINGLE || 0;
      acc.totalGame += item.totalGame || 0;
      acc.totalWin += item.totalWin || 0;
      return acc;
    },
    {
      afterSTR: 0,
      afterRUMBLE: 0,
      afterDOWN: 0,
      afterSINGLE: 0,
      totalGame: 0,
      totalWin: 0,
    }
  );

  // 1. Remove duplicates (if needed — skip this if already clean)
  const seenKeys = new Set();
  const uniqueSummaries = allSummaries.filter((item) => {
    const key = `${item.agentId}-${item.voucher || ""}-${item.gameDate}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // 2. Get available years
  const years = Array.from(
    new Set(uniqueSummaries.map((s) => new Date(s.gameDate).getFullYear()))
  ).sort((a, b) => b - a);

  // 3. State for selected year (default most recent)

  // 4. Filter summaries by selected year
  const summariesInYear = uniqueSummaries.filter(
    (s) => new Date(s.gameDate).getFullYear() === selectedYear
  );

  // 5. Group by gameDate
  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const entry of summariesInYear) {
      const dateStr = entry.gameDate;
      if (!groups[dateStr]) {
        groups[dateStr] = {
          STR: 0,
          RUMBLE: 0,
          DOWN: 0,
          SINGLE: 0,
          totalGame: 0,
          totalWin: 0,
        };
      }
      groups[dateStr].STR += entry.afterSTR || 0;
      groups[dateStr].RUMBLE += entry.afterRUMBLE || 0;
      groups[dateStr].DOWN += entry.afterDOWN || 0;
      groups[dateStr].SINGLE += entry.afterSINGLE || 0;
      groups[dateStr].totalGame += entry.totalGame || 0;
      groups[dateStr].totalWin += entry.totalWin || 0;
    }
    return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
  }, [summariesInYear]);

  // 6. Yearly total
  const yearTotal = groupedByDate.reduce(
    (acc, [, daily]) => {
      acc.STR += daily.STR;
      acc.RUMBLE += daily.RUMBLE;
      acc.DOWN += daily.DOWN;
      acc.SINGLE += daily.SINGLE;
      acc.totalGame += daily.totalGame;
      acc.totalWin += daily.totalWin;
      return acc;
    },
    {
      STR: 0,
      RUMBLE: 0,
      DOWN: 0,
      SINGLE: 0,
      totalGame: 0,
      totalWin: 0,
    }
  );
  // 7. Ultimate (All Years) Total
  const ultimateTotal = uniqueSummaries.reduce(
    (acc, entry) => {
      acc.STR += entry.afterSTR || 0;
      acc.RUMBLE += entry.afterRUMBLE || 0;
      acc.DOWN += entry.afterDOWN || 0;
      acc.SINGLE += entry.afterSINGLE || 0;
      acc.totalGame += entry.totalGame || 0;
      acc.totalWin += entry.totalWin || 0;
      return acc;
    },
    {
      STR: 0,
      RUMBLE: 0,
      DOWN: 0,
      SINGLE: 0,
      totalGame: 0,
      totalWin: 0,
    }
  );

  return (
    <div className="p-4 min-h-screen text-white font-mono space-y-10">
      {/* Summary Runner */}
      <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-lg ring-2 ring-cyan-400 text-white shadow-lg">
        <h2 className="text-2xl font-bold text-lime-400 text-center">
          🧮 All-Agent Summary Runner
        </h2>

        {toast.message && (
          <div
            className={`rounded mt-4 p-3 text-sm font-semibold ${
              toast.type === "success"
                ? "bg-green-700 text-green-100 border border-green-400"
                : "bg-red-700 text-red-100 border border-red-400"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block mb-1 font-semibold text-yellow-300">
              🎯 3UP Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{3}"
              value={threeUp}
              readOnly
              disabled
              className="w-full px-4 py-2 rounded bg-gray-800 border border-yellow-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-pink-300">
              💥 DOWN Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{2}"
              value={downGame}
              readOnly
              disabled
              className="w-full px-4 py-2 rounded bg-gray-800 border border-pink-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-cyan-300 font-bangla">
              🗓️ গেমের তারিখ
            </label>
            <DatePicker
              selected={gameDate}
              readOnly
              disabled
              dateFormat="dd/MM/yyyy"
              className="w-full px-4 py-2 rounded bg-gray-800 border border-cyan-500 text-white"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={submitting}
          className={`mt-6 w-full sm:w-auto px-6 py-2 font-bold rounded shadow transition ${
            submitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-lime-500 text-black"
          }`}
        >
          {submitting ? "Calculating..." : "Calculate All Agents"}
        </button>
      </div>

      {/* Select Game Date */}
      <div>
        <label className="block mb-2 font-bold text-yellow-300">
          Select Game Date
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-cyan-500 rounded text-white"
        >
          {uniqueDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Table by Date */}
      {loading ? (
        <p className="text-yellow-400">Loading summaries...</p>
      ) : filteredSummaries.length > 0 ? (
        <div
          ref={currentGameContentRef}
          className="overflow-x-auto border border-yellow-600 rounded-xl bg-gray-900 "
        >
          <div className="flex items-center justify-center">
            <h2 className="text-xl font-bold text-yellow-300 py-3 text-center">
              {selectedDate}
              <span className="text-white text-xl">
                {filteredSummaries[0].threeUp &&
                  ` , ${filteredSummaries[0].threeUp}=${filteredSummaries[0].downGame}`}
              </span>
            </h2>
            <button
              onClick={handleDownloadPdf}
              className="p-1 mx-4 rounded-xl bg-gray-200 transition duration-300"
              title="Download Player Info"
            >
              <img src="/download.svg" alt="Download" className="w-8 h-8" />
            </button>
          </div>

          <table className="w-full text-sm bg-gray-900 border-collapse text-green-200 text-center">
            <thead className="bg-gray-800 text-yellow-300">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Name</th>
                <th className="p-2">Agent ID</th>
                <th className="p-2">STR</th>
                <th className="p-2">RUMBLE</th>
                <th className="p-2">DOWN</th>
                <th className="p-2">SINGLE</th>
                <th className="p-2">Total Game</th>
                <th className="p-2">Total Win</th>
                <th className="p-2">W/L</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.agentId}</td>
                  <td className="p-2">{item.afterSTR}</td>
                  <td className="p-2">{item.afterRUMBLE}</td>
                  <td className="p-2">{item.afterDOWN}</td>
                  <td className="p-2">{item.afterSINGLE}</td>
                  <td className="p-2">{item.totalGame}</td>
                  <td className="p-2">{item.totalWin}</td>
                  <td
                    className={`p-2 ${
                      item.totalGame - item.totalWin < 0
                        ? "text-red-500 font-bold"
                        : ""
                    }`}
                  >
                    {item.totalGame - item.totalWin}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-800 text-yellow-300 font-bold">
                <td className="p-2" colSpan={3}>
                  TOTAL
                </td>
                <td className="p-2">{totalsBD.afterSTR}</td>
                <td className="p-2">{totalsBD.afterRUMBLE}</td>
                <td className="p-2">{totalsBD.afterDOWN}</td>
                <td className="p-2">{totalsBD.afterSINGLE}</td>
                <td className="p-2">{totalsBD.totalGame}</td>
                <td className="p-2">{totalsBD.totalWin}</td>
                <td
                  className={`p-2 ${
                    totalsBD.totalGame - totalsBD.totalWin < 0
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  {totalsBD.totalGame - totalsBD.totalWin}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-pink-400 font-bold">
          No data found for {selectedDate}
        </p>
      )}

      {/* Agent Selector */}
      <div className="w-full max-w-xs sm:max-w-sm">
        <label className="block mb-2 font-bold text-pink-300">
          Select Agent ID
        </label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-pink-500 rounded text-white"
        >
          <option value="">-- Choose an agent --</option>
          {uniqueAgents.map((agent) => (
            <option key={agent.agentId} value={agent.agentId}>
              {agent.name ? `${agent.name} (${agent.agentId})` : agent.agentId}
            </option>
          ))}
        </select>
      </div>

      {/* Agent-Specific Summary Table */}
      {selectedAgent && filteredAgentSummaries.length > 0 && (
        <div
          ref={agentContentRef}
          className="overflow-x-auto border border-cyan-500 rounded-xl"
        >
          <div className="flex items-center justify-center">
            <h2 className="text-xl font-bold text-cyan-300 py-3 text-center">
              {selectedAgent}
            </h2>
            <button
              onClick={() => handleAgentDownloadPdf(selectedAgent)}
              className="p-1 mx-4 rounded-xl bg-gray-200 transition duration-300"
              title="Download Player Info"
            >
              <img src="/download.svg" alt="Download" className="w-8 h-8" />
            </button>
          </div>
          <table className="w-full text-sm bg-gray-900 border-collapse text-green-200 text-center">
            <thead className="bg-gray-800 text-pink-300">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Date</th>
                <th className="p-2">GAME</th>
                <th className="p-2">STR</th>
                <th className="p-2">RUMBLE</th>
                <th className="p-2">DOWN</th>
                <th className="p-2">SINGLE</th>
                <th className="p-2">Total Game</th>
                <th className="p-2">Total Win</th>
                <th className="p-2">W/L</th>
                <th className="p-2">Last Updated</th>
                <th className="p-2">Summary</th>
                <th className="p-2">Voucher</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgentSummaries.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-700">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">
                    {format(new Date(item.gameDate), "dd/MM/yyyy")}
                  </td>
                  <td className="p-2">
                    {item.threeUp} = {item.downGame}
                  </td>
                  <td className="p-2">{item.afterSTR}</td>
                  <td className="p-2">{item.afterRUMBLE}</td>
                  <td className="p-2">{item.afterDOWN}</td>
                  <td className="p-2">{item.afterSINGLE}</td>
                  <td className="p-2">{item.totalGame}</td>
                  <td className="p-2">{item.totalWin}</td>
                  <td
                    className={`p-2 ${
                      item.totalGame - item.totalWin < 0
                        ? "text-red-500 font-bold"
                        : ""
                    }`}
                  >
                    {item.totalGame - item.totalWin}
                  </td>
                  <td className="p-2">
                    {item?.lastUpdated
                      ? new Date(item.lastUpdated).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true, // use 24-hour format
                        })
                      : ""}
                  </td>
                  <td className="p-2 text-yellow-300">
                    <button
                      onClick={() => {
                        setSelectedSummaryItem(item);
                        setModalVisible(true);
                      }}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-2 text-yellow-300">
                    <button
                      onClick={() => {
                        setSelectedSummaryItem(item);
                        setExVoucherModalVisible(true);
                      }}
                    >
                      <AppWindow className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-800 text-yellow-300 font-bold">
                <td className="p-2" colSpan={3}>
                  TOTAL
                </td>
                <td className="p-2">{totalsBA.afterSTR}</td>
                <td className="p-2">{totalsBA.afterRUMBLE}</td>
                <td className="p-2">{totalsBA.afterDOWN}</td>
                <td className="p-2">{totalsBA.afterSINGLE}</td>
                <td className="p-2">{totalsBA.totalGame}</td>
                <td className="p-2">{totalsBA.totalWin}</td>
                <td
                  className={`p-2 ${
                    totalsBA.totalGame - totalsBA.totalWin < 0
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  {totalsBA.totalGame - totalsBA.totalWin}
                </td>
                <td className="p-2">—</td>
                <td className="p-2">—</td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {/* Daily Totals Table */}
      {/* 🔽 Year Selector */}
      <div className="mb-4 flex flex-col">
        <label className="font-bold text-yellow-400 mb-2">Select Year:</label>
        <div className="flex items-center justify-start">
          <select
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-yellow-500 w-fit"
          >
            <option value="" disabled>
              -- Select Year --
            </option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleYearDownloadPdf(selectedYear)}
            className="p-1 mx-4 rounded-xl bg-gray-200 transition duration-300"
            title="Download Player Info"
          >
            <img src="/download.svg" alt="Download" className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* 📊 Totals by Date Table */}

      <div className="w-full overflow-x-auto">
        <table
          ref={yearContentRef}
          className="min-w-full border-collapse text-sm font-mono text-center"
        >
          <thead className="bg-yellow-700 text-white">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Date</th>
              <th className="p-2">STR</th>
              <th className="p-2">RUMBLE</th>
              <th className="p-2">DOWN</th>
              <th className="p-2">SINGLE</th>
              <th className="p-2">Total Game</th>
              <th className="p-2">Total Win</th>
              <th className="p-2">W/L</th>
            </tr>
          </thead>
          <tbody>
            {groupedByDate.map(([date, totals], idx) => (
              <tr key={date} className="hover:bg-gray-800">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{new Date(date).toDateString()}</td>
                <td className="p-2">{totals.STR}</td>
                <td className="p-2">{totals.RUMBLE}</td>
                <td className="p-2">{totals.DOWN}</td>
                <td className="p-2">{totals.SINGLE}</td>
                <td className="p-2">{totals.totalGame}</td>
                <td className="p-2">{totals.totalWin}</td>
                <td
                  className={`p-2 font-semibold ${
                    totals.totalGame - totals.totalWin < 0
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  {totals.totalGame - totals.totalWin}
                </td>
              </tr>
            ))}

            {/* Year Total Row */}
            <tr className="bg-gray-900 text-yellow-300 font-bold border-t border-yellow-500">
              <td className="p-2" colSpan={2}>
                Year Total — {selectedYear}
              </td>
              <td className="p-2">{yearTotal.STR}</td>
              <td className="p-2">{yearTotal.RUMBLE}</td>
              <td className="p-2">{yearTotal.DOWN}</td>
              <td className="p-2">{yearTotal.SINGLE}</td>
              <td className="p-2">{yearTotal.totalGame}</td>
              <td className="p-2">{yearTotal.totalWin}</td>
              <td
                className={`p-2 ${
                  yearTotal.totalGame - yearTotal.totalWin < 0
                    ? "text-red-500"
                    : "text-green-400"
                }`}
              >
                {yearTotal.totalGame - yearTotal.totalWin}
              </td>
            </tr>

            {/* Ultimate Total Row */}
            <tr className="bg-yellow-950 text-yellow-200 font-bold border-t border-yellow-500">
              <td className="p-2" colSpan={2}>
                Ultimate Total
              </td>
              <td className="p-2">{ultimateTotal.STR}</td>
              <td className="p-2">{ultimateTotal.RUMBLE}</td>
              <td className="p-2">{ultimateTotal.DOWN}</td>
              <td className="p-2">{ultimateTotal.SINGLE}</td>
              <td className="p-2">{ultimateTotal.totalGame}</td>
              <td className="p-2">{ultimateTotal.totalWin}</td>
              <td
                className={`p-2 ${
                  ultimateTotal.totalGame - ultimateTotal.totalWin < 0
                    ? "text-red-500"
                    : "text-green-400"
                }`}
              >
                {ultimateTotal.totalGame - ultimateTotal.totalWin}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {modalVisible && (
        <GameSummary
          // visible={modalVisible}
          item={selectedSummaryItem}
          onClose={() => setModalVisible(false)}
        />
      )}
      {exVoucherModalVisible && (
        <ExVoucher
          // visible={modalVisible}
          item={selectedSummaryItem}
          onClose={() => setExVoucherModalVisible(false)}
        />
      )}
    </div>
  );
}
