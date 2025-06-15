"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
export default function AdminAgentPage() {
  const router = useRouter();
  const [onlineAgentIds, setOnlineAgentIds] = useState(new Set());
  const [subAgents, setSubAgents] = useState(Array(10).fill("")); // Up to 10 sub-agents
  const [subUpdateAgents, setSubUpdateAgents] = useState(Array(10).fill("")); // Up to 10 sub-agents
  const [expense, setExpense] = useState(false);
  const [updateExpense, setUpdateExpense] = useState(false);
  const [tenPercent, setTenPercent] = useState(false);
  const [updateTenPercent, setUpdateTenPercent] = useState(false);

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
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [entryCounts, setEntryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [iPercentages, setIPercentages] = useState({
    threeD: 40,
    twoD: 30,
    oneD: 0,
    str: 400,
    rumble: 80,
    down: 60,
    single: 3,
  });
  const [cPercentages, setCPercentages] = useState({
    threeD: 40,
    twoD: 30,
    oneD: 0,
  });
  const [cUpdatePercentages, setCUpdatePercentages] = useState({
    threeD: 40,
    twoD: 30,
    oneD: 0,
  });
  const [formError, setFormError] = useState("");

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
  const [editingModal, setEditingModal] = useState(false);
  const [modal, setModal] = useState(false);
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
    console.log(agent, "handle edit check");
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
      }
    );
    setSubUpdateAgents(
      Array(10)
        .fill("")
        .map((_, i) => agent.subAgents?.[i] || "")
    );
    setUpdateExpense(agent.expense);
    setUpdateTenPercent(agent.tenPercent);
    setEditingModal(true);
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    console.log(expense, tenPercent);
    if (!agentId || !password || !name || !iPercentages || !cPercentages) {
      setError("Please fill all fields");
      return;
    }

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/addAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          password,
          name,
          percentages: iPercentages,
          cPercentages: cPercentages,
          subAgents: subAgents.filter((n) => n.trim() !== ""),
          expense: expense,
          tenPercent: tenPercent,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        await fetchAgents();
        setAgentId("");
        setPassword("");
        setName("");
        alert("saved");
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
          subAgents: subUpdateAgents.filter((n) => n.trim() !== ""),
          percentages: percentages,
          cPercentages: cUpdatePercentages,
          expense: updateExpense,
          tenPercent: updateTenPercent,
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
  return (
    <div className="p-6 text-white font-mono bg-gradient-to-br from-black to-red-900 min-h-screen">
      {/* <h1 className="text-4xl mb-6 text-yellow-400 font-bold">
        🎰 Admin Agent Management
      </h1> */}

      {/* Add Agent Form */}

      {/* Agent List */}
      <section className="w-full max-w-full">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          🧑‍💼 Agents List
        </h2>
        {loadingAgents ? (
          <p className="text-yellow-300">Loading agents...</p>
        ) : (
          <div className="overflow-x-auto text-center">
            <table className="min-w-full text-yellow-300 border-collapse font-mono">
              <thead>
                <tr className="bg-yellow-700 text-white">
                  <th className="border border-yellow-400 p-2">#</th>
                  <th className="border border-yellow-400 p-2">Name</th>
                  <th className="border border-yellow-400 p-2">Agent ID</th>
                  <th className="border border-yellow-400 p-2">Password</th>
                  <th className="border border-yellow-400 p-2">Status</th>
                  <th className="border border-yellow-400 p-2">Voucher</th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    <span>ব্যাংকার - এজেন্ট </span>
                  </th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    <span> এজেন্ট - কাস্টমার</span>
                  </th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    সুবিধা
                  </th>
                  <th className="font-bangla border border-yellow-400 p-2">
                    Sub Agent
                  </th>
                  <th colSpan={3} className="border border-yellow-400 p-2">
                    Actions
                  </th>
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
                {agents.map(
                  (
                    {
                      agentId,
                      name,
                      password,
                      active,
                      percentages,
                      cPercentages,
                      subAgents,
                      expense,
                      tenPercent,
                      hasSubAgents,
                    },
                    i
                  ) => (
                    <tr
                      key={agentId}
                      className="odd:bg-gray-800 even:bg-gray-900"
                    >
                      <td className="border border-yellow-400 p-2">{i + 1}</td>
                      <td className="border border-yellow-400 p-2">{name}</td>
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
                      <td className="border border-yellow-400 px-3 py-2">
                        {onlineAgentIds.has(agentId) ? (
                          <div className="space-x-1">
                            <span className="inline-block align-middle w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="inline-block align-middle">
                              On
                            </span>
                          </div>
                        ) : (
                          <div className="space-x-1">
                            <span className="inline-block align-middle w-3 h-3 rounded-full bg-gray-400"></span>
                            <span className="inline-block align-middle">
                              Off
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2 text-green-400">
                        {entryCounts[agentId] !== undefined
                          ? entryCounts[agentId]
                          : "Loading..."}
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2 ">
                        <span className="text-green-400">
                          {Object.values(percentages ?? {}).length > 0
                            ? Object.values(percentages).join(", ")
                            : "—"}
                        </span>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2 ">
                        <span className="text-red-400">
                          {Object.values(cPercentages ?? {}).length > 0
                            ? Object.values(cPercentages).join(", ")
                            : "—"}
                        </span>
                      </td>
                      <td className=" border font-bangla border-yellow-400 text-sm">
                        <label className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={expense}
                            onChange={(e) => setExpense(e.target.checked)}
                            disabled={adding}
                            className="accent-yellow-500"
                          />
                          <span>খরচ</span>
                        </label>
                        <label className="flex items-center space-x-2 text-white">
                          <input
                            type="checkbox"
                            checked={tenPercent}
                            onChange={(e) => setTenPercent(e.target.checked)}
                            disabled={adding}
                            className="accent-yellow-500"
                          />
                          <span>আন্ডার 10%</span>
                        </label>
                      </td>
                      <td className="border border-yellow-400 p-2 text-center">
                        {hasSubAgents ? (
                          <span className="text-green-400 text-xl">✔️</span>
                        ) : (
                          <span className="text-red-500 text-xl">❌</span>
                        )}
                      </td>

                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/agent-games/${agentId}`)
                          }
                          className="px-3 py-1 rounded  text-black font-semibold"
                        >
                          🎰
                        </button>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() =>
                            handleEditClick({
                              agentId,
                              name,
                              password,
                              percentages,
                              cPercentages,
                              subAgents,
                              expense,
                              tenPercent,
                            })
                          }
                          className="px-3 py-1 rounded  text-yellow-400 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="border border-yellow-400 p-2 space-x-2">
                        <button
                          onClick={() => toggleActive(agentId, active)}
                          className={`px-3 py-1 rounded  
                          } text-red-500 font-semibold`}
                        >
                          {active && "Inactive"}
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
            <div className="mb-4">
              <label className=" font-bangla block text-yellow-400 text-lg mt-5">
                সাব এজেন্ট
              </label>
              {subAgents.map((subAgent, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Sub Agent ${index + 1}`}
                  value={subAgent}
                  onChange={(e) => {
                    const updated = [...subAgents];
                    updated[index] = e.target.value;
                    setSubAgents(updated);
                  }}
                  className="w-full mb-2 p-3 rounded bg-black border border-yellow-400 text-yellow-300 placeholder-yellow-600"
                  disabled={adding}
                />
              ))}
            </div>
            <div className="mb-4">
              <label className="font-banla block text-yellow-400 text-lg mt-5">
                এজেন্ট - ব্যাংকার %
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
            <div className="mb-4">
              <label className="font-bangla block text-yellow-400 text-lg mt-5">
                এজেন্ট - কাস্টমার %
              </label>
              {Object.entries(cPercentages).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <label className="block capitalize text-sm text-yellow-400 mb-1">
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
                    className="w-full p-3 rounded bg-black border border-yellow-400 text-yellow-300 placeholder-yellow-600"
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
            <h2 className="text-xl font-bold mb-4 text-yellow-400">
              Edit Agent: {editingAgent.name}
            </h2>
            {formError && (
              <p className="text-red-400 text-sm mb-3 text-center">
                {formError}
              </p>
            )}

            {/* Agent ID */}
            <div className="mb-3">
              <label className="block text-sm">Agent ID</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />
            </div>

            {/* Name */}
            <div className="mb-3">
              <label className="block text-sm">Name</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm">Password</label>
              <input
                type="text"
                className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Percentages */}
            <div className="mb-3 mt-4">
              <h3 className="text-yellow-400 font-semibold mb-2">Sub Agents</h3>
              {subUpdateAgents.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Sub Agent ${index + 1}`}
                  className="w-full mb-2 p-2 bg-black border border-yellow-400 rounded text-yellow-300 placeholder-yellow-600"
                  value={value}
                  onChange={(e) => {
                    const updated = [...subUpdateAgents];
                    updated[index] = e.target.value;
                    setSubUpdateAgents(updated);
                  }}
                />
              ))}
            </div>

            <div className="mb-3 mt-4">
              <h3 className="text-yellow-400 font-semibold mb-2">
                Percentages
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
              <h3 className="text-yellow-400 font-semibold mb-2">
                Percentages
              </h3>
              {Object.entries(cUpdatePercentages).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block capitalize text-sm">{key}</label>
                  <input
                    type="number"
                    className="w-full p-2 bg-black border border-yellow-400 rounded text-yellow-300"
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

            <div className="flex justify-end space-x-2 mt-4">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
