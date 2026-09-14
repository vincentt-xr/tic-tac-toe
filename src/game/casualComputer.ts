import { CELL_IDS, type Board, type CellId, type ComputerStrategy, type Mark } from "./types";
import { getOutcome } from "./rules";

const withMark = (board: Board, cell: CellId, mark: Mark): Board => ({ ...board, [cell]: mark });

const finishingMove = (board: Board, mark: Mark): CellId | undefined =>
  CELL_IDS.find((cell) => board[cell] === null && getOutcome(withMark(board, cell, mark)) === mark);

/** Medium: win when possible, block the human's win, otherwise choose randomly. */
export const mediumComputer: ComputerStrategy = (board, computerMark, humanMark) => {
  const openCells = CELL_IDS.filter((cell) => board[cell] === null);
  if (openCells.length === 0) return undefined;
  return finishingMove(board, computerMark) ?? finishingMove(board, humanMark) ?? openCells[Math.floor(Math.random() * openCells.length)];
};
