// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgent } from "@/context/AgentContext";

import AgentLayout from "@/components/AgentLayout";
import PlayerInput from "@/components/PlayerInput";

export default function DashboardPage() {
  const { agentId } = useAgent();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentId) router.push("/agent/login");
  }, [agentId, router]);

  if (!agentId) return null;

  return (
    <AgentLayout>
      <PlayerInput />
    </AgentLayout>
  );
}
