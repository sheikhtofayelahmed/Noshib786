// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgent } from "@/context/AgentContext";

import AgentLayout from "@/components/AgentLayout";
import Win from "@/components/Win";
import PlayerInput from "@/components/PlayerInput";
import NumberChart from "@/components/NumberChart";

export default function DashboardPage() {
  const { agentId } = useAgent();
  const router = useRouter();
  const [isGameOn, setIsGameOn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentId) router.push("/agent/login");
  }, [agentId, router]);

  if (!agentId) return null;
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const res = await fetch("/api/game-status");
        const data = await res.json();
        setIsGameOn(data.isGameOn);
      } catch (error) {
        console.error("Failed to fetch game status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStatus();
  }, []);
  return (
    <AgentLayout>
      {!isGameOn ? <Win /> : <PlayerInput />}
      <NumberChart />
    </AgentLayout>
  );
}
