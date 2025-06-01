"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAgentPage() {
  const router = useRouter();

  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState("");

  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const [percentages, setPercentages] = useState({
    threeD: 0,
    twoD: 0,
    oneD: 0,
    str: 0,
    rumble: 0,
    down: 0,
    single: 0,
  });
  const [editingAgent, setEditingAgent] = useState(null);
  const [showPercentageModal, setShowPercentageModal] = useState(false);

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
    setPercentages(
      agent.percentage || {
        threeD: 0,
        twoD: 0,
        oneD: 0,
        str: 0,
        rumble: 0,
        down: 0,
        single: 0,
      }
    );
    setShowPercentageModal(true);
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!agentId || !password || !name) {
      setError("Please fill all fields");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/addAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, password, name }),
      });
      const data = await res.json();

      if (res.ok) {
        await fetchAgents();
        setAgentId("");
        setPassword("");
        setName("");
      } else {
        setError(data.message || "Failed to add agent");
      }
    } catch {
      setError("Failed to add agent");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (agentId, currentActive) => {
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

  const savePercentages = async () => {
    setError("");
    try {
      const res = await fetch("/api/updateAgentPercentages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: editingAgent.agentId,
          percentage: percentages,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Percentages updated successfully!");
        setShowPercentageModal(false);
        setEditingAgent(null);
        fetchAgents(); // Refresh the list
      } else {
        setError(data.message || "Failed to update percentages");
      }
    } catch (err) {
      console.error("Error updating percentages:", err);
      setError("Failed to update percentages");
    }
  };

  return (
    <div className="p-6 text-white font-mono bg-gradient-to-br from-black to-red-900 min-h-screen">
      <h1 className="text-4xl mb-6 text-yellow-400 font-bold">
        🎰 Admin Agent Management
      </h1>

      {/* Add Agent Form */}
      <form
        onSubmit={handleAddAgent}
        className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg max-w-md mb-10"
      >
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          ➕ Add New Agent
        </h2>
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
          onChange={(e) => setAgentId(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-black border border-yellow-400 text-yellow-300"
          disabled={adding}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-black border border-yellow-400 text-yellow-300"
          disabled={adding}
        />

        <button
          type="submit"
          disabled={adding}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded transition"
        >
          {adding ? "Adding..." : "Add Agent"}
        </button>
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </form>

      {/* Agent List */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          🧑‍💼 Agents List
        </h2>
        {loadingAgents ? (
          <p className="text-yellow-300">Loading agents...</p>
        ) : (
          <table className="w-full text-yellow-300 border-collapse font-mono">
            <thead>
              <tr className="bg-yellow-700 text-white">
                <th className="border border-yellow-400 p-2">Agent ID</th>
                <th className="border border-yellow-400 p-2">Name</th>
                <th className="border border-yellow-400 p-2">Password</th>
                <th className="border border-yellow-400 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-4 text-pink-400 font-bold"
                  >
                    No agents found.
                  </td>
                </tr>
              )}
              {agents.map(({ agentId, name, password, active, percentage }) => (
                <tr key={agentId} className="odd:bg-gray-800 even:bg-gray-900">
                  <td className="border border-yellow-400 p-2">{agentId}</td>
                  <td className="border border-yellow-400 p-2">{name}</td>
                  <td className="border border-yellow-400 p-2">{password}</td>

                  <td className="border border-yellow-400 p-2 space-x-2">
                    {/* <button
                      onClick={() => router.push(`/agent-accounts/${agentId}`)}
                      className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      💰
                    </button> */}
                    <button
                      onClick={() =>
                        router.push(`/admin/agent-games/${agentId}`)
                      }
                      className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      🎰
                    </button>
                    <button
                      onClick={() =>
                        handleEditClick({ agentId, name, percentage })
                      }
                      className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      %
                    </button>
                    <button
                      onClick={() => toggleActive(agentId, active)}
                      className={`px-3 py-1 rounded ${
                        active
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-semibold`}
                    >
                      {active && "🗑️"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Percentage Edit Modal */}
      {showPercentageModal && editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg text-white w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">
              Edit Percentages for {editingAgent.name}
            </h2>

            {Object.entries(percentages).map(([key, value]) => (
              <div key={key} className="mb-3">
                <label className="block capitalize text-sm">{key}</label>
                <input
                  type="number"
                  className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                  value={value}
                  onChange={(e) =>
                    setPercentages((prev) => ({
                      ...prev,
                      [key]: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            ))}

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowPercentageModal(false);
                  setEditingAgent(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={savePercentages}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
