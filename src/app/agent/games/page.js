"use client";
import AllahBhorosha from "@/components/Allah";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import GameSummaryAgent from "@/components/GameSummaryAgent";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <AllahBhorosha></AllahBhorosha>
      <GameSummaryAgent agentId={agentId}></GameSummaryAgent>
    </AgentProvider>
  );
};

export default Reports;
