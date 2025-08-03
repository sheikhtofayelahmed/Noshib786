"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const GamerContext = createContext();

export function GamerProvider({ children }) {
  const [gamerId, setGamerId] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryCount, setEntryCount] = useState(0);

  // Load session from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedGamerId = localStorage.getItem("gamerId");
    if (storedGamerId) setGamerId(storedGamerId);
    setLoading(false);
  }, []);

  // Login function
  async function login(gamerIdInput, password) {
    setLoginError(null);
    try {
      const res = await fetch("/api/gamer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamerId: gamerIdInput, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return false;
      }

      localStorage.setItem("gamerId", gamerIdInput);
      setGamerId(gamerIdInput);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Network error");
      return false;
    }
  }

  // Logout function
  function logout() {
    setGamerId(null);
    localStorage.removeItem("gamerId");
  }

  const fetchEntryCount = async (gamerId) => {
    try {
      const res = await fetch("/api/getVoucherQntByGamerId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamerId }),
      });
      if (!res.ok) throw new Error("Failed to fetch entry count");
      const data = await res.json();
      setEntryCount(data.count);
    } catch (err) {
      console.error("Entry count error:", err);
    }
  };


  // useEffect(() => {
  //   if (!gamerId) return;
  //   fetchEntryCount(gamerId);
  //   // fetchWaitingPlayers(gamerId);
  // }, [gamerId]);

  return (
    <GamerContext.Provider
      value={{
        gamerId,
        entryCount,
        // waitingEntryCount,
        login,
        logout,
        fetchEntryCount,
        // fetchWaitingPlayers,
        loginError,
        loading,
        loggedIn: !!gamerId,
      }}
    >
      {children}
    </GamerContext.Provider>
  );
}

export function useGamer() {
  return useContext(GamerContext);
}
