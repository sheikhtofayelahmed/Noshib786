"use client";

import { useEffect, useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";
import AgentLayout from "@/components/AgentLayout";
import PlayerInput from "@/components/PlayerInput";

export default function AgentDashboard() {
  const { agentId, loading } = useAgent();
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

  if (loading || !agentId || gameActive === null) {
    return null; // or loading spinner
  }

  return (
    <AgentLayout>
      {gameActive ? (
        <PlayerInput />
      ) : (
        <p>The game is currently not active. Please check back later.</p>
      )}
    </AgentLayout>
  );
}
