// app/layout.tsx or src/app/layout.tsx (depending on your structure)
"use client";

import "src/globals.css";
import { AgentProvider } from "@/context/AgentContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#ff0000" />
      </head>
      <body className="bg-black text-white">
        <AgentProvider>{children}</AgentProvider>
      </body>
    </html>
  );
}
