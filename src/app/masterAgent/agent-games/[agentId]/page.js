"use client";
import { useParams } from "next/navigation";

import GameSummary from "@/components/GameSummary";

export default function AgentGames() {
  const { agentId } = useParams();

  return <GameSummary agentId={agentId} className="w-full" />;
}
