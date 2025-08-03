// src/app/agent/layout.js
"use client";

import HistoryLayout from "@/components/HistoryLayout";

export default function AgentRootLayout({ children }) {
  return <HistoryLayout>{children}</HistoryLayout>;
}
