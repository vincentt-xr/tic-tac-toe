import { describe, expect, it } from "vitest";

import { createBoard, getOutcome, getThreatCells, getWinningLine, placeMark } from "./rules";

const boardWith = (...moves: [Parameters<typeof placeMark>[1], "cross" | "circle"][]) =>
  moves.reduce((board, [cell, mark]) => placeMark(board, cell, mark)!, createBoard());

describe("tic-tac-toe rules", () => {
  it("detects row, column, and diagonal wins", () => {
    const row = boardWith(["-h-1x1", "cross"], ["-h-2x1", "cross"], ["-h-3x1", "cross"]);
    const column = boardWith(["-h-2x1", "circle"], ["-h-2x2", "circle"], ["-h-2x3", "circle"]);
    const diagonal = boardWith(["-h-1x1", "cross"], ["-h-2x2", "cross"], ["-h-3x3", "cross"]);

    expect(getOutcome(row)).toBe("cross");
    expect(getOutcome(column)).toBe("circle");
    expect(getWinningLine(diagonal)).toEqual(["-h-1x1", "-h-2x2", "-h-3x3"]);
  });

  it("detects a draw and rejects occupied squares", () => {
    const draw = boardWith(
      ["-h-1x1", "cross"], ["-h-2x1", "circle"], ["-h-3x1", "cross"],
      ["-h-1x2", "cross"], ["-h-2x2", "circle"], ["-h-3x2", "circle"],
      ["-h-1x3", "circle"], ["-h-2x3", "cross"], ["-h-3x3", "cross"],
    );

    expect(getOutcome(draw)).toBe("draw");
    expect(placeMark(draw, "-h-1x1", "circle")).toBeNull();
  });

  it("returns every empty cell that completes a two-mark line", () => {
    const board = boardWith(["-h-1x1", "cross"], ["-h-2x1", "cross"], ["-h-2x2", "circle"], ["-h-3x2", "circle"]);

    expect(getThreatCells(board)).toEqual(expect.arrayContaining(["-h-3x1", "-h-1x2"]));
  });
});
