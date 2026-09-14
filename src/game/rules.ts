import { CELL_IDS, type Board, type CellId, type Mark, type Outcome } from "./types";

const WINNING_LINES: readonly (readonly CellId[])[] = [
  ["-h-1x1", "-h-2x1", "-h-3x1"], ["-h-1x2", "-h-2x2", "-h-3x2"], ["-h-1x3", "-h-2x3", "-h-3x3"],
  ["-h-1x1", "-h-1x2", "-h-1x3"], ["-h-2x1", "-h-2x2", "-h-2x3"], ["-h-3x1", "-h-3x2", "-h-3x3"],
  ["-h-1x1", "-h-2x2", "-h-3x3"], ["-h-3x1", "-h-2x2", "-h-1x3"],
];

export const getWinningLine = (board: Board): readonly [CellId, CellId, CellId] | null => {
  const line = WINNING_LINES.find(([a, b, c]) => board[a] !== null && board[a] === board[b] && board[a] === board[c]);
  return line ? [line[0], line[1], line[2]] : null;
};

export const createBoard = (): Board => Object.fromEntries(CELL_IDS.map((cell) => [cell, null])) as Board;

export const placeMark = (board: Board, cell: CellId, mark: Mark): Board | null =>
  board[cell] === null ? { ...board, [cell]: mark } : null;

export const getOutcome = (board: Board): Outcome => {
  const line = getWinningLine(board);
  if (line) return board[line[0]];
  return CELL_IDS.every((cell) => board[cell] !== null) ? "draw" : null;
};

/** Empty cells that would complete a two-mark row, column, or diagonal. */
export const getThreatCells = (board: Board): readonly CellId[] =>
  [...new Set(WINNING_LINES.flatMap((line) => {
    const marks = line.map((cell) => board[cell]);
    const emptyIndex = marks.indexOf(null);
    const placedMarks = marks.filter((mark): mark is Mark => mark !== null);
    return emptyIndex !== -1 && placedMarks.length === 2 && placedMarks[0] === placedMarks[1]
      ? [line[emptyIndex]]
      : [];
  }))];
