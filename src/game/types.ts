export const CELL_IDS = [
  "-h-1x1", "-h-2x1", "-h-3x1",
  "-h-1x2", "-h-2x2", "-h-3x2",
  "-h-1x3", "-h-2x3", "-h-3x3",
] as const;

export type CellId = (typeof CELL_IDS)[number];
export type Mark = "cross" | "circle";
export type Board = Record<CellId, Mark | null>;
export type Outcome = Mark | "draw" | null;
export type Difficulty = "easy" | "medium" | "hard";
export type GameStage = "welcome" | "mark" | "difficulty" | "playing" | "result";

/** A computer style only decides a legal computer move; scene UI owns turn timing. */
export type ComputerStrategy = (
  board: Board,
  computerMark: Mark,
  humanMark: Mark,
) => CellId | undefined;
