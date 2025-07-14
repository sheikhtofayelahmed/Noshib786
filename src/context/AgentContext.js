"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agentId, setAgentId] = useState(null);
  const [loginAs, setLoginAs] = useState("agent");
  const [subAgentId, setSubAgentId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);
  const [waitingEntryCount, setWaitingEntryCount] = useState(0);

  // Load session from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAgentId = localStorage.getItem("agentId");
    const storedLoginAs = localStorage.getItem("loginAs");
    const storedSubAgentId = localStorage.getItem("subAgentId");

    if (storedAgentId) setAgentId(storedAgentId);
    if (storedLoginAs) setLoginAs(storedLoginAs);
    if (storedSubAgentId) setSubAgentId(storedSubAgentId);

    setLoading(false);
  }, []);

  // Login function with support for subagent password
  async function login(
    inputAgentId,
    password,
    loginAsType = "agent",
    subId = null,
    subAgentPassword = ""
  ) {
    setLoginError(null);
    try {
      const res = await fetch("/api/agent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: inputAgentId,
          password,
          loginAs: loginAsType,
          subAgentId: subId,
          subAgentPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error || "Login failed");
        return false;
      }

      // Save to localStorage
      localStorage.setItem("agentId", inputAgentId);
      localStorage.setItem("loginAs", loginAsType);

      if (loginAsType === "subagent" && subId) {
        localStorage.setItem("subAgentId", subId);
        setSubAgentId(subId);
      } else {
        localStorage.removeItem("subAgentId");
        setSubAgentId(null);
      }

      setAgentId(inputAgentId);
      setLoginAs(loginAsType);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Network error");
      return false;
    }
  }

  // Logout function
  function logout() {
    setAgentId(null);
    setLoginAs("agent");
    setSubAgentId(null);
    localStorage.removeItem("agentId");
    localStorage.removeItem("loginAs");
    localStorage.removeItem("subAgentId");
  }

  // Fetch total voucher count
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

  // Fetch waiting voucher entries
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

  // Auto-fetch counts when agentId changes
  useEffect(() => {
    if (!agentId) return;
    fetchEntryCount(agentId);
    fetchWaitingPlayers(agentId);
  }, [agentId]);

  return (
    <AgentContext.Provider
      value={{
        agentId,
        loginAs,
        subAgentId,
        entryCount,
        waitingEntryCount,
        fetchEntryCount,
        fetchWaitingPlayers,
        login,
        logout,
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
