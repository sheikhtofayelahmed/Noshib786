"use client";

import { useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";

export default function AgentLogin() {
  const [agentIdInput, setAgentIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [hasSubAgents, setHasSubAgents] = useState(false);
  const [subAgents, setSubAgents] = useState([]);
  const [loginAs, setLoginAs] = useState(null); // "agent" or "subagent"
  const [selectedSubAgent, setSelectedSubAgent] = useState("");
  const [step, setStep] = useState(1); // control login step

  const { login, loginError } = useAgent();
  const router = useRouter();

  async function checkAgentHasSubAgents() {
    if (!agentIdInput) return;

    const res = await fetch(
      `/api/getAgentById?agentId=${encodeURIComponent(agentIdInput)}`
    );

    if (!res.ok) {
      alert("Agent not found");
      return;
    }

    const data = await res.json();

    setHasSubAgents(data.agent.hasSubAgents);
    setSubAgents(data.agent.subAgents || []);

    if (data.agent.hasSubAgents) {
      setStep(2);
    } else {
      setLoginAs("agent");
      setStep(3);
    }
  }

  async function handleLogin() {
    if (!agentIdInput || !password) return;
    if (loginAs === "subagent" && !selectedSubAgent) {
      alert("Please select a sub-agent");
      return;
    }

    // Call your login method with extra params
    const success = await login(
      agentIdInput,
      password,
      loginAs,
      selectedSubAgent
    );
    if (success) {
      router.push("/"); // redirect on success
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-gray-900 p-6 rounded shadow-lg border border-yellow-500 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4 font-mono">
          🎯 Agent Login
        </h1>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Agent ID"
              value={agentIdInput}
              onChange={(e) => setAgentIdInput(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
              autoComplete="username"
            />
            <button
              onClick={checkAgentHasSubAgents}
              disabled={!agentIdInput}
              className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4">Login as:</p>
            <button
              onClick={() => {
                setLoginAs("agent");
                setStep(3);
              }}
              className="w-full bg-yellow-500 text-black py-2 rounded mb-2 hover:bg-yellow-600 font-bold"
            >
              Agent
            </button>
            <button
              onClick={() => {
                setLoginAs("subagent");
                setStep(3);
              }}
              className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold"
            >
              Sub-Agent
            </button>
          </>
        )}

        {step === 3 && (
          <>
            {loginAs === "subagent" && (
              <select
                value={selectedSubAgent}
                onChange={(e) => setSelectedSubAgent(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
              >
                <option value="">Select Sub-Agent</option>
                {subAgents.map((sa) => (
                  <option key={sa} value={sa}>
                    {sa}
                  </option>
                ))}
              </select>
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-gray-800 border border-yellow-300 text-yellow-200 focus:outline-none"
              autoComplete="current-password"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 font-bold disabled:opacity-50"
              disabled={
                !password || (loginAs === "subagent" && !selectedSubAgent)
              }
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
