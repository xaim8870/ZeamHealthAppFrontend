import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FuturisticBackgroundProps {
  className?: string;
  opacity?: number;
  count?: number; // 🔥 number of glowing circles
}

const FuturisticBackground = ({
  className = "",
  opacity = 0.15,
  count = 20, // default to 4 circles
}: FuturisticBackgroundProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // 🎨 Define color palettes for light and dark
  const glowColors = isDarkMode
    ? ["rgba(59,130,246,0.35)", "rgba(139,92,246,0.35)", "rgba(16,185,129,0.35)"] // blue, purple, green
    : ["rgba(251,191,36,0.35)", "rgba(59,130,246,0.25)", "rgba(236,72,153,0.25)"]; // amber, blue, pink

  // 🔥 Generate circles dynamically
  const circles = Array.from({ length: count }, (_, i) => ({
    cx: `${Math.random() * 100}%`, // random horizontal position
    cy: `${Math.random() * 100}%`, // random vertical position
    delay: Math.random() * 4, // random delay
    color: glowColors[i % glowColors.length], // rotate through colors
  }));

  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Hexagon grid pattern */}
        <pattern id="hex-pattern" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon
            points="30,0 60,15 60,45 30,60 0,45 0,15"
            fill="none"
            stroke={isDarkMode ? "rgba(99,102,241,0.25)" : "rgba(59,130,246,0.15)"}
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Grid of hexagons */}
      <rect width="100%" height="100%" fill="url(#hex-pattern)" />

      {/* Animated glowing orbs */}
      {circles.map((circle, i) => (
        <motion.circle
          key={i}
          cx={circle.cx}
          cy={circle.cy}
          r={50}
          fill={circle.color}
          animate={{ r: [30, 70, 40] }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: circle.delay,
          }}
        />
      ))}
    </svg>
  );
};

export default FuturisticBackground;
