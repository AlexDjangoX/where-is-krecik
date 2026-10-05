"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type WormholeExitProps = {
  className?: string;
};

const RINGS = [0, 0.6, 1.2];
const CYCLE = 1.8;

/**
 * Wormhole exit: rings ripple outward from the hole, like something is about
 * to pop out of it. Deliberately the opposite feel to the entrance's inward
 * spinning vortex. Colour comes from `currentColor`.
 */
export function WormholeExit({ className }: WormholeExitProps) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      fill="none"
      className={cn("h-full w-full", className)}
    >
      {reduceMotion ? (
        // Static stand-in for the ripple: one soft ring around the arrow.
        <circle
          cx={50}
          cy={50}
          r={38}
          stroke="currentColor"
          strokeWidth={6}
          opacity={0.5}
        />
      ) : (
        RINGS.map((delay) => (
          <motion.circle
            key={delay}
            cx={50}
            cy={50}
            r={14}
            stroke="currentColor"
            strokeWidth={6}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: [0.4, 3], opacity: [0.9, 0] }}
            transition={{
              duration: CYCLE,
              delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ originX: "50%", originY: "50%" }}
          />
        ))
      )}
      {/* Rising arrow: the way out */}
      <motion.g
        animate={reduceMotion ? { y: 0 } : { y: [4, -4, 4] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <path
          d="M50 70 V32"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d="M34 48 L50 30 L66 48"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
}
