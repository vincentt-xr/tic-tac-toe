import { easyComputer } from "./easyComputer";
import { mediumComputer } from "./casualComputer";
import { hardComputer } from "./hardComputer";
import type { ComputerStrategy, Difficulty } from "./types";

const strategies: Record<Difficulty, ComputerStrategy> = {
  easy: easyComputer,
  medium: mediumComputer,
  hard: hardComputer,
};

export const computerForDifficulty = (difficulty: Difficulty): ComputerStrategy => strategies[difficulty];
