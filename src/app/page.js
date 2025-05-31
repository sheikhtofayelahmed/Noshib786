"use client";

import { useEffect } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";
import AgentLayout from "@/components/AgentLayout";
import PlayerInput from "@/components/PlayerInput";

export default function AgentDashboard() {
  const { agentId, loading } = useAgent();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !agentId) {
      router.push("/agent/login");
    }
  }, [agentId, loading, router]);

  if (loading || !agentId) {
    return null; // or a spinner if you want
  }

  return (
    <AgentLayout>
      <PlayerInput />
    </AgentLayout>
  );
}
