import { CELL_IDS, type ComputerStrategy } from "./types";

/** Easy: choose any legal square. */
export const easyComputer: ComputerStrategy = (board) => {
  const openCells = CELL_IDS.filter((cell) => board[cell] === null);
  return openCells[Math.floor(Math.random() * openCells.length)];
};
