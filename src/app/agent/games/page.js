"use client";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import GameSummary from "@/components/GameSummary";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <GameSummary agentId={agentId}></GameSummary>
    </AgentProvider>
  );
};

export default Reports;
