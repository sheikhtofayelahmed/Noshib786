"use client";

import { useRouter } from "next/navigation";
import { User, Users, ShieldCheck, History } from "lucide-react";

export default function FooterNavigator() {
  const router = useRouter();

  const navItems = [
    {
      label: "Gamer",
      path: "/gamer",
      icon: <User className="w-5 h-5" />,
      color: "from-rose-500 via-pink-500 to-red-600",
    },
    {
      label: "Agent",
      path: "/agent",
      icon: <Users className="w-5 h-5" />,
      color: "from-amber-400 via-yellow-500 to-orange-600",
    },
    {
      label: "Master",
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
    <footer className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md  border-t border-gray-800 z-50">
      <div className="flex justify-center items-center py-3 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center justify-center text-white text-sm hover:scale-110 transition-transform duration-200"
          >
            <div
              className={`p-2  mx-5 rounded-lg bg-gradient-to-br ${item.color} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
            >
              {item.icon}
            </div>
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}
