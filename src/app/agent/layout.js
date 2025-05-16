// src/app/agent/layout.js
"use client";

import { usePathname } from "next/navigation";
import AgentLayout from "@/components/AgentLayout";

export default function AgentRootLayout({ children }) {
  const pathname = usePathname();

  // If it's the login page, skip the sidebar layout
  const isLoginPage = pathname === "/agent/login";

  if (isLoginPage) return <>{children}</>;

  return <AgentLayout>{children}</AgentLayout>;
}
