"use client";
import AgentGameSummary from "@/components/AgentGameSummary";
import AllahBhorosha from "@/components/Allah";
import { AgentProvider, useAgent } from "@/context/AgentContext";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <AllahBhorosha></AllahBhorosha>
      <AgentGameSummary agentId={agentId}></AgentGameSummary>
    </AgentProvider>
  );
};

export default Reports;
