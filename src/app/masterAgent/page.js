"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MasterAgentPage() {
  const router = useRouter();

  useEffect(() => {
    // Check cookie client side
    const cookies = document.cookie.split("; ").reduce((acc, cur) => {
      const [key, value] = cur.split("=");
      acc[key] = value;
      return acc;
    }, {});

    if (!cookies.masterAgentId) {
      router.push("/masterAgent/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen -mt-32 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bangla text-2xl md:text-7xl font-bold mb-4 text-cyan-300 drop-shadow-lg animate-flicker">
          নসীব ৭৮৬
        </h1>
        <Image
          src="/dowa.png"
          alt="Dowa"
          width={288}
          height={288}
          className="mx-auto drop-shadow-2xl animate-pulse"
        />
      </div>
    </main>
  );
}
