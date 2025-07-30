"use client";

import { createContext, useContext, useEffect, useState } from "react";

const MasterAgentContext = createContext();

export const MasterAgentProvider = ({ children }) => {
  const [masterAgentId, setMasterAgentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read masterAgentId from cookie on mount
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key.trim()] = value;
      return acc;
    }, {});

    setMasterAgentId(cookies.masterAgentId || null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const onLoginPage = window.location.pathname === "/masterAgent/login";
    if (!masterAgentId && !onLoginPage) {
      window.location.href = "/masterAgent/login";
    }
  }, [isLoading, masterAgentId]);

  return (
    <MasterAgentContext.Provider value={{ masterAgentId, setMasterAgentId }}>
      {isLoading ? null : children}
    </MasterAgentContext.Provider>
  );
};

export const useMasterAgent = () => useContext(MasterAgentContext);
