"use client";

import { useEffect, useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";
import AgentLayout from "@/components/AgentLayout";
import PlayerInput from "@/components/PlayerInput";
import AllahBhorosha from "@/components/Allah";

export default function AgentDashboard() {
  const { agentId, loading } = useAgent();
  const [agent, setAgent] = useState();
  const router = useRouter();

  // State for game status
  const [gameActive, setGameActive] = useState(null); // null = loading, false = inactive, true = active

  useEffect(() => {
    if (!loading && !agentId) {
      router.push("/agent/login");
    }
  }, [agentId, loading, router]);

  useEffect(() => {
    async function fetchGameStatus() {
      try {
        const res = await fetch("/api/game-status");
        if (!res.ok) throw new Error("Failed to fetch game status");

        const data = await res.json();

        const now = new Date();
        const targetTime = data.targetDateTime
          ? new Date(data.targetDateTime)
          : null;

        if (data.isGameOn && targetTime && now <= targetTime) {
          setGameActive(true);
        } else {
          setGameActive(false);
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
        setGameActive(false);
      }
    }

    fetchGameStatus();
  }, []);
  // Run after agent logs in

  if (loading || !agentId || gameActive === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <AgentLayout>
      {gameActive ? <PlayerInput /> : <AllahBhorosha></AllahBhorosha>}
    </AgentLayout>
  );
}
