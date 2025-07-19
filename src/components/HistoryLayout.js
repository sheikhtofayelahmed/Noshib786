"use client";
import Breadcrumb from "./Breadcrumb"; // adjust path if needed
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* HEADER (if any) */}

      <main className="flex-1 pt-6">
        <Breadcrumb />
        {children}
      </main>

      <Footer />
    </div>
  );
}
