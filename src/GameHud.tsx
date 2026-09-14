import { Html } from "@react-three/drei";

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

/** DOM HUD above the canvas; visual styling belongs in GameHud.css. */
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
}: GameHudProps) => (
  <Html fullscreen zIndexRange={[10000, 0]} pointerEvents="none">
    <section className={`game-hud game-hud--${stage}`} aria-live="polite">
      <WinConfetti active={stage === "result" && outcome === selectedMark} />
      {stage === "welcome" && (
        <div className="game-hud__menu game-hud__welcome">
          <h1>Tic Tac Toe</h1>
          <p>Play against the computer</p>
          <button className="game-hud__wood-button" type="button" onClick={onStartSetup}>Start Game</button>
        </div>
      )}

      {stage === "mark" && (
        <div className="game-hud__menu">
          <h1>Choose your mark</h1>
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
        <div className="game-hud__menu">
          <h1>Choose difficulty</h1>
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

      {stage === "playing" && <p className={`game-hud__status ${isComputerThinking ? "game-hud__status--thinking" : ""}`}>{status}</p>}

      {stage === "result" && outcome !== null && (
        <div className="game-hud__result">
          <p className="game-hud__result-text">{status}</p>
          <button className="game-hud__wood-button" type="button" onClick={onRestart}>Play again</button>
        </div>
      )}
    </section>
  </Html>
);
