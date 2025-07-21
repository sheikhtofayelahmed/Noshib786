"use client";
import React from "react";
import { FaFacebookSquare, FaYoutube, FaTelegram } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Footer() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitorCount() {
      const res = await fetch("/api/get-visits");
      const data = await res.json();
      const uniqueIps = new Set(data.visits.map((v) => v.ip));
      setCount(uniqueIps.size);
      setLoading(false);
    }
    fetchVisitorCount();
  }, []);
  return (
    <footer className="bg-gradient-to-r from-black via-purple-900 to-black text-white py-10 mt-20 shadow-inner shadow-purple-700/30">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center md:text-left">
        {/* Brand Info */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-300 font-mono tracking-wider drop-shadow-lg">
            🎲 Noshib 786
          </h2>
          <h2 className="text-3xl font-bold text-yellow-300 font-mono tracking-wider drop-shadow-lg">
            🎲 Visitors: {count}
          </h2>
        </div>

        {/* Contact Info */}
        <div className="text-purple-200 text-sm space-y-2">
          <h3 className="text-lg font-bold text-pink-400">📍 Location</h3>
          <p>Dhaka, Bangladesh</p>

          <h3 className="text-lg font-bold text-pink-400 mt-4">📞 Contact</h3>
          <p>
            Phone: <span className="text-yellow-300">+880-XXX-XXX-XXXX</span>
          </p>
          <p>
            Telegram: <span className="text-yellow-300">@noshib786</span>
          </p>
        </div>

        {/* Social Links */}
        {/* Social Links */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-pink-400">
            🔗 Connect With Us
          </h3>
          <div className="flex justify-center md:justify-start gap-5 text-2xl mt-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-white"
            >
              <FaFacebookSquare />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-white"
            >
              <FaYoutube />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-white"
            >
              <FaTelegram />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-purple-500">
        © {new Date().getFullYear()} Noshib 786 — All Rights Reserved.
      </div>
    </footer>
  );
}
