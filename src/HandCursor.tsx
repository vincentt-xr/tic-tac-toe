import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { XRModel } from "@vincentt-xr/sdk";
import { useXRModelNode, type XRModelNodeHandTracking } from "@vincentt-xr/sdk/low-level";
import { HandTracker } from "@vincentt-xr/sdk/tracking";
import { useEffect, useRef, useState } from "react";

import "./HandCursor.css";
import { debugGame } from "./game/debug";

type HandPoint = { x: number; y: number };
type HandCursorProps = {
  onCanvasClick: (point: HandPoint) => void;
  onCanvasHover: (point: HandPoint | null) => void;
};

// Wrist plus the four finger bases approximate the palm center more reliably
// than a fingertip, which moves significantly during a fist gesture.
const PALM_LANDMARKS = [0, 5, 9, 13, 17] as const;

const palmCenter = (points: readonly HandPoint[]): HandPoint | null => {
  const palmPoints = PALM_LANDMARKS.map((index) => points[index]).filter((point): point is HandPoint => Boolean(point));
  if (palmPoints.length !== PALM_LANDMARKS.length) return null;
  return palmPoints.reduce(
    (center, point) => ({ x: center.x + point.x / palmPoints.length, y: center.y + point.y / palmPoints.length }),
    { x: 0, y: 0 },
  );
};

const isInteractiveButton = (target: Element | null): target is HTMLButtonElement =>
  target instanceof HTMLButtonElement && !target.disabled;

const logFistTrigger = (detail: Record<string, unknown>) => {
  // eslint-disable-next-line no-console
  console.info("[hand-cursor] closed_fist trigger", detail);
};

/** Palm cursor and closed-fist click layer. It remains above the HTML HUD. */
export const HandCursor = ({ onCanvasClick, onCanvasHover }: HandCursorProps) => {
  const { gl } = useThree();
  const handNode = useXRModelNode<XRModelNodeHandTracking>(XRModel.HAND_TRACKER);
  const palmPointRef = useRef<HandPoint | null>(null);
  const previousPointRef = useRef<HandPoint | null>(null);
  const lastGestureRef = useRef<string | null>(null);
  const fistWasHeldRef = useRef(false);
  const [trail, setTrail] = useState<HandPoint[]>([]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info("[hand-cursor] closed_fist listener ready");
  }, []);

  const clickAtPalm = () => {
    const palm = palmPointRef.current;
    if (!palm) {
      debugGame("hand-click-ignored", { reason: "palm-not-tracked" });
      return;
    }
    const bounds = gl.domElement.getBoundingClientRect();
    const clientX = bounds.left + ((palm.x + 1) / 2) * bounds.width;
    const clientY = bounds.top + ((1 - palm.y) / 2) * bounds.height;
    // The cursor's topmost HTML layer can sit over the HUD. Search the full
    // stack so a button is still found when its child or wrapper is on top.
    const targets = document.elementsFromPoint(clientX, clientY);
    const button = targets.map((target) => target.closest("button")).find(isInteractiveButton) ?? null;
    debugGame("hand-fist-click", { palm, targets: targets.slice(0, 4).map((target) => target.tagName) });
    if (isInteractiveButton(button)) {
      button.click();
      return;
    }
    // No HUD button: hand the normalized palm point to the R3F board hit-test.
    onCanvasClick(palm);
  };

  useFrame(() => {
    const hand = handNode?.hands?.[0];
    const palm = palmCenter(hand?.coordinates ?? []);
    palmPointRef.current = palm;
    const gesture = hand?.gesture ?? "none";
    if (gesture !== lastGestureRef.current) {
      lastGestureRef.current = gesture;
      debugGame("hand-gesture", { gesture });
    }
    const fistIsHeld = gesture === "closed_fist";
    // Any non-fist pose can preview a move; a fist reserves the same palm point
    // for its one-shot click action.
    onCanvasHover(palm && !fistIsHeld ? palm : null);
    // Re-arm only after the hand opens, so holding a fist cannot repeat-click.
    if (fistIsHeld && !fistWasHeldRef.current) {
      logFistTrigger({ palm, handFound: Boolean(hand) });
      clickAtPalm();
    }
    fistWasHeldRef.current = fistIsHeld;

    if (!palm) {
      if (trail.length) setTrail([]);
      return;
    }

    palmPointRef.current = palm;
    const previous = previousPointRef.current;
    if (previous && Math.hypot(palm.x - previous.x, palm.y - previous.y) < 0.008) return;
    previousPointRef.current = palm;
    setTrail((points) => [palm, ...points].slice(0, 5));
  });

  return <>
    <HandTracker targetFps={24} />
    <Html fullscreen zIndexRange={[20000, 0]} style={{ pointerEvents: "none" }}>
      <div className="hand-cursor-layer" aria-hidden="true">
        {trail.slice(1).reverse().map((point, index) => (
          <i
            key={`${point.x}-${point.y}`}
            className="hand-cursor__trail"
            style={{ left: `${(point.x + 1) * 50}%`, top: `${(1 - point.y) * 50}%`, "--trail-index": index } as React.CSSProperties}
          />
        ))}
        {trail[0] && <i className="hand-cursor" style={{ left: `${(trail[0].x + 1) * 50}%`, top: `${(1 - trail[0].y) * 50}%` }} />}
      </div>
    </Html>
  </>;
};
