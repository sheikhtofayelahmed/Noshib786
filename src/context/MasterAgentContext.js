"use client";

import { createContext, useContext, useEffect, useState } from "react";

const MasterAgentContext = createContext();

export const MasterAgentProvider = ({ children }) => {
  const [masterAgentId, setMasterAgentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 👈 Important to avoid early redirect

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const id = cookies.masterAgentId || null;
    setMasterAgentId(id);
    setIsLoading(false); // ✅ Done loading cookies
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const onLoginPage = window.location.pathname === "/masterAgent/login";

    if (!masterAgentId && !onLoginPage) {
      window.location.href = "/masterAgent/login";
    }
  }, [isLoading, masterAgentId]);

  return (
    <MasterAgentContext.Provider value={{ masterAgentId }}>
      {isLoading ? null : children}
    </MasterAgentContext.Provider>
  );
};

export const useMasterAgent = () => useContext(MasterAgentContext);
