"use client";

import { useEffect, useState } from "react";
import { useAgent } from "@/context/AgentContext";
import { useRouter } from "next/navigation";
import PlayerInput from "@/components/PlayerInput";
import AllahBhorosha from "@/components/Allah";
import PlayerInputModal from "@/components/PlayerInputModal";
import { ReceiptText } from "lucide-react";

export default function AgentDashboard() {
  const { agentId, loading } = useAgent();
  const [inputModal, setInputModal] = useState(false);
  const [doubleInput, setDoubleInput] = useState(false);
  const router = useRouter();

  // State for game status
  const [gameActive, setGameActive] = useState(null); // null = loading, false = inactive, true = active

  useEffect(() => {
    if (!loading && !agentId) {
      router.push("/player/login");
    }
  }, [agentId, loading, router]);

  useEffect(() => {
    async function fetchGameStatus() {
      try {
        const res = await fetch("/api/game-status");
        if (!res.ok) throw new Error("Failed to fetch game status");

        const data = await res.json();

        const now = new Date();
        const targetTime = data.targetDateTime
          ? new Date(data.targetDateTime)
          : null;

        if (data.isGameOn && targetTime && now <= targetTime) {
          setGameActive(true);
        } else {
          setGameActive(false);
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
        setGameActive(false);
      }
    }

    fetchGameStatus();
  }, []);
  // Run after agent logs in

  if (loading || !agentId || gameActive === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setInputModal(true)}
        className="my-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        New Input <ReceiptText />
      </button>
      <label
        className={`my-2 inline-flex items-center gap-2 px-3 py-2  bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer ${
          doubleInput ? "ring-2 ring-black" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={doubleInput}
          onChange={() => setDoubleInput(!doubleInput)}
          className="form-checkbox h-4 w-4 text-yellow-700 rounded focus:ring-0"
        />
        Double Input <ReceiptText />
      </label>
      {gameActive ? (
        <PlayerInput
          doubleInput={doubleInput}
          setDoubleInput={setDoubleInput}
        />
      ) : (
        <AllahBhorosha></AllahBhorosha>
      )}
      {gameActive && inputModal && (
        <PlayerInputModal onClose={() => setInputModal(false)} />
      )}
    </>
  );
}
