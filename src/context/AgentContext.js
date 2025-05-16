// src/context/AgentContext.js (or wherever you keep this)
"use client";
import React, { createContext, useContext, useState } from "react";

const AgentContext = createContext();

export function AgentProvider({ children }) {
  const [agentId, setAgentId] = useState(null);
  const [loginError, setLoginError] = useState("");

  const login = async (agentIdInput, password) => {
    setLoginError(""); // clear previous error
    try {
      const res = await fetch("/api/agent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agentIdInput, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setLoginError(errorData.error || "Login failed");
        return false;
      }

      const data = await res.json();
      setAgentId(data.agentId); // store agentId on successful login
      return true;
    } catch (error) {
      setLoginError("Network error, please try again.");
      return false;
    }
  };

  const logout = () => {
    setAgentId(null);
    setLoginError("");
    // Optional: clear tokens/localStorage here
  };

  return (
    <AgentContext.Provider value={{ agentId, login, logout, loginError }}>
      {children}
    </AgentContext.Provider>
  );
}

export const useAgent = () => useContext(AgentContext);
