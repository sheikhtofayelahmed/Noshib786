"use client";
import { useGamer } from "@/context/GamerContext";
import { useState, useEffect } from "react";

export default function TrxnPage() {
  const [trxnNumber, setTrxnNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bkash");
  const { gamerId } = useGamer();
  const [submitted, setSubmitted] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch(`/api/trxn?gamerId=${gamerId}`);
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, [gamerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/trxn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trxnNumber, amount, method, gamerId }),
    });

    if (res.ok) {
      setTrxnNumber("");
      setAmount("");
      setMethod("Bkash");
      setSubmitted(!submitted);
      fetchTransactions();
    }
  };

  return (
    <div className="min-h-screen  text-gray-800 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-pink-300">
        <h1 className="text-3xl font-bold text-center text-pink-600 drop-shadow-sm mb-6">
          🎲 Submit Your Transaction
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="🎟️ Transaction Number"
            className="w-full p-3 bg-pink-50 border border-pink-300 text-gray-800 rounded-md focus:ring-2 focus:ring-pink-400"
            value={trxnNumber}
            onChange={(e) => setTrxnNumber(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="💰 Amount"
            className="w-full p-3 bg-pink-50 border border-pink-300 text-gray-800 rounded-md focus:ring-2 focus:ring-pink-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            className="w-full p-3 bg-pink-50 border border-pink-300 text-gray-800 rounded-md focus:ring-2 focus:ring-pink-400"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          >
            <option value="Bkash">📱 Bkash</option>
            <option value="Nagad">💸 Nagad</option>
            <option value="Rocket">🚀 Rocket</option>
            <option value="Upay">🪙 Bank</option>
          </select>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white font-bold py-2 rounded-md shadow-md hover:bg-pink-600 transition"
          >
            💾 Submit Transaction
          </button>
        </form>

        <h2 className="text-2xl mt-10 mb-4 border-b border-pink-300 pb-2 text-pink-600">
          📜 Your History
        </h2>

        <ul className="space-y-3 max-h-[300px] overflow-y-auto">
          {transactions.map((trxn) => (
            <li
              key={trxn._id}
              className="bg-pink-50 border border-pink-200 rounded p-3"
            >
              <div className="text-pink-600 font-semibold">
                🎟️ {trxn.trxnNumber}
              </div>
              <div className="text-pink-700">💰 {trxn.amount}</div>
              <div className="text-sm text-gray-600">💳 {trxn.method}</div>
              <div className="text-sm text-gray-500">
                📅 {new Date(trxn.date).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
