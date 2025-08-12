"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CircleOff,
  Eye,
  EyeOff,
  LucideBadgeCheck,
  LucideDelete,
  LucideTrash2,
} from "lucide-react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useAgent } from "@/context/AgentContext";
import GamerDetailsModal from "@/components/VoucherApproveModal";
export default function AgentGamerPage() {
  const router = useRouter();
  const { agentId } = useAgent();
  const [gamers, setGamers] = useState([]);
  const [loadingGamers, setLoadingGamers] = useState(false);
  const [error, setError] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const toggleVisible = (gamerId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [gamerId]: !prev[gamerId],
    }));
  };
  const [gamerId, setGamerId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [adding, setAdding] = useState(false);
  const [entryCounts, setEntryCounts] = useState({});
  const [waitingEntryCount, setWaitingEntryCount] = useState(0);
  const [transactions, setTransactions] = useState();
  const [entryCountsNotes, setEntryCountsNotes] = useState({});
  const [loading, setLoading] = useState(true);
  // const [iPercentages, setIPercentages] = useState({
  //   threeD: 45,
  //   twoD: 25,
  //   oneD: 0,
  //   str: 400,
  //   rumble: 80,
  //   down: 60,
  //   single: 3,
  // });
  // const [percentages, setPercentages] = useState({
  //   threeD: 0,
  //   twoD: 0,
  //   oneD: 0,
  //   str: 0,
  //   rumble: 0,
  //   down: 0,
  //   single: 0,
  // });
  // const [cPercentages, setCPercentages] = useState({
  //   threeD: 40,
  //   twoD: 20,
  //   oneD: 0,
  //   str: 350,
  //   rumble: 70,
  //   down: 50,
  //   single: 3,
  // });
  // const [cUpdatePercentages, setCUpdatePercentages] = useState({
  //   threeD: 0,
  //   twoD: 0,
  //   oneD: 0,
  //   str: 0,
  //   rumble: 0,
  //   down: 0,
  //   single: 0,
  // });
  const [formError, setFormError] = useState("");

  const [editingGamer, setEditingGamer] = useState(null);
  const [editingModal, setEditingModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalNotes, setModalNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteId, setNoteId] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  async function notes(gamerId) {
    setShowNoteModal(true);
    setNoteId(gamerId);
    try {
      const res = await fetch(`/api/getNotes?agentId=${gamerId}`);
      const data = await res.json();
      setModalNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }
  async function submitNote(gamerId) {
    if (!noteInput.trim()) return;
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: gamerId, note: noteInput }),
      });

      // Refresh notes after upload
      notes(gamerId);
      setNoteInput("");
    } catch (err) {
      console.error("Failed to submit note:", err);
    }
  }
  const deleteVoucher = async (gamerId) => {
    const input = window.prompt(
      `Type the gamerId "${gamerId}" to confirm deletion of all vouchers:`
    );

    if (input !== gamerId) {
      alert("❌ Deletion cancelled. Customer ID did not match.");
      return;
    }

    try {
      const res = await fetch(
        `/api/deleteVoucherByGamerId?gamerId=${gamerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (res.ok) {
        fetchCountsForGamers();

        alert("Vouchers deleted successfully");
        // Optional: reload or refetch data
      } else {
        alert("Failed to delete vouchers: " + result.message);
      }
    } catch (error) {
      console.error("Delete voucher error:", error);
      alert("An error occurred while deleting vouchers.");
    }
  };

  useEffect(() => {
    const fetchCountsForNotes = async () => {
      const counts = {};

      for (const gamer of gamers) {
        try {
          const res = await fetch(`/api/getNotes?agentId=${gamer.gamerId}`);
          const data = await res.json();

          counts[gamer.gamerId] = data.notes?.length || 0; // Store count instead of array
        } catch (error) {
          console.error(`Failed to load notes for ${gamer.gamerId}:`, error);
          counts[gamer.gamerId] = 0;
        }
      }

      setEntryCountsNotes(counts); // Set final counts object
    };

    if (gamers.length > 0) {
      fetchCountsForNotes();
    }
  }, [gamers]);

  async function deleteNote(gamerId, time) {
    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: gamerId, time }),
      });
      notes(gamerId); // re-fetch after deletion
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  useEffect(() => {
    if (!agentId) return; // Wait until we have agentId
    fetchGamers();
  }, [agentId]);

  const fetchGamers = async () => {
    setLoadingGamers(true);
    setError("");

    try {
      const res = await fetch("/api/getGamers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setGamers(data.gamers);
      } else {
        setError(data.message || "Failed to fetch gamers");
      }
    } catch {
      setError("Failed to fetch gamers");
    } finally {
      setLoadingGamers(false);
    }
  };

  const handleAddGamer = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!gamerId || !password) {
      setError("Please fill in Customer ID, password");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/addGamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gamerId: gamerId.trim(),
          password,
          // name: name.trim(),
          agentId: agentId,
          // percentages: iPercentages,
          // cPercentages,
          // expense,
          // expenseAmt,
          // tenPercent,
          // tenPercentAmt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchGamers();
        setGamerId("");
        setPassword("");
        // setName("");
        alert("✅ gamer added successfully");
      } else {
        setError(data.message || "Failed to add gamer");
      }
    } catch (err) {
      console.error("Add gamer Error:", err);
      setError("Something went wrong while adding gamer");
    } finally {
      setAdding(false);
    }
  };

  // const toggleActive = async (gamerId, currentActive) => {
  //   const confirmed = confirm("Are you sure you want to delete this gamer?");

  //   if (!confirmed) {
  //     alert("Deletion cancelled.");
  //     return;
  //   }
  //   setError("");
  //   try {
  //     const res = await fetch("/api/togglegamerActive", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ gamerId, active: !currentActive }),
  //     });
  //     const data = await res.json();

  //     if (res.ok) {
  //       if (!currentActive) {
  //         await fetchgamers();
  //       } else {
  //         setgamers((prev) => prev.filter((a) => a.gamerId !== gamerId));
  //       }
  //     } else {
  //       setError(data.message || "Failed to update gamer status");
  //     }
  //   } catch {
  //     setError("Failed to update gamer status");
  //   }
  // };

  const updateGamer = async () => {
    setFormError(""); // reset

    // Basic frontend validation
    if (!gamerId || !password) {
      setFormError("Customer ID, Name, and Password are required.");
      return;
    }

    try {
      const res = await fetch("/api/updateGamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldGamerId: editingGamer.gamerId,
          gamerId,
          // name,
          password,
          // percentages: percentages,
          // cPercentages: cUpdatePercentages,
          // expense: updateExpense,
          // tenPercent: updateTenPercent,
          // expenseAmt: updateExpenseAmt,
          // tenPercentAmt: updateTenPercentAmt,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchGamers();
        alert("saved");
        setEditingModal(false);
        setEditingGamer(null);
      } else {
        setFormError(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update gamer:", err);
      setFormError("Server error. Please try again.");
    }
  };

  const [entryTotalCounts, setEntryTotalCounts] = useState({});
  const [waitingPlayersGamer, setWaitingPlayersGamer] = useState({});
  const [waitingPlayed, setWaitingPlayed] = useState({});

  const fetchCountsForGamers = async () => {
    setLoading(true);
    const counts = {};
    const waitingCounts = {};
    const waitingPlayed = {};
    const waitingPlayersMap = {};
    const played = {};

    for (const gamer of gamers) {
      try {
        const res = await fetch("/api/getVoucherQntByGamerId", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gamerId: gamer.gamerId }),
        });

        const data = await res.json();
        if (res.ok) {
          counts[gamer.gamerId] = data.count;
          played[gamer.gamerId] = data.totals?.total;
        } else {
          counts[gamer.gamerId] = "Error";
        }
      } catch (err) {
        counts[gamer.gamerId] = "Error";
      }

      try {
        const res = await fetch("/api/getVoucherQntByGamerIdWaiting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gamerId: gamer.gamerId }),
        });

        if (res.ok) {
          const data = await res.json();
          waitingCounts[gamer.gamerId] = data.count;
          waitingPlayed[gamer.gamerId] = data.totals?.total;
          waitingPlayersMap[gamer.gamerId] = data.players; // 👈 Store full array of player objects
        }
      } catch (err) {
        console.error("Waiting players error:", err);
      }
    }

    setLoading(false);
    setEntryCounts(counts);
    setWaitingEntryCount(waitingCounts);
    setWaitingPlayed(waitingPlayed);
    setEntryTotalCounts(played);
    setWaitingPlayersGamer(waitingPlayersMap); // 👈 Set the full map here
  };
  useEffect(() => {
    if (gamers.length > 0) {
      fetchCountsForGamers();
    }
  }, [gamers]);

  const [selectedGamerId, setSelectedGamerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (gamerId) => {
    setSelectedGamerId(gamerId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGamerId(null);
  };

  // Send heartbeat for current logged-in gamer

  // const fetchOnlineGamers = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const res = await fetch("/api/getOnlineGamers");
  //     const data = await res.json();
  //     if (res.ok) {
  //       // data.gamers is an array of online gamers, extract IDs
  //       const onlineIds = new Set(data.gamers.map((a) => a.gamerId));
  //       setOnlineGamerIds(onlineIds);
  //     } else {
  //       setError(data.message || "Failed to fetch online gamers");
  //       setOnlineGamerIds(new Set());
  //     }
  //   } catch {
  //     setError("Failed to fetch online gamers");
  //     setOnlineGamerIds(new Set());
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchOnlineGamers();

  //   // Optional: refresh every 1 minute to keep list updated
  //   const interval = setInterval(fetchOnlineGamers, 60000);
  //   return () => clearInterval(interval);
  // }, []);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Validate: uppercase, lowercase, number, and min length 6
    const isValid =
      /[A-Z]/.test(value) && // uppercase
      /[a-z]/.test(value) && // lowercase
      /\d/.test(value) && // number
      value.length >= 6; // min length

    setPasswordValid(isValid);
  };
  // const [totals, setTotals] = useState(null);

  // useEffect(() => {
  //   const fetchTotals = async () => {
  //     try {
  //       const response = await fetch("/api/getTotalAmountPlayed", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to fetch totals");
  //       }

  //       const data = await response.json();
  //       setTotals(data.totals);
  //     } catch (err) {
  //       setError(err.message || "Unknown error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTotals();
  // }, []);

  const filteredGamers = gamers.filter((gamer) => {
    const nameMatches = gamer.gamerId
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Only gamers with mastergamer matching selectedMastergamer are shown by default

    return nameMatches;
  });
  const [histories, setHistories] = useState({}); // { gamerId: [transactions] }

  useEffect(() => {
    if (gamers.length === 0) return;

    async function fetchAllHistories() {
      const results = await Promise.all(
        gamers.map(async (g) => {
          const res = await fetch(`/api/trxnAgent?gamerId=${g.gamerId}`);
          if (!res.ok) return { gamerId: g.gamerId, transaction: null };
          const data = await res.json();
          return { gamerId: g.gamerId, transaction: data || null };
        })
      );

      // Convert array of { gamerId, transaction } to a lookup object
      const historiesObj = results.reduce((acc, curr) => {
        acc[curr.gamerId] = curr.transaction;
        return acc;
      }, {});

      setHistories(historiesObj);
    }

    fetchAllHistories();
  }, [gamers]);

  return (
    <div className="p-6 text-white font-mono bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
      {/* <div className="text-white p-4 bg-gray-900 rounded-lg shadow-lg">
        {loading && <p>🎰 Loading totals...</p>}
        {error && <p className="text-red-400">⚠️ {error}</p>}
        {totals && (
          <div className="w-full overflow-x-auto">
            <div className="flex flex-row items-center justify-center gap-8 sm:gap-12 px-6 py-5 min-w-[600px] bg-gradient-to-r from-black via-red-900 to-black rounded-2xl border-4 border-yellow-500 shadow-[0_0_40px_rgba(255,215,0,0.6)] font-mono text-yellow-100 animate-fade-in">
              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 3D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.ThreeD}
                </p>
              </div>

              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 2D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.TwoD}
                </p>
              </div>

              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 1D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.OneD}
                </p>
              </div>

              <div className="text-center px-3">
                <p className="text-sm text-green-300 uppercase tracking-wide">
                  💰 Total
                </p>
                <p className="text-3xl font-extrabold text-green-400 drop-shadow glow">
                  {totals.total}
                </p>
              </div>
            </div>
          </div>
        )}
      </div> */}
      <section className="w-full max-w-full">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          🧑‍💼 Customer List
        </h2>
        {loadingGamers ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin-slow text-6xl text-yellow-300">🎲</div>
          </div>
        ) : (
          <div className="overflow-x-auto text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <input
                type="text"
                placeholder="🔎 Search Gamer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-gray-900 border border-yellow-400 text-yellow-200 placeholder-yellow-500 font-mono shadow-md focus:outline-none"
              />
            </div>

            <table className="min-w-full text-yellow-300 border-collapse font-mono">
              <thead>
                <tr className="bg-yellow-700 text-white">
                  <th className="border border-yellow-400 p-2">#</th>
                  {/* <th className="border border-yellow-400 p-2">Name</th> */}
                  <th className="border border-yellow-400 p-2">Customer ID</th>
                  <th className="border border-yellow-400 p-2">Password</th>
                  <th className="border border-yellow-400 p-2">transaction</th>
                  <th className="border border-yellow-400 p-2">
                    Waiting Voucher
                  </th>

                  {/* <th className="font-bangla border border-yellow-400 p-2">
                    <span> ডিসকাঊন্ট</span>
                  </th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    সুবিধা
                  </th> */}

                  {/* <th className="border border-yellow-400 p-2">Status</th> */}

                  <th className="border border-yellow-400 p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {gamers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center p-4 text-pink-400 font-bold"
                    >
                      No gamers found.
                    </td>
                  </tr>
                )}

                {filteredGamers.map(
                  (
                    {
                      gamerId,
                      // name,
                      password,
                      // active,
                      // percentages,
                      // cPercentages,
                      // expense,
                      // tenPercent,
                      // expenseAmt,
                      // tenPercentAmt,
                    },
                    i
                  ) => (
                    <tr
                      key={gamerId}
                      className="odd:bg-gray-800 even:bg-gray-900"
                    >
                      <td className="border border-yellow-400 p-2">{i + 1}</td>
                      <td
                        onClick={() =>
                          router.push(`/agent/gamer-games/${gamerId}`)
                        }
                        className="relative border border-yellow-400 px-10 py-5 cursor-pointer hover:bg-yellow-400/10 transition"
                      >
                        {gamerId}

                        {loading && (
                          <div className="flex justify-center items-center absolute top-2 right-2 ">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                            </div>
                          </div>
                        )}
                        {entryCounts[gamerId] > 0 && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                            {entryCounts[gamerId]}
                          </span>
                        )}

                        {entryTotalCounts[gamerId] > 0 && (
                          <span className="absolute bottom-2 right-2 w-auto p-1 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                            {entryTotalCounts[gamerId]}
                          </span>
                        )}
                      </td>

                      <td className="border border-yellow-400 p-2 ">
                        <span className="text-white px-4">
                          {visiblePasswords[gamerId] ? password : "********"}
                        </span>
                        <button onClick={() => toggleVisible(gamerId)}>
                          {visiblePasswords[gamerId] ? (
                            <EyeOff size={18} className="text-yellow-400" />
                          ) : (
                            <Eye size={18} className="text-yellow-400" />
                          )}
                        </button>
                      </td>

                      <td className="border border-yellow-400 p-2">
                        {loading && (
                          <div className="flex justify-center items-center absolute top-2 right-2 ">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                            </div>
                          </div>
                        )}

                        {histories[gamerId] ? (
                          <div className="text-sm text-white text-center">
                            # {histories[gamerId].trxnNumber} | 💰{" "}
                            {histories[gamerId].amount} | 💳{" "}
                            {histories[gamerId].method}
                          </div>
                        ) : (
                          <em className="text-gray-400">No transaction</em>
                        )}
                      </td>
                      <td className="p-2 border border-yellow-400 align-middle">
                        <div className="flex justify-center items-center space-x-3">
                          {/* Action buttons container */}
                          <div className="flex space-x-2 items-center ">
                            {/* BadgeCheck button with notification badge */}
                            <div className=" inline-block">
                              <span className=" absolute top-1 right-1  bg-green-600  text-white  text-xs  font-bold  rounded-full  px-2  py-[2px]  min-w-[20px]  text-center shadow-md pointer-events-none         ">
                                {waitingEntryCount[gamerId] || 0}
                              </span>
                              <span className=" absolute bottom-1 right-1  bg-red-600  text-white  text-xs  font-bold  rounded-full  px-2  py-[2px]  min-w-[20px]  text-center shadow-md pointer-events-none         ">
                                {waitingPlayed[gamerId] || 0}
                              </span>
                            </div>
                            <div className="relative inline-block">
                              <button
                                onClick={() => openModal(gamerId)}
                                className="px-3 py-1 rounded text-green-600 font-semibold flex items-center"
                              >
                                <LucideBadgeCheck className="w-6 h-6" />
                              </button>
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={() => deleteVoucher(gamerId)}
                              className="px-3 py-1 rounded text-red-600 font-semibold flex items-center"
                            >
                              <LucideTrash2 className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="border border-yellow-400 p-2 space-x-2">
                        <div className="relative inline-block">
                          <button
                            onClick={() => notes(gamerId)}
                            className="px-4 py-1 hover:bg-yellow-500 text-black font-bold rounded-full shadow-md transition"
                          >
                            📝
                          </button>

                          {entryCountsNotes[gamerId] > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                              {entryCountsNotes[gamerId]}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={() => {
            setModal(!modal);
          }}
          className="text-2xl font-bold  text-yellow-400 mt-6"
        >
          ➕ Add New Customer
        </button>
        {modal && (
          <form
            onSubmit={handleAddGamer}
            className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg max-w-md mb-10"
          >
            {/* gamer Info */}

            <input
              type="text"
              placeholder="Customer ID"
              value={gamerId}
              onChange={(e) => setGamerId(e.target.value.replace(/\s/g, ""))}
              className="w-full mb-3 p-3 rounded bg-black border border-yellow-400 text-yellow-300"
              disabled={adding}
            />
            <input
              type="text"
              placeholder="Customer Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full mb-3 p-3 rounded bg-black border `}
              disabled={adding}
            />

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded transition"
            >
              {adding ? "Adding..." : "Add gamer"}
            </button>

            {error && <p className="mt-2 text-red-400">{error}</p>}
          </form>
        )}
      </section>
      {editingModal && editingGamer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg text-white w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-yellow-400 text-center">
              Edit gamer: {editingGamer.name}
            </h2>
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingModal(false);
                  setEditingGamer(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateGamer}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>{" "}
            {formError && (
              <p className="text-red-400 text-sm mb-3 text-center">
                {formError}
              </p>
            )}
            <div className="mb-3">
              <label className="block text-sm">Customer ID</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={gamerId}
                onChange={(e) => setGamerId(e.target.value.replace(/\s/g, ""))}
              />
            </div>
            {/* Name */}
            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm">Customer Password</label>
              <input
                type="text"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full mb-3 p-3 rounded bg-black border `}
                disabled={adding}
              />{" "}
            </div>
          </div>
        </div>
      )}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center font-mono">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-4 border-yellow-500 rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-extrabold text-yellow-300 mb-4 text-center">
              🃏 Customer Notes
            </h2>

            <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-transparent">
              {modalNotes.map((n, i) => (
                <div
                  key={i}
                  className="bg-white/10 p-3 rounded text-sm shadow-inner border-l-2 border-yellow-400 text-yellow-100 flex flex-col"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>{n.text}</div>
                    <button
                      onClick={() => deleteNote(noteId, n.time)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold"
                      title="Delete note"
                    >
                      ❌
                    </button>
                  </div>
                  <div className="text-xs text-yellow-500 mt-1">
                    🕓 {new Date(n.time).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Type your note like a boss..."
                className="flex-1 px-3 py-2 rounded bg-black text-yellow-200 border border-yellow-500 placeholder-yellow-500 focus:outline-none"
              />
              <button
                onClick={() => submitNote(noteId)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-black font-bold rounded-full hover:scale-105 transition"
              >
                💾 Save
              </button>
            </div>

            <button
              onClick={() => setShowNoteModal(false)}
              className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow"
            >
              🚪 Close
            </button>
          </div>
        </div>
      )}{" "}
      <GamerDetailsModal
        isOpen={modalOpen}
        onClose={closeModal}
        gamerId={selectedGamerId}
        players={waitingPlayersGamer[selectedGamerId]}
        fetchCountsForGamers={fetchCountsForGamers}
      />
      <ScrollToTopButton />
    </div>
  );
}
