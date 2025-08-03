"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleOff, Eye, EyeOff, LucideDelete } from "lucide-react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
export default function AdminAgentPage() {
  const router = useRouter();
  const [onlineAgentIds, setOnlineAgentIds] = useState(new Set());

  const [expense, setExpense] = useState(false);
  const [updateExpense, setUpdateExpense] = useState(false);
  const [tenPercent, setTenPercent] = useState(false);
  const [updateTenPercent, setUpdateTenPercent] = useState(false);
  const [expenseAmt, setExpenseAmt] = useState(0);
  const [updateExpenseAmt, setUpdateExpenseAmt] = useState(0);
  const [tenPercentAmt, setTenPercentAmt] = useState(0);
  const [updateTenPercentAmt, setUpdateTenPercentAmt] = useState(0);

  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const toggleVisible = (agentId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
  };
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [entryCounts, setEntryCounts] = useState({});
  const [entryCountsNotes, setEntryCountsNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [iPercentages, setIPercentages] = useState({
    threeD: 45,
    twoD: 25,
    oneD: 0,
    str: 400,
    rumble: 80,
    down: 60,
    single: 3,
  });
  const [percentages, setPercentages] = useState({
    threeD: 0,
    twoD: 0,
    oneD: 0,
    str: 0,
    rumble: 0,
    down: 0,
    single: 0,
  });
  const [cPercentages, setCPercentages] = useState({
    threeD: 40,
    twoD: 20,
    oneD: 0,
    str: 350,
    rumble: 70,
    down: 50,
    single: 3,
  });
  const [cUpdatePercentages, setCUpdatePercentages] = useState({
    threeD: 0,
    twoD: 0,
    oneD: 0,
    str: 0,
    rumble: 0,
    down: 0,
    single: 0,
  });
  const [formError, setFormError] = useState("");

  const [editingAgent, setEditingAgent] = useState(null);
  const [editingModal, setEditingModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalNotes, setModalNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteId, setNoteId] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMasterAgent, setSelectedMasterAgent] = useState("Admin");

  async function notes(agentId) {
    setShowNoteModal(true);
    setNoteId(agentId);
    try {
      const res = await fetch(`/api/getNotes?agentId=${agentId}`);
      const data = await res.json();
      setModalNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }
  async function submitNote(agentId) {
    if (!noteInput.trim()) return;
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, note: noteInput }),
      });

      // Refresh notes after upload
      notes(agentId);
      setNoteInput("");
    } catch (err) {
      console.error("Failed to submit note:", err);
    }
  }
  const deleteVoucher = async (agentId) => {
    const input = window.prompt(
      `Type the agentId "${agentId}" to confirm deletion of all vouchers:`
    );

    if (input !== agentId) {
      alert("❌ Deletion cancelled. Agent ID did not match.");
      return;
    }

    try {
      const res = await fetch(
        `/api/deleteVoucherByAgentId?agentId=${agentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (res.ok) {
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

      for (const agent of agents) {
        try {
          const res = await fetch(`/api/getNotes?agentId=${agent.agentId}`);
          const data = await res.json();

          counts[agent.agentId] = data.notes?.length || 0; // Store count instead of array
        } catch (error) {
          console.error(`Failed to load notes for ${agent.agentId}:`, error);
          counts[agent.agentId] = 0;
        }
      }

      setEntryCountsNotes(counts); // Set final counts object
    };

    if (agents.length > 0) {
      fetchCountsForNotes();
    }
  }, [agents]);

  async function deleteNote(agentId, time) {
    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, time }),
      });
      notes(agentId); // re-fetch after deletion
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    setError("");
    try {
      const res = await fetch("/api/getAgents");
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents);
      } else {
        setError(data.message || "Failed to fetch agents");
      }
    } catch {
      setError("Failed to fetch agents");
    } finally {
      setLoadingAgents(false);
    }
  };
  // When clicking % button, open modal and load agent percentages
  const handleEditClick = (agent) => {
    setEditingAgent(agent);
    setAgentId(agent.agentId);
    setName(agent.name);
    setPassword(agent.password);
    setPercentages(
      agent.percentages || {
        threeD: 0,
        twoD: 0,
        oneD: 0,
        str: 0,
        rumble: 0,
        down: 0,
        single: 0,
      }
    );
    setCUpdatePercentages(
      agent.cPercentages || {
        threeD: 0,
        twoD: 0,
        oneD: 0,
        str: 0,
        rumble: 0,
        down: 0,
        single: 0,
      }
    );

    setUpdateExpense(agent.expense);
    setUpdateTenPercent(agent.tenPercent);
    setUpdateExpenseAmt(agent.expenseAmt);
    setUpdateTenPercentAmt(agent.tenPercentAmt);
    setEditingModal(true);
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!agentId || !password || !name) {
      setError("Please fill in Agent ID, password, and name");
      return;
    }

    const hasValidIPercentages =
      iPercentages && Object.values(iPercentages).length;
    const hasValidCPercentages =
      cPercentages && Object.values(cPercentages).length;

    if (!hasValidIPercentages || !hasValidCPercentages) {
      setError("Please complete both Banker and Customer discount fields");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/addAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agentId.trim(),
          password,
          name: name.trim(),
          percentages: iPercentages,
          cPercentages,
          expense,
          expenseAmt,
          tenPercent,
          tenPercentAmt,
          masterAgent: "Admin",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchAgents();
        setAgentId("");
        setPassword("");
        setName("");
        // setSubAgents([{ id: "", password: "" }]);
        alert("✅ Agent added successfully");
      } else {
        setError(data.message || "Failed to add agent");
      }
    } catch (err) {
      console.error("Add Agent Error:", err);
      setError("Something went wrong while adding agent");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (agentId, currentActive) => {
    const confirmed = confirm("Are you sure you want to delete this agent?");

    if (!confirmed) {
      alert("Deletion cancelled.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/toggleAgentActive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, active: !currentActive }),
      });
      const data = await res.json();

      if (res.ok) {
        if (!currentActive) {
          await fetchAgents();
        } else {
          setAgents((prev) => prev.filter((a) => a.agentId !== agentId));
        }
      } else {
        setError(data.message || "Failed to update agent status");
      }
    } catch {
      setError("Failed to update agent status");
    }
  };

  const updateAgent = async () => {
    setFormError(""); // reset

    // Basic frontend validation
    if (!agentId || !name || !password) {
      setFormError("Agent ID, Name, and Password are required.");
      return;
    }

    try {
      const res = await fetch("/api/updateAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldAgentId: editingAgent.agentId,
          agentId,
          name,
          password,
          percentages: percentages,
          cPercentages: cUpdatePercentages,
          expense: updateExpense,
          tenPercent: updateTenPercent,
          expenseAmt: updateExpenseAmt,
          tenPercentAmt: updateTenPercentAmt,
          masterAgent: "Admin",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchAgents();
        alert("saved");
        setEditingModal(false);
        setEditingAgent(null);
      } else {
        setFormError(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update agent:", err);
      setFormError("Server error. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCountsForAgents = async () => {
      setLoading(true);
      const counts = {};

      for (const agent of agents) {
        try {
          const res = await fetch("/api/getVoucherQntByAgentId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId: agent.agentId }),
          });

          const data = await res.json();
          if (res.ok) {
            counts[agent.agentId] = data.count;
          } else {
            counts[agent.agentId] = "Error";
          }
        } catch (err) {
          counts[agent.agentId] = "Error";
        }
      }

      setLoading(false);
      setEntryCounts(counts);
    };

    if (agents.length > 0) {
      fetchCountsForAgents();
    }
  }, [agents]);
  // Send heartbeat for current logged-in agent

  const fetchOnlineAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/getOnlineAgents");
      const data = await res.json();
      if (res.ok) {
        // data.agents is an array of online agents, extract IDs
        const onlineIds = new Set(data.agents.map((a) => a.agentId));
        setOnlineAgentIds(onlineIds);
      } else {
        setError(data.message || "Failed to fetch online agents");
        setOnlineAgentIds(new Set());
      }
    } catch {
      setError("Failed to fetch online agents");
      setOnlineAgentIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineAgents();

    // Optional: refresh every 1 minute to keep list updated
    const interval = setInterval(fetchOnlineAgents, 60000);
    return () => clearInterval(interval);
  }, []);

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
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const response = await fetch("/api/getTotalAmountPlayed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch totals");
        }

        const data = await response.json();
        setTotals(data.totals);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();
  }, []);
  const uniqueMasterAgents = Array.from(
    new Set(agents.map((agent) => agent.masterAgent).filter(Boolean))
  );

  // If you want `"Admin"` always on top and in the list:
  if (!uniqueMasterAgents.includes("Admin")) {
    uniqueMasterAgents.unshift("Admin");
  }
  const filteredAgents = agents.filter((agent) => {
    const nameMatches = agent.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Only agents with masterAgent matching selectedMasterAgent are shown by default
    const masterMatches = agent.masterAgent === selectedMasterAgent;

    return nameMatches && masterMatches;
  });
 
  return (
    <div className="p-6 text-white font-mono bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
      <div className="text-white p-4 bg-gray-900 rounded-lg shadow-lg">
        {loading && <p>🎰 Loading totals...</p>}
        {error && <p className="text-red-400">⚠️ {error}</p>}
        {totals && (
          <div className="w-full overflow-x-auto">
            <div className="flex flex-row items-center justify-center gap-8 sm:gap-12 px-6 py-5 min-w-[600px] bg-gradient-to-r from-black via-red-900 to-black rounded-2xl border-4 border-yellow-500 shadow-[0_0_40px_rgba(255,215,0,0.6)] font-mono text-yellow-100 animate-fade-in">
              {/* 3D */}
              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 3D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.ThreeD}
                </p>
              </div>

              {/* 2D */}
              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 2D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.TwoD}
                </p>
              </div>

              {/* 1D */}
              <div className="text-center px-3">
                <p className="text-sm text-yellow-400 uppercase tracking-wide">
                  🎯 1D
                </p>
                <p className="text-3xl font-extrabold text-yellow-300 drop-shadow glow">
                  {totals.OneD}
                </p>
              </div>

              {/* Total */}
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
      </div>

      <section className="w-full max-w-full">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          🧑‍💼 Agents List
        </h2>
        {loadingAgents ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin-slow text-6xl text-yellow-300">🎲</div>
          </div>
        ) : (
          <div className="overflow-x-auto text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <input
                type="text"
                placeholder="🔎 Search Agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-gray-900 border border-yellow-400 text-yellow-200 placeholder-yellow-500 font-mono shadow-md focus:outline-none"
              />

              <select
                value={selectedMasterAgent}
                onChange={(e) => setSelectedMasterAgent(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-yellow-400 text-yellow-200 font-mono shadow-md focus:outline-none"
              >
                {uniqueMasterAgents.map((master) => (
                  <option key={master} value={master}>
                    {master}
                  </option>
                ))}
              </select>
            </div>

            <table className="min-w-full text-yellow-300 border-collapse font-mono">
              <thead>
                <tr className="bg-yellow-700 text-white">
                  <th className="border border-yellow-400 p-2">#</th>
                  <th className="border border-yellow-400 p-2">Name</th>
                  <th className="border border-yellow-400 p-2">Agent ID</th>
                  <th className="border border-yellow-400 p-2">Password</th>

                  <th className="font-bangla border border-yellow-400 p-2">
                    <span> ডিসকাঊন্ট</span>
                  </th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    সুবিধা
                  </th>
                  {/* <th className="font-bangla border border-yellow-400 p-2">
                    Sub Agent
                  </th> */}
                  <th className="border border-yellow-400 p-2">Status</th>
                  <th colSpan={5} className="border border-yellow-400 p-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center p-4 text-pink-400 font-bold"
                    >
                      No agents found.
                    </td>
                  </tr>
                )}

                {filteredAgents.map(
                  (
                    {
                      agentId,
                      name,
                      password,
                      active,
                      percentages,
                      cPercentages,
                      expense,
                      tenPercent,
                      expenseAmt,
                      tenPercentAmt,
                      hasSubAgents,
                    },
                    i
                  ) => (
                    <tr
                      key={agentId}
                      className="odd:bg-gray-800 even:bg-gray-900"
                    >
                      <td className="border border-yellow-400 p-2">{i + 1}</td>
                      <td
                        onClick={() =>
                          router.push(`/admin/agent-games/${agentId}`)
                        }
                        className="relative border border-yellow-400 p-2 cursor-pointer hover:bg-yellow-400/10 transition"
                      >
                        {name}
                        {loading && (
                          <div className="flex justify-center items-center absolute top-2 right-2 ">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                              <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                            </div>
                          </div>
                        )}
                        {entryCounts[agentId] > 0 && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                            {entryCounts[agentId]}
                          </span>
                        )}
                      </td>

                      <td className="border border-yellow-400 p-2">
                        {agentId}
                      </td>
                      <td className="border border-yellow-400 p-2 ">
                        <span className="text-white px-4">
                          {visiblePasswords[agentId] ? password : "********"}
                        </span>
                        <button onClick={() => toggleVisible(agentId)}>
                          {visiblePasswords[agentId] ? (
                            <EyeOff size={18} className="text-yellow-400" />
                          ) : (
                            <Eye size={18} className="text-yellow-400" />
                          )}
                        </button>
                      </td>

                      <td className="border border-yellow-400 p-2 sm:min-w-[10rem] max-w-full">
                        <div className="text-green-400 truncate">
                          {Object.values(percentages ?? {}).length > 0
                            ? Object.values(percentages).join(", ")
                            : "—"}
                        </div>
                        <div className="text-red-400 truncate">
                          {Object.values(cPercentages ?? {}).length > 0
                            ? Object.values(cPercentages).join(", ")
                            : "—"}
                        </div>
                      </td>
                      {/* <td className="border border-yellow-400 p-2 space-x-2 ">
                        <span className="text-red-400">
                          {Object.values(cPercentages ?? {}).length > 0
                            ? Object.values(cPercentages).join(", ")
                            : "—"}
                        </span>
                      </td> */}
                      <td className=" border font-bangla border-yellow-400 text-sm">
                        <label className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={expense}
                            onChange={(e) => setExpense(e.target.checked)}
                            disabled={adding}
                            className="accent-yellow-500"
                          />
                          <span>
                            খরচ
                            <span className="text-red-400 px-1">
                              {expenseAmt}
                            </span>
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={tenPercent}
                            onChange={(e) => setTenPercent(e.target.checked)}
                            disabled={adding}
                            className="accent-yellow-500"
                          />
                          <span>
                            আন্ডার
                            <span className="text-red-400 px-1">
                              {tenPercentAmt} %
                            </span>
                          </span>
                        </label>
                      </td>

                      <td className="border border-yellow-400 px-3 py-2">
                        {onlineAgentIds.has(agentId) ? (
                          <div className="space-x-1">
                            <span className="inline-block align-middle w-4 h-4 rounded-full bg-green-500 animate-pulse"></span>
                          </div>
                        ) : (
                          <div className="space-x-1">
                            <span className="inline-block align-middle w-4 h-4 rounded-full bg-gray-400"></span>
                          </div>
                        )}
                      </td>
                      {/* <td className="border border-yellow-400 p-2 space-x-2">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              router.push(`/admin/agent-games/${agentId}`)
                            }
                            className="px-4 py-1 hover:bg-yellow-500 text-black font-bold rounded-full shadow-md transition"
                          >
                            🎰
                          </button>
                          {loading && (
                            <div className="flex justify-center items-center absolute -top-2 -right-2 ">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                              </div>
                            </div>
                          )}
                          {entryCounts[agentId] > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                              {entryCounts[agentId]}
                            </span>
                          )}
                        </div>
                      </td> */}
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() =>
                            handleEditClick({
                              agentId,
                              name,
                              password,
                              percentages,
                              cPercentages,
                              expense,
                              tenPercent,
                              expenseAmt,
                              tenPercentAmt,
                            })
                          }
                          className="px-3 py-1 rounded  text-yellow-400 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <div className="relative inline-block">
                          <button
                            onClick={() => notes(agentId)}
                            className="px-4 py-1 hover:bg-yellow-500 text-black font-bold rounded-full shadow-md transition"
                          >
                            📝
                          </button>

                          {entryCountsNotes[agentId] > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                              {entryCountsNotes[agentId]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() => toggleActive(agentId, active)}
                          className={`px-3 py-1 rounded  
                          } text-red-500 font-semibold`}
                        >
                          {active && <CircleOff />}
                        </button>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() => deleteVoucher(agentId)}
                          className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-600 font-semibold flex items-center space-x-1"
                        >
                          <LucideDelete className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
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
          ➕ Add New Agent
        </button>
        {modal && (
          <form
            onSubmit={handleAddAgent}
            className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg max-w-md mb-10"
          >
            {/* Agent Info */}
            <input
              type="text"
              placeholder="Agent Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-black border border-yellow-400 text-yellow-300"
              disabled={adding}
            />
            <input
              type="text"
              placeholder="Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value.replace(/\s/g, ""))}
              className="w-full mb-3 p-3 rounded bg-black border border-yellow-400 text-yellow-300"
              disabled={adding}
            />
            <input
              type="text"
              placeholder="Agent Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full mb-3 p-3 rounded bg-black border ${
                passwordValid ? "border-yellow-400" : "border-red-500"
              } text-yellow-300`}
              disabled={adding}
            />
            {!passwordValid && password.length > 0 && (
              <p className="text-red-500 text-sm mt-[-10px] mb-2">
                Must be at least 6 characters and include uppercase, lowercase,
                and a number
              </p>
            )}

            {/* Subagents Section */}

            <div className="mb-4">
              <label className="font-bangla block text-yellow-400 text-lg mt-5">
                ব্যাংকার ডিসকাঊন্ট
              </label>
              {Object.entries(iPercentages).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <label className="block capitalize text-sm text-yellow-400 mb-1">
                    {key}
                  </label>
                  <input
                    type="number"
                    placeholder={key}
                    value={value}
                    onChange={(e) =>
                      setIPercentages((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 placeholder-yellow-600"
                    disabled={adding}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="mb-4 ">
              <label className="font-bangla block text-red-500 text-lg mt-5">
                কাস্টমার ডিসকাঊন্ট
              </label>
              {Object.entries(cPercentages).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <label className="block capitalize text-sm text-red-500 mb-1">
                    {key}
                  </label>
                  <input
                    type="number"
                    placeholder={key}
                    value={value}
                    onChange={(e) =>
                      setCPercentages((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded bg-black border border-red-500 text-red-500 placeholder-red-900"
                    disabled={adding}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="font-bangla block text-yellow-400 text-lg mt-5">
                সিলেকশন
              </label>
              <div className="font-bangla  flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2 text-yellow-300">
                  <input
                    type="checkbox"
                    checked={expense}
                    onChange={(e) => setExpense(e.target.checked)}
                    disabled={adding}
                    className="accent-yellow-500"
                  />
                  <span>খরচ</span>
                </label>
                <label className="flex items-center space-x-2 text-yellow-300">
                  <input
                    type="checkbox"
                    checked={tenPercent}
                    onChange={(e) => setTenPercent(e.target.checked)}
                    disabled={adding}
                    className="accent-yellow-500"
                  />
                  <span>আন্ডার 10%</span>
                </label>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Expense Amount */}
              {expense && (
                <div>
                  <label className="font-bangla block text-yellow-400 text-lg mb-2">
                    খরচের পরিমাণ
                  </label>
                  <input
                    type="number"
                    placeholder="খরচ"
                    value={expenseAmt}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setExpenseAmt(val);
                    }}
                    disabled={adding}
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 font-bangla"
                  />
                </div>
              )}
              {/* 10% Amount */}
              {tenPercent && (
                <div>
                  <label className="font-bangla block text-yellow-400 text-lg mb-2">
                    আন্ডার 10% পরিমাণ
                  </label>
                  <select
                    value={tenPercentAmt}
                    onChange={(e) => setTenPercentAmt(Number(e.target.value))}
                    disabled={adding}
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 text-center font-bangla focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              )}{" "}
            </div>

            {/* Discounts and Settings */}
            {/* ...retain your iPercentages, cPercentages, expense, tenPercent logic as is... */}

            {/* Final Submit */}
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded transition"
            >
              {adding ? "Adding..." : "Add Agent"}
            </button>

            {error && <p className="mt-2 text-red-400">{error}</p>}
          </form>
        )}
      </section>

      {editingModal && editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg text-white w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-yellow-400 text-center">
              Edit Agent: {editingAgent.name}
            </h2>
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingModal(false);
                  setEditingAgent(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateAgent}
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
            {/* Agent ID */}{" "}
            <div className="mb-3">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm">Agent ID</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value.replace(/\s/g, ""))}
              />
            </div>
            {/* Name */}
            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm">Password</label>
              <input
                type="text"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full mb-3 p-3 rounded bg-black border ${
                  passwordValid ? "border-yellow-400" : "border-red-500"
                } text-yellow-300`}
                disabled={adding}
              />{" "}
              {!passwordValid && password.length > 0 && (
                <p className="text-red-500 text-sm mt-[-10px] mb-2">
                  Must be at least 6 characters and include uppercase,
                  lowercase, and a number
                </p>
              )}
            </div>
            {/* Percentages */}
            <div className="mb-3 mt-4">
              <h3 className=" font-bangla text-yellow-400 font-semibold mb-2">
                ব্যাংকার ডিসকাঊন্ট
              </h3>
              {Object.entries(percentages).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block capitalize text-sm">{key}</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                    value={value}
                    onChange={(e) =>
                      setPercentages((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || "",
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mb-3 mt-4">
              <h3 className=" font-bangla text-red-400 font-semibold mb-2">
                কাস্টমার ডিসকাঊন্ট
              </h3>
              {Object.entries(cUpdatePercentages).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block capitalize text-sm">{key}</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-black border border-red-400 rounded text-red-300"
                    value={value}
                    onChange={(e) =>
                      setCUpdatePercentages((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || "",
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="font-bangla block text-yellow-400 text-lg mt-5">
                সিলেকশন
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2 text-yellow-300">
                  <input
                    type="checkbox"
                    checked={updateExpense}
                    onChange={(e) => setUpdateExpense(e.target.checked)}
                    disabled={adding}
                    className="accent-yellow-500"
                  />
                  <span>খরচ</span>
                </label>
                <label className="flex items-center space-x-2 text-yellow-300">
                  <input
                    type="checkbox"
                    checked={updateTenPercent}
                    onChange={(e) => setUpdateTenPercent(e.target.checked)}
                    disabled={adding}
                    className="accent-yellow-500"
                  />
                  <span>আন্ডার 10%</span>
                </label>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Expense Amount */}
              {updateExpense && (
                <div>
                  <label className="font-bangla block text-yellow-400 text-lg mb-2">
                    খরচের পরিমাণ
                  </label>
                  <input
                    type="number"
                    placeholder="খরচ"
                    value={updateExpenseAmt}
                    onChange={(e) => setUpdateExpenseAmt(e.target.value)}
                    disabled={adding}
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 font-bangla"
                  />
                </div>
              )}

              {/* 10% Amount */}
              {updateTenPercent && (
                <div>
                  <label className="font-bangla block text-yellow-400 text-lg mb-2">
                    আন্ডার 10% পরিমাণ
                  </label>
                  <select
                    value={updateTenPercentAmt}
                    onChange={(e) =>
                      setUpdateTenPercentAmt(Number(e.target.value))
                    }
                    disabled={adding}
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 text-center font-bangla focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center font-mono">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-4 border-yellow-500 rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-extrabold text-yellow-300 mb-4 text-center">
              🃏 Agent Notes
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
      )}
      <ScrollToTopButton />
    </div>
  );
}
