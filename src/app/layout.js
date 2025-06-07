"use client";
import { AgentProvider } from "@/context/AgentContext";
import "src/globals.css";
import { Hind_Siliguri } from "next/font/google";

const banglaFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <AgentProvider>
      <html lang="bn" className={banglaFont.variable}>
        <body className="bg-black text-white">{children}</body>
      </html>
    </AgentProvider>
  );
}
