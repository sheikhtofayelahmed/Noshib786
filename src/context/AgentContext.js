// src/context/AgentContext.js
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const AgentContext = createContext();

export const useAgent = () => {
  return useContext(AgentContext);
};

export const AgentProvider = ({ children }) => {
  const [agentId, setAgentId] = useState(null);

  useEffect(() => {
    const savedAgentId = localStorage.getItem('agentId');
    if (savedAgentId) {
      setAgentId(savedAgentId);
    }
  }, []);

  const login = (id) => {
    setAgentId(id);
    localStorage.setItem('agentId', id);  // Save agentId in localStorage
  };

  const logout = () => {
    setAgentId(null);
    localStorage.removeItem('agentId');  // Remove agentId from localStorage
  };

  return (
    <AgentContext.Provider value={{ agentId, login, logout }}>
      {children}
    </AgentContext.Provider>
  );
};
