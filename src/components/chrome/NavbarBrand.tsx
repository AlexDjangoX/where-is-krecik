"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { KrecikMole } from "@/components/where-is-krecik/components/KrecikMole";

function NavbarHole({
  delay,
  lean,
}: {
  delay: number;
  lean: "left" | "right";
}) {
  const reduceMotion = useReducedMotion();
  const peek = lean === "left" ? -6 : 6;

  return (
    <span
      aria-hidden
      className="relative h-20 w-[4.5rem] shrink-0 sm:h-[5.25rem] sm:w-20"
    >
      <span className="absolute inset-x-0 top-0 bottom-2.5 overflow-hidden">
        <motion.span
          className="absolute bottom-0 left-1/2 block w-11 -translate-x-1/2 sm:w-12"
          initial={false}
          animate={
            reduceMotion
              ? { y: 16, rotate: peek / 2 }
              : {
                  y: [48, 14, 14, 48],
                  rotate: [0, peek, -peek / 2, 0],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 5.6,
                  times: [0, 0.22, 0.64, 1],
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  delay,
                  ease: [0.45, 0.05, 0.2, 1],
                }
          }
        >
          <KrecikMole decorative />
        </motion.span>
      </span>

      <span className="absolute bottom-2 left-[8%] right-[8%] z-20 h-1 rounded-full bg-lime-600 dark:bg-lime-500" />
    </span>
  );
}

export function NavbarBrand() {
  const t = useTranslations("where-is-krecik");

  return (
    <div className="flex min-w-0 items-end justify-center gap-1 sm:gap-2">
      <NavbarHole delay={0} lean="left" />
      <h1 className="min-w-0 self-center text-center text-base leading-tight font-semibold tracking-tight text-lime-950 sm:text-xl md:text-2xl dark:text-lime-50">
        {t("page.title")}
      </h1>
      <NavbarHole delay={2.5} lean="right" />
    </div>
  );
}
