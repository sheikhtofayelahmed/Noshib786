"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, Layers, ShieldCheck, History } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function HomeNavigator() {
  const router = useRouter();
  const [number, setNumber] = useState("000");

  useEffect(() => {
    const interval = setInterval(() => {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNumber(randomNum.toString());
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      label: "Gamer",
      path: "/gamer",
      icon: <Gamepad2 className="w-8 h-8" />,
      color: "border-orange-500 text-orange-400",
    },
    {
      label: "Agent",
      path: "/agent",
      icon: <Layers className="w-8 h-8" />,
      color: "border-purple-500 text-purple-400",
    },
    {
      label: "Master Agent",
      path: "/masterAgent",
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "border-indigo-500 text-indigo-400",
    },
    {
      label: "History",
      path: "/history",
      icon: <History className="w-8 h-8" />,
      color: "border-pink-500 text-pink-400",
    },
  ];

  const floatingElements = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    type: Math.random() > 0.5 ? "triangle" : "square",
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40,
    duration: 15 + Math.random() * 15,
    delay: Math.random() * 5,
    rotateSpeed: Math.random() * 360,
  }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden font-sans">
      {/* Floating Background Shapes */}
      {floatingElements.map((el) => (
        <motion.div
          key={el.id}
          className={`absolute ${
            el.type === "square"
              ? "bg-white"
              : "border-b-white border-x-transparent border-x-[20px] border-b-[20px]"
          }`}
          style={{
            width: el.size,
            height: el.type === "square" ? el.size : 0,
            top: `${el.y}%`,
            left: `${el.x}%`,
            opacity: 0.08,
          }}
          animate={{
            y: [0, 40, -40, 0],
            rotate: [0, el.rotateSpeed, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            repeatType: "loop",
            delay: el.delay,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 flex flex-col items-center justify-center text-center p-8"
      >
        {/* Animated Gradient Title */}
        <motion.h1
          className="text-5xl pt-8 md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 drop-shadow-lg mb-8 leading-[1.1] relative"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          নসীব ৭৮৬
        </motion.h1>

        {/* Rolling Number Counter */}
        <motion.div
          className="relative w-72 h-32 mb-12 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border-2 border-gray-800"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-pink-500/20 opacity-50 animate-pulse" />
          <motion.div
            key={number}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative z-10 font-mono text-6xl md:text-7xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_#fff]"
          >
            {number}
          </motion.div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {navItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <motion.button
                onClick={() => router.push(item.path)}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                  boxShadow: `0 0 20px ${item.color}, 0 0 40px ${item.color}50, 0 0 60px ${item.color}30`,
                }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center gap-4 w-48 h-16 rounded-full border-2 ${item.color} bg-gray-900 text-white transition-all duration-300`}
              >
                {item.icon}
                <span className="font-bold text-lg">{item.label}</span>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
