import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ScreenText } from "@vincentt-xr/sdk";
import { useRef, type ReactNode } from "react";
import type { Group, Mesh } from "three";

import type { Difficulty, GameStage, Mark, Outcome } from "./game/types";
import { WinConfetti } from "./WinConfetti";
import "./GameHud.css";

const MARK_OPTIONS: { mark: Mark; label: string; image: string }[] = [
  { mark: "cross", label: "Play as X", image: "/assets/photopea-export/Cross.png" },
  { mark: "circle", label: "Play as O", image: "/assets/photopea-export/Circle.png" },
];

const DIFFICULTY_OPTIONS: { difficulty: Difficulty; label: string; description: string }[] = [
  { difficulty: "easy", label: "Easy", description: "Random moves" },
  { difficulty: "medium", label: "Medium", description: "Blocks your wins" },
  { difficulty: "hard", label: "Hard", description: "Unbeatable" },
];

/**
 * Fades its children between 55% and 100% while active. It writes the material
 * opacity each frame, so the texts inside keep literal props the editor can change.
 */
const Pulse = ({ active, children }: { active: boolean; children: ReactNode }) => {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !active) return;
    const opacity = 0.775 + 0.225 * Math.sin(clock.getElapsedTime() * (Math.PI / 0.75));
    group.current.traverse((object) => {
      const { material } = object as Mesh;
      if (material && !Array.isArray(material)) {
        material.transparent = true;
        material.opacity = opacity;
      }
    });
  });
  return <group ref={group} name="Thinking pulse">{children}</group>;
};

type GameHudProps = {
  stage: GameStage;
  status: string;
  outcome: Outcome;
  selectedMark: Mark | null;
  selectedDifficulty: Difficulty | null;
  isComputerThinking: boolean;
  onStartSetup: () => void;
  onSelectMark: (mark: Mark) => void;
  onContinueToDifficulty: () => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStartRound: () => void;
  onRestart: () => void;
};

/**
 * Every heading and status line is a `ScreenText` with a literal `text`, so the
 * console's visual editor can retype, move and restyle it; game state only
 * toggles `visible`. The buttons stay DOM (styling in GameHud.css), placed at
 * fixed heights of the 720 x 1280 canvas so they line up with the texts.
 */
export const GameHud = ({
  stage,
  status,
  outcome,
  selectedMark,
  selectedDifficulty,
  isComputerThinking,
  onStartSetup,
  onSelectMark,
  onContinueToDifficulty,
  onSelectDifficulty,
  onStartRound,
  onRestart,
}: GameHudProps) => {
  const playing = stage === "playing";
  const result = stage === "result";
  const computerMark: Mark = selectedMark === "cross" ? "circle" : "cross";

  return <>
    <ScreenText
      name="Title"
      text="TIC TAC TOE"
      screenTransform={{ position: { x: 0, y: 130 }, size: { width: 700, height: 120 }, rotation: 0, renderOrder: 2000 }}
      fontSize={76}
      fontWeight={900}
      letterSpacing={0.055}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={stage === "welcome"}
    />
    <ScreenText
      name="Subtitle"
      text="Play against the computer"
      screenTransform={{ position: { x: 0, y: 40 }, size: { width: 640, height: 60 }, rotation: 0, renderOrder: 2000 }}
      fontSize={36}
      fontWeight={700}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={1}
      shadowLayers={[{ color: "#1f0c05", blur: 7, offsetY: 3, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={stage === "welcome"}
    />
    <ScreenText
      name="Choose your mark"
      text="CHOOSE YOUR MARK"
      screenTransform={{ position: { x: 0, y: 260 }, size: { width: 700, height: 110 }, rotation: 0, renderOrder: 2000 }}
      fontSize={64}
      fontWeight={900}
      letterSpacing={0.055}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={stage === "mark"}
    />
    <ScreenText
      name="Choose difficulty"
      text="CHOOSE DIFFICULTY"
      screenTransform={{ position: { x: 0, y: 300 }, size: { width: 700, height: 110 }, rotation: 0, renderOrder: 2000 }}
      fontSize={64}
      fontWeight={900}
      letterSpacing={0.055}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={stage === "difficulty"}
    />
    <ScreenText
      name="Your turn X"
      text="Your turn — X"
      screenTransform={{ position: { x: 0, y: 575 }, size: { width: 640, height: 80 }, rotation: 0, renderOrder: 2000 }}
      fontSize={40}
      fontWeight={800}
      letterSpacing={0.03}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={1}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={playing && !isComputerThinking && selectedMark === "cross"}
    />
    <ScreenText
      name="Your turn O"
      text="Your turn — O"
      screenTransform={{ position: { x: 0, y: 575 }, size: { width: 640, height: 80 }, rotation: 0, renderOrder: 2000 }}
      fontSize={40}
      fontWeight={800}
      letterSpacing={0.03}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={1}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={playing && !isComputerThinking && selectedMark === "circle"}
    />
    <Pulse active={playing && isComputerThinking}>
      <ScreenText
        name="Computer is thinking"
        text="Computer is thinking…"
        screenTransform={{ position: { x: 0, y: 575 }, size: { width: 640, height: 80 }, rotation: 0, renderOrder: 2000 }}
        fontSize={40}
        fontWeight={800}
        letterSpacing={0.03}
        color="#fff1c9"
        strokeColor="#5d2d14"
        strokeWidth={1}
        shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
        bgColor="transparent"
        padding={0}
        visible={playing && isComputerThinking}
      />
    </Pulse>
    <ScreenText
      name="You win"
      text="You win!"
      screenTransform={{ position: { x: 0, y: 520 }, size: { width: 680, height: 100 }, rotation: 0, renderOrder: 2000 }}
      fontSize={60}
      fontWeight={900}
      letterSpacing={0.045}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={result && outcome !== null && outcome === selectedMark}
    />
    <ScreenText
      name="Computer wins"
      text="Computer wins"
      screenTransform={{ position: { x: 0, y: 520 }, size: { width: 680, height: 100 }, rotation: 0, renderOrder: 2000 }}
      fontSize={60}
      fontWeight={900}
      letterSpacing={0.045}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={result && selectedMark !== null && outcome === computerMark}
    />
    <ScreenText
      name="Draw game"
      text="Draw game"
      screenTransform={{ position: { x: 0, y: 520 }, size: { width: 680, height: 100 }, rotation: 0, renderOrder: 2000 }}
      fontSize={60}
      fontWeight={900}
      letterSpacing={0.045}
      color="#fff1c9"
      strokeColor="#5d2d14"
      strokeWidth={2}
      shadowLayers={[{ color: "#44200e", blur: 0, offsetY: 3 }, { color: "#1f0c05", blur: 10, offsetY: 6, opacity: 0.75 }]}
      bgColor="transparent"
      padding={0}
      visible={result && outcome === "draw"}
    />

    <Html fullscreen zIndexRange={[10000, 0]} pointerEvents="none">
      <section className={`game-hud game-hud--${stage}`}>
        <p className="game-hud__sr" aria-live="polite">{stage === "playing" || stage === "result" ? status : ""}</p>
        <WinConfetti active={result && outcome === selectedMark} />
        {stage === "welcome" && (
          <div className="game-hud__menu game-hud__welcome">
            <button className="game-hud__wood-button" type="button" onClick={onStartSetup}>Start Game</button>
          </div>
        )}

        {stage === "mark" && (
          <div className="game-hud__menu game-hud__mark">
            <div className="game-hud__mark-options">
              {MARK_OPTIONS.map(({ mark, label, image }) => (
                <button
                  key={mark}
                  className={`game-hud__mark-option ${selectedMark === mark ? "game-hud__mark-option--selected" : ""}`}
                  type="button"
                  onClick={() => onSelectMark(mark)}
                  aria-pressed={selectedMark === mark}
                >
                  <img src={image} alt="" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <button className="game-hud__wood-button" type="button" disabled={!selectedMark} onClick={onContinueToDifficulty}>Continue</button>
          </div>
        )}

        {stage === "difficulty" && (
          <div className="game-hud__menu game-hud__difficulty">
            <div className="game-hud__difficulty-options">
              {DIFFICULTY_OPTIONS.map(({ difficulty, label, description }) => (
                <button
                  key={difficulty}
                  className={`game-hud__difficulty-option ${selectedDifficulty === difficulty ? "game-hud__difficulty-option--selected" : ""}`}
                  type="button"
                  onClick={() => onSelectDifficulty(difficulty)}
                  aria-pressed={selectedDifficulty === difficulty}
                >
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>
            <button className="game-hud__wood-button" type="button" disabled={!selectedDifficulty} onClick={onStartRound}>Start Game</button>
          </div>
        )}

        {result && outcome !== null && (
          <div className="game-hud__result">
            <button className="game-hud__wood-button" type="button" onClick={onRestart}>Play again</button>
          </div>
        )}
      </section>
    </Html>
  </>;
};
