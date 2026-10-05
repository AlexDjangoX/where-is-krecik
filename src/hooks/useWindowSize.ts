import { useEffect, useState } from "react";
import { isServer } from "@/utils/isServer";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState(() => {
    if (isServer()) return { width: 0, height: 0 };
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (isServer()) return;

    let frameId: number | null = null;

    const handleResize = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        frameId = null;
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return windowSize;
}
