"use client";
import WaitingPlayerInput from "@/components/waitingData";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import { useEffect, useState } from "react";

const WaitingData = () => {
  const { agentId } = useAgent();
  return (
    <AgentProvider>
      <WaitingPlayerInput agentId={agentId}></WaitingPlayerInput>
    </AgentProvider>
  );
};

export default WaitingData;
