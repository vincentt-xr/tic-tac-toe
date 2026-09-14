import { describe, expect, it, vi } from "vitest";

import { computerForDifficulty } from "./computer";
import { createBoard, getOutcome, placeMark } from "./rules";

const boardWith = (...moves: [Parameters<typeof placeMark>[1], "cross" | "circle"][]) =>
  moves.reduce((board, [cell, mark]) => placeMark(board, cell, mark)!, createBoard());

describe("computer strategies", () => {
  it("easy selects a legal empty cell", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const board = boardWith(["-h-1x1", "cross"]);
    const move = computerForDifficulty("easy")(board, "circle", "cross");

    expect(move).toBe("-h-2x1");
    vi.restoreAllMocks();
  });

  it("medium takes an immediate win and blocks an immediate loss", () => {
    const winningBoard = boardWith(["-h-1x1", "circle"], ["-h-2x1", "circle"], ["-h-1x2", "cross"]);
    const blockingBoard = boardWith(["-h-1x1", "cross"], ["-h-2x1", "cross"], ["-h-1x2", "circle"]);

    expect(computerForDifficulty("medium")(winningBoard, "circle", "cross")).toBe("-h-3x1");
    expect(computerForDifficulty("medium")(blockingBoard, "circle", "cross")).toBe("-h-3x1");
  });

  it("hard chooses the forced block, then the round can continue through the same public rules", () => {
    const afterPlayerMove = boardWith(["-h-1x1", "cross"], ["-h-2x1", "cross"], ["-h-2x2", "circle"]);
    const computerCell = computerForDifficulty("hard")(afterPlayerMove, "circle", "cross");
    const afterComputerMove = placeMark(afterPlayerMove, computerCell!, "circle")!;

    expect(computerCell).toBe("-h-3x1");
    expect(getOutcome(afterComputerMove)).toBeNull();
  });
});
