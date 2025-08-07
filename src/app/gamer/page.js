"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlayerInput from "@/components/PlayerInput";
import AllahBhorosha from "@/components/Allah";
import PlayerInputModal from "@/components/PlayerInputModal";
import { ReceiptText } from "lucide-react";
import { useGamer } from "@/context/GamerContext";
import GamerInput from "@/components/GamerInput";

export default function GamerDashboard() {
  const { gamerId, loading } = useGamer();
  const [inputModal, setInputModal] = useState(false);
  const [doubleInput, setDoubleInput] = useState(false);
  const router = useRouter();

  // State for game status
  const [gameActive, setGameActive] = useState(null); // null = loading, false = inactive, true = active

  useEffect(() => {
    if (!loading && !gamerId) {
      router.push("/gamer/login");
    }
  }, [gamerId, loading, router]);

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

  if (loading || !gamerId || gameActive === null) {
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

  return <>{gameActive ? <GamerInput /> : <AllahBhorosha></AllahBhorosha>}</>;
}
