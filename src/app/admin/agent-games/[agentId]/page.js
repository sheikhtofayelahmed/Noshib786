"use client";
import { useParams } from "next/navigation";
import AgentGameSummaryAdmin from "@/components/AgentGameSummaryAdmin";

export default function AgentGames() {
  const { agentId } = useParams();

  return <AgentGameSummaryAdmin agentId={agentId} className="w-full" />;
}
