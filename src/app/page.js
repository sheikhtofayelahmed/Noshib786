"use client";

import { useEffect, useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";
import AgentLayout from "@/components/AgentLayout";
import PlayerInput from "@/components/PlayerInput";

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
  useEffect(() => {
    if (!agentId) return;

    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/getAgentById?agentId=${agentId}`);

        // Check status and log for debug
        if (!res.ok) {
          const text = await res.text();
          console.error("Response not OK:", res.status, text);
          throw new Error("Failed to fetch agent data");
        }

        const data = await res.json();
        setAgent(data.agent);
      } catch (error) {
        console.error("Error fetching agent:", error.message);
      }
    };

    fetchAgent();
  }, [agentId]);

  if (loading || !agentId || gameActive === null) {
    return null; // or loading spinner
  }

  return (
    <AgentLayout>
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">ID: {agentId}</h1>
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">
        Name: {agent?.name}
      </h1>

      {gameActive ? (
        <PlayerInput />
      ) : (
        <p>The game is currently not active. Please check back later.</p>
      )}
    </AgentLayout>
  );
}
