import { cn } from "@/lib/utils";

type WormholeSpiralProps = {
  className?: string;
};

const TURNS = 2.75;
const STEPS = 160;
const CENTRE = 50;
const MAX_RADIUS = 44;

/** Archimedean spiral (r grows linearly with the angle) as an SVG path in a 100×100 box. */
function spiralPath(phaseOffset = 0): string {
  const points: string[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const angle = t * TURNS * Math.PI * 2 + phaseOffset;
    const radius = 2 + t * (MAX_RADIUS - 2);
    const x = CENTRE + radius * Math.cos(angle);
    const y = CENTRE + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
}

const PRIMARY_ARM = spiralPath();
const SECONDARY_ARM = spiralPath(Math.PI);

/** Wormhole entrance: a bold vortex spinning inward. Colour comes from `currentColor`. */
export function WormholeSpiral({ className }: WormholeSpiralProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      fill="none"
      className={cn(
        "h-full w-full animate-[spin_3.5s_linear_infinite] drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] motion-reduce:animate-none",
        className,
      )}
    >
      <path
        d={PRIMARY_ARM}
        stroke="currentColor"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={SECONDARY_ARM}
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
    </svg>
  );
}
