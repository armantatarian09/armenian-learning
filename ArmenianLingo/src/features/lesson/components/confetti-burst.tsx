"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 20 }, (_, i) => i);

export function ConfettiBurst() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((index) => (
        <motion.span
          key={index}
          initial={{ y: -20, x: `${Math.random() * 100}%`, opacity: 0 }}
          animate={{ y: "110%", opacity: [0, 1, 0], rotate: 360 }}
          transition={{ duration: 1.4 + Math.random(), delay: Math.random() * 0.25 }}
          style={{
            position: "absolute",
            top: 0,
            width: 10,
            height: 10,
            borderRadius: 2,
            background: ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6"][index % 4]
          }}
        />
      ))}
    </div>
  );
}
