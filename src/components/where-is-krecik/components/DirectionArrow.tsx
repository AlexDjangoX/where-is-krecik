"use client";

import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import type { Direction } from "@/components/where-is-krecik/types";

/**
 * One arrow glyph rotated in 45° steps so all eight directions share the exact
 * same arrowhead. (Lucide's diagonal arrows are drawn differently, and Unicode
 * arrows render as blue emoji on some platforms.)
 */
const ROTATION: Record<Direction, string> = {
  up: "rotate-0",
  upRight: "rotate-45",
  right: "rotate-90",
  downRight: "rotate-135",
  down: "rotate-180",
  downLeft: "-rotate-135",
  left: "-rotate-90",
  upLeft: "-rotate-45",
};

export function useDirectionLabels(): Record<Direction, string> {
  const t = useTranslations("where-is-krecik");
  return {
    up: t("directions.up"),
    upRight: t("directions.upRight"),
    right: t("directions.right"),
    downRight: t("directions.downRight"),
    down: t("directions.down"),
    downLeft: t("directions.downLeft"),
    left: t("directions.left"),
    upLeft: t("directions.upLeft"),
  };
}

type DirectionArrowProps = {
  direction: Direction;
  className?: string;
};

export function DirectionArrow({ direction, className }: DirectionArrowProps) {
  return <ArrowUp aria-hidden className={cn(ROTATION[direction], className)} />;
}
