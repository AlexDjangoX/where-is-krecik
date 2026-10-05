/**
 * Shared class sets so the side panels read as the same "grass" surface as the board.
 */

/**
 * Phase panel body. The frame (border, background, rounding) comes from the
 * surrounding floating-panel shell, so the content only lays itself out.
 */
export const PANEL = "flex w-full flex-col gap-4 p-3 sm:p-4";

/** A lighter "cell" inside the panel that holds controls or text. */
export const CELL =
  "rounded-xl border border-lime-700/10 bg-white/70 dark:border-lime-300/10 dark:bg-lime-900/40";

/** A dark hole, used as an icon well so panel icons echo the holes on the board. */
export const HOLE =
  "flex shrink-0 items-center justify-center rounded-full bg-linear-to-b from-amber-900 to-stone-950 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]";

export const HEADING =
  "text-lg font-semibold tracking-tight text-lime-950 dark:text-lime-50";
export const TEXT = "text-sm text-lime-900/70 dark:text-lime-100/70";
export const LABEL = "text-sm font-medium text-lime-950 dark:text-lime-50";

/** Solid rounded button base; pair with a colour set below. */
export const SOLID_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold text-white shadow-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-lime-50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-lime-950 [&_svg]:shrink-0";

export const BUTTON_LIME =
  "bg-lime-600 hover:bg-lime-500 focus-visible:ring-lime-400 dark:bg-lime-500 dark:hover:bg-lime-400";
export const BUTTON_EMERALD =
  "bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400";
export const BUTTON_QUIET =
  "border border-lime-700/15 bg-white/80 text-lime-950 shadow-none hover:bg-white focus-visible:ring-lime-400 dark:border-lime-300/15 dark:bg-lime-900/40 dark:text-lime-50 dark:hover:bg-lime-900/70";
