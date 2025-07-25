"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CircleOff,
  Delete,
  DeleteIcon,
  Eye,
  EyeOff,
  LucideDelete,
} from "lucide-react";
import ScrollToTopButton from "@/components/ScrollToTopButton";
export default function AdminMasterAgentPage() {
  const router = useRouter();

  const [masterAgents, setMasterAgents] = useState([]);
  const [loadingMasterAgents, setLoadingMasterAgents] = useState(false);
  const [error, setError] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const toggleVisible = (masterAgentId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [masterAgentId]: !prev[masterAgentId],
    }));
  };
  const [masterAgentId, setMasterAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formError, setFormError] = useState("");

  const [editingMasterAgent, setEditingMasterAgent] = useState(null);
  const [editingModal, setEditingModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalNotes, setModalNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteId, setNoteId] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entryCountsNotes, setEntryCountsNotes] = useState(0);

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

  useEffect(() => {
    const fetchCountsForNotes = async () => {
      const counts = {};

      for (const agent of masterAgents) {
        try {
          const res = await fetch(
            `/api/getNotes?agentId=${agent.masterAgentId}`
          );
          const data = await res.json();

          counts[agent.masterAgentId] = data.notes?.length || 0; // Store count instead of array
        } catch (error) {
          console.error(
            `Failed to load notes for ${agent.masterAgentId}:`,
            error
          );
          counts[agent.masterAgentId] = 0;
        }
      }

      setEntryCountsNotes(counts); // Set final counts object
    };

    if (masterAgents.length > 0) {
      fetchCountsForNotes();
    }
  }, [masterAgents]);

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
    fetchMasterAgents();
  }, []);

  const fetchMasterAgents = async () => {
    setLoadingMasterAgents(true);
    setError("");
    try {
      const res = await fetch("/api/getMasterAgents");
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        setMasterAgents(data.masterAgents);
      } else {
        setError(data.message || "Failed to fetch Master agents");
      }
    } catch {
      setError("Failed to fetch Master agents");
    } finally {
      setLoadingMasterAgents(false);
    }
  };
  // When clicking % button, open modal and load masteragent percentages
  const handleEditClick = (masterAgent) => {
    setEditingMasterAgent(masterAgent);
    setMasterAgentId(masterAgent.masterAgentId);
    setName(masterAgent.name);
    setPassword(masterAgent.password);

    setEditingModal(true);
  };

  const handleAddMasterAgent = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!masterAgentId || !password || !name) {
      setError("Please fill in masterAgent ID, password, and name");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/addMasterAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterAgentId: masterAgentId.trim(),
          password,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchMasterAgents();
        setMasterAgentId("");
        setPassword("");
        setName("");
        alert("✅ masterAgent added successfully");
      } else {
        setError(data.message || "Failed to add master agent");
      }
    } catch (err) {
      console.error("Add masterAgent Error:", err);
      setError("Something went wrong while adding master agent");
    } finally {
      setAdding(false);
    }
  };

  const updateMasterAgent = async () => {
    setFormError(""); // reset

    // Basic frontend validation
    if (!masterAgentId || !name || !password) {
      setFormError("masterAgent ID, Name, and Password are required.");
      return;
    }

    try {
      const res = await fetch("/api/updateMasterAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldMasterAgentId: editingMasterAgent.masterAgentId,
          masterAgentId,
          name,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchMasterAgents();
        alert("saved");
        setEditingModal(false);
        setEditingMasterAgent(null);
        setMasterAgentId("");
        setName("");
        setPassword("");
      } else {
        setFormError(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update master agent:", err);
      setFormError("Server error. Please try again.");
    }
  };

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

  const filteredMasterAgents = masterAgents.filter((masterAgent) => {
    const nameMatches = masterAgent.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return nameMatches;
  });

  return (
    <div className="p-6 text-white font-mono bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
      <section className="w-full max-w-full">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          🧑‍💼 Master Agents List
        </h2>
        {loadingMasterAgents ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin-slow text-6xl text-cyan-300">🎲</div>
          </div>
        ) : (
          <div className="overflow-x-auto text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <input
                type="text"
                placeholder="🔎 Search masterAgent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-gray-900 border border-cyan-400 text-cyan-200 placeholder-cyan-500 font-mono shadow-md focus:outline-none"
              />
            </div>

            <table className="min-w-full text-cyan-300 border-collapse font-mono">
              <thead>
                <tr className="bg-cyan-700 text-white">
                  <th className="border border-cyan-400 p-2">#</th>
                  <th className="border border-cyan-400 p-2">Name</th>
                  <th className="border border-cyan-400 p-2">
                    Master Agent ID
                  </th>
                  <th className="border border-cyan-400 p-2">Password</th>

                  <th colSpan={5} className="border border-cyan-400 p-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {masterAgents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-4 text-pink-400 font-bold"
                    >
                      No master agents found.
                    </td>
                  </tr>
                )}

                {filteredMasterAgents.map(
                  ({ masterAgentId, name, password }, i) => (
                    <tr
                      key={masterAgentId}
                      className="odd:bg-gray-800 even:bg-gray-900"
                    >
                      <td className="border border-cyan-400 p-2">{i + 1}</td>
                      <td className="relative border border-cyan-400 p-2">
                        {name}
                      </td>
                      <td className="border border-cyan-400 p-2">
                        {masterAgentId}
                      </td>
                      <td className="border border-cyan-400 p-2 ">
                        <span className="text-white px-4">
                          {visiblePasswords[masterAgentId]
                            ? password
                            : "********"}
                        </span>
                        <button onClick={() => toggleVisible(masterAgentId)}>
                          {visiblePasswords[masterAgentId] ? (
                            <EyeOff size={18} className="text-cyan-400" />
                          ) : (
                            <Eye size={18} className="text-cyan-400" />
                          )}
                        </button>
                      </td>

                      <td className="border border-cyan-400 p-2 space-x-2">
                        <button
                          onClick={() =>
                            handleEditClick({
                              masterAgentId,
                              name,
                              password,
                            })
                          }
                          className="px-3 py-1 rounded  text-cyan-400 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="border border-cyan-400 p-2 space-x-2">
                        <div className="relative inline-block">
                          <button
                            onClick={() => notes(masterAgentId)}
                            className="px-4 py-1 hover:bg-cyan-500 text-black font-bold rounded-full shadow-md transition"
                          >
                            📝
                          </button>

                          {entryCountsNotes[masterAgentId] > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                              {entryCountsNotes[masterAgentId]}
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
          className="text-2xl font-bold  text-cyan-400 mt-6"
        >
          ➕ Add New Master Agent
        </button>
        {modal && (
          <form
            onSubmit={handleAddMasterAgent}
            className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg max-w-md mb-10"
          >
            {/* masterAgent Info */}
            <input
              type="text"
              placeholder="Master Agent Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-black border border-cyan-400 text-cyan-300"
              disabled={adding}
            />
            <input
              type="text"
              placeholder="Master Agent ID"
              value={masterAgentId}
              onChange={(e) =>
                setMasterAgentId(e.target.value.replace(/\s/g, ""))
              }
              className="w-full mb-3 p-3 rounded bg-black border border-cyan-400 text-cyan-300"
              disabled={adding}
            />
            <input
              type="text"
              placeholder="Master Agent Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full mb-3 p-3 rounded bg-black border ${
                passwordValid ? "border-cyan-400" : "border-red-500"
              } text-cyan-300`}
              disabled={adding}
            />
            {!passwordValid && password.length > 0 && (
              <p className="text-red-500 text-sm mt-[-10px] mb-2">
                Must be at least 6 characters and include uppercase, lowercase,
                and a number
              </p>
            )}

            {/* Final Submit */}
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded transition"
            >
              {adding ? "Adding..." : "Add Master Agent"}
            </button>

            {error && <p className="mt-2 text-red-400">{error}</p>}
          </form>
        )}
      </section>

      {editingModal && editingMasterAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg text-white w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-cyan-400 text-center">
              Edit masterAgent: {editingMasterAgent.name}
            </h2>
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingModal(false);
                  setEditingMasterAgent(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateMasterAgent}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>
            {formError && (
              <p className="text-red-400 text-sm mb-3 text-center">
                {formError}
              </p>
            )}
            {/* masterAgent ID */}
            <div className="mb-3">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-cyan-400 rounded text-cyan-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm">Master Agent ID</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-cyan-400 rounded text-cyan-300"
                value={masterAgentId}
                onChange={(e) =>
                  setMasterAgentId(e.target.value.replace(/\s/g, ""))
                }
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
                  passwordValid ? "border-cyan-400" : "border-red-500"
                } text-cyan-300`}
                disabled={adding}
              />{" "}
              {!passwordValid && password.length > 0 && (
                <p className="text-red-500 text-sm mt-[-10px] mb-2">
                  Must be at least 6 characters and include uppercase,
                  lowercase, and a number
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center font-mono">
          <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-4 border-cyan-500 rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-extrabold text-cyan-300 mb-4 text-center">
              🃏 Master Agent Notes
            </h2>

            <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-cyan-400 scrollbar-track-transparent">
              {modalNotes.map((n, i) => (
                <div
                  key={i}
                  className="bg-white/10 p-3 rounded text-sm shadow-inner border-l-2 border-cyan-400 text-cyan-100 flex flex-col"
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
                  <div className="text-xs text-cyan-500 mt-1">
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
                className="flex-1 px-3 py-2 rounded bg-black text-cyan-200 border border-cyan-500 placeholder-cyan-500 focus:outline-none"
              />
              <button
                onClick={() => submitNote(noteId)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-red-500 to-pink-500 text-black font-bold rounded-full hover:scale-105 transition"
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
