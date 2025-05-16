// app/dashboard/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgent } from "@/context/AgentContext";

import AgentLayout from "@/components/AgentLayout";
import Win from "@/components/Win";
import PlayerInput from "@/components/PlayerInput";
import NumberChart from "@/components/NumberChart";

export default function DashboardPage() {
  const { agentId } = useAgent();
  const router = useRouter();

  useEffect(() => {
    if (!agentId) router.push("/agent/login");
  }, [agentId, router]);

  if (!agentId) return null;

  return (
    <AgentLayout>
      <Win straightWin="456" singleWin="7" />
      <PlayerInput />
      <NumberChart />
    </AgentLayout>
  );
}
