"use client";
import GameSummary from "@/components/GameSummary";
import AllahBhorosha from "@/components/Allah";
import { AgentProvider, useAgent } from "@/context/AgentContext";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <AllahBhorosha></AllahBhorosha>
      <GameSummary agentId={agentId}></GameSummary>
    </AgentProvider>
  );
};

export default Reports;
