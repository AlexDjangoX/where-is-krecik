"use client";

import { useState } from "react";
import Image from "next/image";
import type { Language } from "@/intl/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";

const COMPACT_KNOB_LEFT = {
  en: 3,
  pl: "calc(100% - 21px)",
} as const;

const DEFAULT_KNOB_X = {
  en: 2,
  pl: 54,
} as const;

const LANGUAGE_TOGGLE_SIZE = {
  default: {
    track: "h-8 min-w-20.5",
    flag: 20,
    flagLeft: "absolute left-1.25 z-10",
    flagRight: "absolute right-1 z-10",
    knob: "absolute top-1 z-20 flex size-6 items-center justify-center overflow-hidden rounded-full shadow-md",
    icon: 16,
  },
  compact: {
    track: "h-6 w-16",
    flag: 14,
    flagLeft: "absolute left-1 z-10",
    flagRight: "absolute right-1 z-10",
    knob: "absolute top-[3px] z-20 flex size-[18px] items-center justify-center overflow-hidden rounded-full shadow-md",
    icon: 11,
  },
} as const;

type LanguageToggleProps = {
  value: Language;
  onValueChange: (next: Language) => void;
  ariaLabel: string;
  testId?: string;
  size?: keyof typeof LANGUAGE_TOGGLE_SIZE;
  className?: string;
};

export function LanguageToggle({
  value,
  onValueChange,
  ariaLabel,
  testId = "language-toggle",
  size = "compact",
  className,
}: LanguageToggleProps) {
  const [rotationCount, setRotationCount] = useState(0);
  const sizeClass = LANGUAGE_TOGGLE_SIZE[size];

  const toggle = () => {
    const next: Language = value === "en" ? "pl" : "en";
    setRotationCount((count) => count + 1);
    onValueChange(next);
  };

  return (
    <button
      type="button"
      role="switch"
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-gray-200 shadow-inner shadow-slate-500/65 transition-transform duration-150 ease-out hover:scale-105 active:scale-95 dark:bg-gray-900 dark:shadow-slate-600",
        sizeClass.track,
        className,
      )}
      onClick={toggle}
      data-testid={testId}
      data-language={value}
      aria-label={ariaLabel}
      aria-checked={value === "pl"}
    >
      <div className={sizeClass.flagLeft}>
        <Image
          src="/images/uk.png"
          alt="EN"
          width={sizeClass.flag}
          height={sizeClass.flag}
          unoptimized
        />
      </div>

      <div className={sizeClass.flagRight}>
        <Image
          src="/images/pl.png"
          alt="PL"
          width={sizeClass.flag}
          height={sizeClass.flag}
          unoptimized
        />
      </div>

      <motion.div
        className={sizeClass.knob}
        style={size === "compact" ? undefined : { left: "1px" }}
        animate={
          size === "compact"
            ? {
                left: COMPACT_KNOB_LEFT[value],
                rotate: rotationCount * 360,
              }
            : {
                x: DEFAULT_KNOB_X[value],
                rotate: rotationCount * 360,
              }
        }
        transition={{
          type: "tween",
          ease: [0.4, 0, 0.2, 1],
          duration: 0.42,
        }}
        initial={false}
      >
        <div
          aria-hidden
          className={
            value === "en"
              ? "pointer-events-none absolute inset-0 bg-linear-to-b from-red-500 to-red-700"
              : "pointer-events-none absolute inset-0 bg-linear-to-b from-blue-500 to-blue-700"
          }
        />
        <Languages
          strokeWidth={1.4}
          size={sizeClass.icon}
          className="relative z-10 text-white"
        />
      </motion.div>
    </button>
  );
}
