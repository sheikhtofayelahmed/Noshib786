"use client";
import AgentGameSummary from "@/components/AgentGameSummary";
import { AgentProvider, useAgent } from "@/context/AgentContext";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <AgentGameSummary agentId={agentId}></AgentGameSummary>
    </AgentProvider>
  );
};

export default Reports;
