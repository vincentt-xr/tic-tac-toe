import { getOutcome, placeMark } from "./rules";
import { CELL_IDS, type Board, type CellId, type ComputerStrategy, type Mark } from "./types";

const scoreBoard = (board: Board, computerMark: Mark, humanMark: Mark, depth: number): number | null => {
  const outcome = getOutcome(board);
  if (outcome === computerMark) return 10 - depth;
  if (outcome === humanMark) return depth - 10;
  if (outcome === "draw") return 0;
  return null;
};

const minimax = (
  board: Board,
  computerMark: Mark,
  humanMark: Mark,
  computerTurn: boolean,
  depth: number,
): number => {
  const terminalScore = scoreBoard(board, computerMark, humanMark, depth);
  if (terminalScore !== null) return terminalScore;

  const scores = CELL_IDS
    .filter((cell) => board[cell] === null)
    .map((cell) => minimax(
      placeMark(board, cell, computerTurn ? computerMark : humanMark)!,
      computerMark,
      humanMark,
      !computerTurn,
      depth + 1,
    ));

  return computerTurn ? Math.max(...scores) : Math.min(...scores);
};

/** Hard: exhaustive minimax; it cannot lose. */
export const hardComputer: ComputerStrategy = (board, computerMark, humanMark) => {
  const openCells = CELL_IDS.filter((cell) => board[cell] === null);
  let bestCell: CellId | undefined;
  let bestScore = -Infinity;

  openCells.forEach((cell) => {
    const score = minimax(placeMark(board, cell, computerMark)!, computerMark, humanMark, false, 1);
    if (score > bestScore) {
      bestScore = score;
      bestCell = cell;
    }
  });

  return bestCell;
};
