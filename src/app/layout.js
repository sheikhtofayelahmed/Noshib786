// src/app/layout.js
import 'src/globals.css';
import { AgentProvider } from 'src/context/AgentContext'; // Adjust path as necessary

export default function RootLayout({ children }) {
  return (
    <AgentProvider>
      <html lang="en">
        <body className="bg-black text-white">{children}</body>
      </html>
    </AgentProvider>
  );
}
