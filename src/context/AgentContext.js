"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agentId, setAgentId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <AgentContext.Provider
      value={{ agentId, login, logout, loginError, loading }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
