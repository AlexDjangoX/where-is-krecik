import { useSyncExternalStore } from "react";

/** Tailwind `lg` breakpoint: floating panel needs room beside the board. */
const QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server and first client render agree (inline); switches after hydration. */
function getServerSnapshot() {
  return false;
}

/** True when the control panel should float beside the board instead of sitting under it. */
export function useFloatingPanelLayout(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
