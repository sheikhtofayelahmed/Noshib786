"use client";

import { useEffect, useState } from "react";

export default function InactiveAgentPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all inactive agents from your existing API
  const fetchInactiveAgents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/getInactiveAgents");
      const data = await res.json();
      if (res.ok) {
        setAgents(data.agents);
      } else {
        setError(data.message || "Failed to load agents");
      }
    } catch (err) {
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveAgents();
  }, []);

  // Use your existing toggle API to reactivate
  const reactivateAgent = async (agentId) => {
    try {
      const res = await fetch("/api/toggleAgentActive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, active: true }),
      });
      const data = await res.json();

      if (res.ok) {
        // Remove the agent from the inactive list after reactivation
        setAgents(agents.filter((agent) => agent.agentId !== agentId));
      } else {
        alert(data.message || "Failed to reactivate agent");
      }
    } catch (error) {
      alert("Failed to reactivate agent");
    }
  };
  const deleteAgent = async (agentId) => {
    const confirmation = prompt(
      `Type "delete" to confirm removing agent with ID: ${agentId}`
    );

    if (confirmation !== "delete") {
      alert("Deletion cancelled.");
      return;
    }
    const res = await fetch("/api/deleteAgent", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Error: ${data.message}`);
    } else {
      alert(data.message);
      fetchInactiveAgents();
      // Optionally refresh agents list here
    }
  };

  return (
    <div className="p-4 text-white font-mono">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Inactive Agents
      </h1>

      {loading && <p className="text-yellow-300">Loading agents...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && agents.length === 0 && (
        <p className="text-pink-400 text-xl">No inactive agents found.</p>
      )}

      {!loading && agents.length > 0 && (
        <table className="w-full text-yellow-300 border-collapse font-mono text-sm">
          <thead>
            <tr className="bg-yellow-600 text-white">
              <th className="border px-3 py-2">Agent ID</th>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Password</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="odd:bg-gray-800 even:bg-gray-900">
                <td className="border px-3 py-2">{agent.agentId}</td>
                <td className="border px-3 py-2">{agent.name}</td>
                <td className="border px-3 py-2">{agent.password}</td>
                <td className="border px-3 py-2">
                  <button
                    onClick={() => reactivateAgent(agent.agentId)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white mx-3"
                  >
                    Reactivate
                  </button>
                  <button
                    onClick={() => deleteAgent(agent.agentId)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white mx-3"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
