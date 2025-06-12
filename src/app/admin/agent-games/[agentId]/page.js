"use client";
import { usePathname, useParams } from "next/navigation";
import AgentGameSummaryAdmin from "@/components/AgentGameSummaryAdmin";
import { useState } from "react";

export default function AgentGames() {
  const { agentId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return <AgentGameSummaryAdmin agentId={agentId} className="w-full" />;
}
