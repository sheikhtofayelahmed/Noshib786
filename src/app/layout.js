"use client";
import { AgentProvider } from "@/context/AgentContext";
import "src/globals.css";

export default function RootLayout({ children }) {
  return (
    <AgentProvider>
      <html lang="en">
        <body className="bg-black text-white">{children}</body>
      </html>
    </AgentProvider>
  );
}
