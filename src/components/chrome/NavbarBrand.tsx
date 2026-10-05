"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { KrecikMole } from "@/components/where-is-krecik/components/KrecikMole";

function NavbarMole({
  delay,
  lean,
}: {
  delay: number;
  lean: "left" | "right";
}) {
  "use no memo";
  const reduceMotion = useReducedMotion() === true;
  const peek = lean === "left" ? -6 : 6;

  return (
    <span
      aria-hidden
      className="relative h-9 w-11 shrink-0 overflow-hidden sm:h-10 sm:w-12"
    >
      <motion.span
        className="absolute bottom-0 left-1/2 block size-10 sm:size-11"
        initial={{ x: "-50%", y: 44, rotate: 0 }}
        animate={
          reduceMotion
            ? { x: "-50%", y: 14, rotate: peek / 2 }
            : {
                x: "-50%",
                y: [44, 2, 2, 44],
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
  );
}

export function NavbarBrand() {
  const t = useTranslations("where-is-krecik");

  return (
    <div className="relative mx-auto flex min-w-0 items-end justify-center gap-1 pb-1.5 sm:gap-1.5">
      <NavbarMole delay={0} lean="left" />
      <h1 className="relative z-10 min-w-0 pb-0.5 text-center text-base leading-none font-semibold tracking-tight text-lime-950 sm:text-xl md:text-2xl dark:text-lime-50">
        {t("page.title")}
      </h1>
      <NavbarMole delay={2.5} lean="right" />
      <span className="absolute inset-x-0 bottom-0 z-20 h-1 rounded-full bg-lime-600 dark:bg-lime-500" />
    </div>
  );
}
