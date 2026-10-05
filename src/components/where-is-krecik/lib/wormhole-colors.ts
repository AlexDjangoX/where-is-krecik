/**
 * Colour pairs used to visually link a wormhole entrance with its destination.
 * Index into this array with the wormhole's index in `state.wormholes`.
 */
export type WormholeColor = {
  name: string;
  ring: string;
  fill: string;
  text: string;
  badge: string;
  /** Bright tint used for the exit marker drawn over the dark hole. */
  exit: string;
};

const WORMHOLE_COLORS: readonly WormholeColor[] = [
  {
    name: "violet",
    ring: "ring-violet-500",
    fill: "bg-violet-400 dark:bg-violet-500",
    text: "text-violet-700 dark:text-violet-200",
    badge: "bg-violet-600 text-white",
    exit: "text-violet-300",
  },
  {
    name: "sky",
    ring: "ring-sky-500",
    fill: "bg-sky-400 dark:bg-sky-500",
    text: "text-sky-700 dark:text-sky-200",
    badge: "bg-sky-600 text-white",
    exit: "text-sky-300",
  },
  {
    name: "pink",
    ring: "ring-pink-500",
    fill: "bg-pink-400 dark:bg-pink-500",
    text: "text-pink-700 dark:text-pink-200",
    badge: "bg-pink-600 text-white",
    exit: "text-pink-300",
  },
  {
    name: "amber",
    ring: "ring-amber-500",
    fill: "bg-amber-400 dark:bg-amber-500",
    text: "text-amber-700 dark:text-amber-200",
    badge: "bg-amber-600 text-white",
    exit: "text-amber-300",
  },
  {
    name: "teal",
    ring: "ring-teal-500",
    fill: "bg-teal-400 dark:bg-teal-500",
    text: "text-teal-700 dark:text-teal-200",
    badge: "bg-teal-600 text-white",
    exit: "text-teal-300",
  },
  {
    name: "orange",
    ring: "ring-orange-500",
    fill: "bg-orange-400 dark:bg-orange-500",
    text: "text-orange-700 dark:text-orange-200",
    badge: "bg-orange-600 text-white",
    exit: "text-orange-300",
  },
];

export function wormholeColor(index: number): WormholeColor {
  return WORMHOLE_COLORS[index % WORMHOLE_COLORS.length];
}
