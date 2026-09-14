import { confetti } from "@tsparticles/confetti";
import { useEffect, useRef } from "react";
import type { Container } from "@tsparticles/engine";

import "./WinConfetti.css";

type WinConfettiProps = {
  active: boolean;
};

/** A DOM-canvas celebration, isolated from game state and the R3F scene. */
export const WinConfetti = ({ active }: WinConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return undefined;

    let cancelled = false;
    let container: Container | undefined;

    const initialize = async () => {
      const fire = await confetti.create(canvasRef.current!, { disableForReducedMotion: true });
      if (cancelled) return;
      container = await fire({
        count: 150,
        scalar: 1.5,
        spread: 95,
        startVelocity: 38,
        gravity: 1.1,
        ticks: 180,
        position: { x: 50, y: 38 },
        colors: ["#f2c26d", "#fff1c9", "#bb4f36", "#3b8a87"],
        shapes: ["square", "circle"],
      });
    };
    initialize().catch(() => undefined);

    return () => {
      cancelled = true;
      container?.destroy();
    };
  }, [active]);

  return <canvas ref={canvasRef} className="win-confetti" aria-hidden="true" />;
};
