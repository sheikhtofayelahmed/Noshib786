"use client";
import PlayerAccountSummary from "@/components/PlayerAccountSummary";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import { useEffect, useState } from "react";

const Reports = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <PlayerAccountSummary
        agentId={agentId}
        print={false}
      ></PlayerAccountSummary>
    </AgentProvider>
  );
};

export default Reports;
