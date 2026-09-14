import { startTransition, useEffect, useRef, useState } from "react";

import { computerForDifficulty } from "./game/computer";
import { debugGame } from "./game/debug";
import { createBoard, getOutcome, getThreatCells, getWinningLine, placeMark } from "./game/rules";
import type { Board, CellId, Difficulty, GameStage, Mark, Outcome } from "./game/types";

const WIN_SEQUENCE_MS = 1450;

const glowIndexAt = (progress: number): number => {
  if (progress >= 0.83) return 2;
  if (progress >= 0.69) return 1;
  if (progress >= 0.55) return 0;
  return -1;
};

const gameStatus = (outcome: Outcome, playerMark: Mark | null, computerMark: Mark, isComputerThinking: boolean) => {
  if (outcome === playerMark) return "You win!";
  if (outcome === computerMark) return "Computer wins";
  if (outcome === "draw") return "Draw game";
  if (isComputerThinking) return "Computer is thinking…";
  return `Your turn — ${playerMark === "cross" ? "X" : "O"}`;
};

/**
 * Owns all mutable round state and every timeout / animation cleanup.
 * Visual components receive derived state and must not schedule game work.
 */
export const useGameRound = () => {
  const [stage, setStage] = useState<GameStage>("welcome");
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<Board>(createBoard);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [mouseHoveredCell, setMouseHoveredCell] = useState<CellId | null>(null);
  const [handHoveredCell, setHandHoveredCell] = useState<CellId | null>(null);
  const [winningCells, setWinningCells] = useState<readonly CellId[] | null>(null);
  const [showTicTacToe, setShowTicTacToe] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [flashedCell, setFlashedCell] = useState<CellId | null>(null);
  const [winningGlowIndex, setWinningGlowIndex] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [endingProgress, setEndingProgress] = useState(0);
  const [nearWinCells, setNearWinCells] = useState<readonly CellId[]>([]);
  const computerTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const nearWinTimerRef = useRef<number | null>(null);
  const winFrameRef = useRef<number | null>(null);

  const computerMark: Mark = selectedMark === "cross" ? "circle" : "cross";
  const hoveredCell = handHoveredCell ?? mouseHoveredCell;

  /** Cancels delayed AI, temporary feedback, and the win reveal on reset/unmount. */
  const clearScheduledWork = () => {
    if (computerTimerRef.current !== null) window.clearTimeout(computerTimerRef.current);
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    if (nearWinTimerRef.current !== null) window.clearTimeout(nearWinTimerRef.current);
    computerTimerRef.current = null;
    flashTimerRef.current = null;
    nearWinTimerRef.current = null;
    if (winFrameRef.current !== null) cancelAnimationFrame(winFrameRef.current);
    winFrameRef.current = null;
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => () => clearScheduledWork(), []);

  useEffect(() => {
    if (!winningCells) return undefined;
    setWinningGlowIndex(null);
    setShowTicTacToe(false);
    if (reduceMotion) {
      setEndingProgress(1);
      setWinningGlowIndex(2);
      setShowTicTacToe(true);
      return undefined;
    }

    let lastGlow = -1;
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / WIN_SEQUENCE_MS, 1);
      setEndingProgress(progress);
      const nextGlow = glowIndexAt(progress);
      if (nextGlow !== lastGlow) {
        lastGlow = nextGlow;
        setWinningGlowIndex(nextGlow === -1 ? null : nextGlow);
      }
      if (progress < 1) winFrameRef.current = requestAnimationFrame(animate);
      else setShowTicTacToe(true);
    };
    winFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (winFrameRef.current !== null) cancelAnimationFrame(winFrameRef.current);
      winFrameRef.current = null;
    };
  }, [reduceMotion, winningCells]);

  /** Shows the possible finishing cells briefly without changing game state. */
  const showNearWins = (nextBoard: Board) => {
    const threats = getThreatCells(nextBoard);
    setNearWinCells(threats);
    if (nearWinTimerRef.current !== null) window.clearTimeout(nearWinTimerRef.current);
    if (threats.length) nearWinTimerRef.current = window.setTimeout(() => setNearWinCells([]), 720);
  };

  /** Returns the board to a neutral round while retaining setup choices. */
  const resetRound = () => {
    clearScheduledWork();
    setBoard(createBoard());
    setOutcome(null);
    setMouseHoveredCell(null);
    setHandHoveredCell(null);
    setWinningCells(null);
    setShowTicTacToe(false);
    setIsComputerThinking(false);
    setFlashedCell(null);
    setWinningGlowIndex(null);
    setEndingProgress(0);
    setNearWinCells([]);
  };

  const playCell = (cell: CellId) => {
    if (stage !== "playing" || isComputerThinking || !selectedMark || !selectedDifficulty) return;
    const humanBoard = placeMark(board, cell, selectedMark);
    if (!humanBoard) return;

    debugGame("human-move", { cell, mark: selectedMark, difficulty: selectedDifficulty });
    setFlashedCell(cell);
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlashedCell(null), 240);

    const humanOutcome = getOutcome(humanBoard);
    if (humanOutcome !== null) {
      setBoard(humanBoard);
      setOutcome(humanOutcome);
      setMouseHoveredCell(null);
      setHandHoveredCell(null);
      setWinningCells(getWinningLine(humanBoard));
      setStage("result");
      return;
    }

    setBoard(humanBoard);
    showNearWins(humanBoard);
    setIsComputerThinking(true);
    computerTimerRef.current = window.setTimeout(() => {
      const computerCell = computerForDifficulty(selectedDifficulty)(humanBoard, computerMark, selectedMark);
      const completedBoard = computerCell ? placeMark(humanBoard, computerCell, computerMark) ?? humanBoard : humanBoard;
      const completedOutcome = getOutcome(completedBoard);
      debugGame("computer-move", { cell: computerCell, mark: computerMark });
      startTransition(() => {
        setBoard(completedBoard);
        setOutcome(completedOutcome);
        setWinningCells(getWinningLine(completedBoard));
        setIsComputerThinking(false);
        if (completedOutcome !== null) setStage("result");
      });
      if (completedOutcome === null) showNearWins(completedBoard);
      computerTimerRef.current = null;
    }, 550);
    setMouseHoveredCell(null);
    setHandHoveredCell(null);
  };

  const startRound = () => {
    if (!selectedMark || !selectedDifficulty) return;
    debugGame("start-round", { playerMark: selectedMark, computerMark, difficulty: selectedDifficulty });
    startTransition(() => {
      resetRound();
      setStage("playing");
    });
  };

  /** Leaves the round and setup choices, returning the player to Welcome. */
  const restart = () => {
    debugGame("restart-to-welcome");
    resetRound();
    setSelectedMark(null);
    setSelectedDifficulty(null);
    setStage("welcome");
  };

  return {
    stage,
    selectedMark,
    selectedDifficulty,
    board,
    outcome,
    hoveredCell,
    winningCells,
    showTicTacToe,
    isComputerThinking,
    flashedCell,
    winningGlowIndex,
    reduceMotion,
    endingProgress,
    nearWinCells,
    computerMark,
    status: gameStatus(outcome, selectedMark, computerMark, isComputerThinking),
    openMarkSelection: () => setStage("mark"),
    selectMark: setSelectedMark,
    openDifficultySelection: () => {
      if (selectedMark) setStage("difficulty");
    },
    selectDifficulty: setSelectedDifficulty,
    startRound,
    restart,
    playCell,
    setMouseHoveredCell,
    setHandHoveredCell,
  };
};
