"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agentId, setAgentId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);
  const [waitingEntryCount, setWaitingEntryCount] = useState(0);

  // On mount, load agentId from localStorage if exists
  useEffect(() => {
    const storedAgentId = localStorage.getItem("agentId");
    if (storedAgentId) {
      setAgentId(storedAgentId);
    }
    setLoading(false);
  }, []);

  // Login function
  async function login(inputAgentId, password) {
    setLoginError(null);
    // Call your login API here - example:
    try {
      const res = await fetch("/api/agent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: inputAgentId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.message || "Login failed");
        return false;
      }

      // Login success
      setAgentId(inputAgentId);
      localStorage.setItem("agentId", inputAgentId);
      return true;
    } catch (error) {
      setLoginError("Network error");
      return false;
    }
  }

  // Logout function
  function logout() {
    setAgentId(null);
    localStorage.removeItem("agentId");
    // Optionally redirect or handle post logout steps
  }
  const fetchEntryCount = async (agentId) => {
    try {
      const res = await fetch("/api/getVoucherQntByAgentId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch entry count");
      }

      const data = await res.json();
      setEntryCount(data.count);
    } catch (err) {
      console.error("Error fetching entry count:", err);
      setErrorCount(err.message);
    }
  };
  const fetchWaitingPlayers = async (agentId) => {
    if (!agentId) {
      setError("Agent ID is missing. Cannot fetch waiting players.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch data from your new API endpoint
      const response = await fetch(
        `/api/getWaitingPlayersByAgentId`, // No query params in URL
        {
          method: "POST", // Specify POST method
          headers: {
            "Content-Type": "application/json", // Tell server we're sending JSON
          },
          body: JSON.stringify({ agentId }), // Send agentId in the request body as JSON
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch waiting players: ${response.statusText}`
        );
      }

      const data = await response.json();
      setWaitingEntryCount(data.players.length);
      // ...
    } catch (e) {
      console.error("Error fetching waiting players:", e);
      setError(
        e.message || "Failed to load waiting players. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!agentId) return;

    if (agentId) {
      fetchEntryCount(agentId);

      fetchWaitingPlayers(agentId);
    }
  }, [agentId]);

  return (
    <AgentContext.Provider
      value={{
        agentId,
        entryCount,
        fetchEntryCount,
        waitingEntryCount,
        fetchWaitingPlayers,
        login,
        logout,
        loginError,
        loading,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
