"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type KrecikMoleProps = {
  className?: string;
  /** Larger, celebratory look for the reveal panel. */
  celebrating?: boolean;
};

/** Friendly cartoon mole, drawn as inline SVG so it scales with its cell. */
export function KrecikMole({
  className,
  celebrating = false,
}: KrecikMoleProps) {
  const t = useTranslations("where-is-krecik");

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={t("mole.aria")}
      className={cn("h-full w-full drop-shadow-md", className)}
    >
      {/* paws */}
      <ellipse cx="26" cy="86" rx="12" ry="8" fill="#f2c6a0" />
      <ellipse cx="74" cy="86" rx="12" ry="8" fill="#f2c6a0" />
      {/* body */}
      <path
        d="M20 92 C 16 55, 30 24, 50 24 C 70 24, 84 55, 80 92 Z"
        fill="#6b4a3a"
      />
      <path
        d="M30 92 C 28 62, 38 44, 50 44 C 62 44, 72 62, 70 92 Z"
        fill="#8a6650"
      />
      {/* ears */}
      <circle cx="30" cy="34" r="7" fill="#6b4a3a" />
      <circle cx="70" cy="34" r="7" fill="#6b4a3a" />
      <circle cx="30" cy="34" r="3.5" fill="#f2c6a0" />
      <circle cx="70" cy="34" r="3.5" fill="#f2c6a0" />
      {/* eyes */}
      <circle cx="40" cy="46" r="5" fill="#fff" />
      <circle cx="60" cy="46" r="5" fill="#fff" />
      <circle cx="41" cy="47" r="2.6" fill="#1f1a17" />
      <circle cx="61" cy="47" r="2.6" fill="#1f1a17" />
      <circle cx="42" cy="46" r="0.9" fill="#fff" />
      <circle cx="62" cy="46" r="0.9" fill="#fff" />
      {/* snout */}
      <ellipse cx="50" cy="60" rx="14" ry="10" fill="#f2c6a0" />
      <ellipse cx="50" cy="56" rx="6" ry="4.5" fill="#f26b8a" />
      <path
        d="M42 65 Q 50 71 58 65"
        stroke="#1f1a17"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* whiskers */}
      <g stroke="#1f1a17" strokeWidth="1.4" strokeLinecap="round">
        <line x1="36" y1="58" x2="24" y2="55" />
        <line x1="36" y1="62" x2="24" y2="64" />
        <line x1="64" y1="58" x2="76" y2="55" />
        <line x1="64" y1="62" x2="76" y2="64" />
      </g>
      {celebrating ? (
        <g fill="#fbbf24">
          <circle cx="14" cy="18" r="3" />
          <circle cx="86" cy="14" r="2.5" />
          <circle cx="90" cy="40" r="2" />
          <circle cx="10" cy="44" r="2" />
        </g>
      ) : null}
    </svg>
  );
}
