import "src/globals.css";
import { Html, Head, Main, NextScript } from "next/document";
import { AgentProvider } from "@/context/AgentContext";

export default function RootLayout({ children }) {
  return (
    <AgentProvider>
      <html lang="en">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <meta name="theme-color" content="#ff0000" />
        </Head>
        <body className="bg-black text-white">
          {children}
          <NextScript />
        </body>
      </html>
    </AgentProvider>
  );
}
