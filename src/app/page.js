"use client";

import { useRouter } from "next/navigation";
import { User, Users, ShieldCheck, History } from "lucide-react";

export default function HomeNavigator() {
  const router = useRouter();

  const navItems = [
    // {
    //   label: "Gamer",
    //   path: "/gamer",
    //   icon: <User className="w-5 h-5" />,
    //   color: "from-rose-500 via-pink-500 to-red-600",
    // },
    {
      label: "Agent",
      path: "/agent",
      icon: <Users className="w-5 h-5" />,
      color: "from-amber-400 via-yellow-500 to-orange-600",
    },
    {
      label: "Master Agent",
      path: "/masterAgent",
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "from-indigo-500 via-violet-600 to-purple-700",
    },
    {
      label: "Explore",
      path: "/history",
      icon: <History className="w-5 h-5" />,
      color: "from-orange-400 via-rose-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-gray-950 text-white px-4 relative overflow-hidden">
      {/* Glowing background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-pink-600 opacity-30 blur-[120px] rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-400 opacity-20 blur-[100px] rounded-full animate-spin-slow" />
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-purple-700 opacity-20 blur-[80px] rounded-full animate-ping" />
      </div>

      {/* Casino-style header */}
      <h1 className="font-bangla pt-4 z-10 text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 drop-shadow-lg mb-16 tracking-wide leading-tight ">
        নসীব ৭৮৬
      </h1>

      {/* Navigation buttons */}
      <div className="z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex items-center justify-center gap-3 px-6 py-5 rounded-xl bg-gradient-to-br ${item.color} text-white font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition duration-300`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
