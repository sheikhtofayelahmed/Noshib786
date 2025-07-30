"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agentId, setAgentId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);
  const [waitingEntryCount, setWaitingEntryCount] = useState(0);

  // Load session from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAgentId = localStorage.getItem("agentId");
    if (storedAgentId) setAgentId(storedAgentId);
    setLoading(false);
  }, []);

  // Login function
  async function login(agentIdInput, password) {
    setLoginError(null);
    try {
      const res = await fetch("/api/agent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agentIdInput, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return false;
      }

      localStorage.setItem("agentId", agentIdInput);
      setAgentId(agentIdInput);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Network error");
      return false;
    }
  }

  // Logout function
  function logout() {
    setAgentId(null);
    localStorage.removeItem("agentId");
  }

  const fetchEntryCount = async (agentId) => {
    try {
      const res = await fetch("/api/getVoucherQntByAgentId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) throw new Error("Failed to fetch entry count");
      const data = await res.json();
      setEntryCount(data.count);
    } catch (err) {
      console.error("Entry count error:", err);
    }
  };

  const fetchWaitingPlayers = async (agentId) => {
    try {
      const res = await fetch("/api/getWaitingPlayersByAgentId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!res.ok) throw new Error("Failed to fetch waiting players");
      const data = await res.json();
      setWaitingEntryCount(data.players.length);
    } catch (err) {
      console.error("Waiting players error:", err);
    }
  };

  useEffect(() => {
    if (!agentId) return;
    fetchEntryCount(agentId);
    fetchWaitingPlayers(agentId);
  }, [agentId]);

  return (
    <AgentContext.Provider
      value={{
        agentId,
        entryCount,
        waitingEntryCount,
        login,
        logout,
        fetchEntryCount,
        fetchWaitingPlayers,
        loginError,
        loading,
        loggedIn: !!agentId,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
