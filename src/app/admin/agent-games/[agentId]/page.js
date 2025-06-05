"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import PlayerAccountSummary from "@/components/PlayerAccountSummary";

export default function AgentGames() {
  const { agentId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logoutAdmin = () => {
    document.cookie = "admin-auth=; Max-Age=0; path=/";
    localStorage.removeItem("admin-auth");
    window.location.href = "/admin/login";
  };

  return (
    <PlayerAccountSummary agentId={agentId} print={true} className="w-full" />
  );
}
