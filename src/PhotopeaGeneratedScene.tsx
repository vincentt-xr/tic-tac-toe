import { ScreenSpaceUI } from "@vincentt-xr/sdk";

import { BoardInteractionTargets, BoardVisuals } from "./BoardVisuals";
import { CELL_LAYOUTS } from "./boardLayout";
import { GameHud } from "./GameHud";
import { HandCursor } from "./HandCursor";
import { useGameRound } from "./useGameRound";

/** Composes the game state, R3F board, and HTML HUD. */
export const PhotopeaGeneratedScene = () => {
  const game = useGameRound();
  const gameVisible = game.stage === "playing" || game.stage === "result";
  // Hand coordinates and board anchors share normalized screen space.
  const clickBoardAtPalm = ({ x, y }: { x: number; y: number }) => {
    const cell = CELL_LAYOUTS.find(({ anchors }) => x >= anchors.left && x <= anchors.right && y <= anchors.top && y >= anchors.bottom);
    if (cell) game.playCell(cell.id);
  };
  // Hand hover is independent from mouse hover, allowing either input to own
  // the preview without clearing the other device's state.
  const hoverBoardAtPalm = (point: { x: number; y: number } | null) => {
    if (!point || game.stage !== "playing" || game.isComputerThinking) {
      game.setHandHoveredCell(null);
      return;
    }
    const cell = CELL_LAYOUTS.find(({ id, anchors }) => game.board[id] === null && point.x >= anchors.left && point.x <= anchors.right && point.y <= anchors.top && point.y >= anchors.bottom);
    game.setHandHoveredCell(cell?.id ?? null);
  };

  return <ScreenSpaceUI>
    {gameVisible && <BoardVisuals
      board={game.board}
      outcome={game.outcome}
      selectedMark={game.selectedMark}
      winningCells={game.winningCells}
      showTicTacToe={game.showTicTacToe}
      reduceMotion={game.reduceMotion}
      flashedCell={game.flashedCell}
      winningGlowIndex={game.winningGlowIndex}
      endingProgress={game.endingProgress}
      nearWinCells={game.nearWinCells}
      hoveredCell={game.hoveredCell}
    />}
    <BoardInteractionTargets
      board={game.board}
      enabled={game.stage === "playing" && !game.isComputerThinking}
      onPlayCell={game.playCell}
      onHoverCell={game.setMouseHoveredCell}
    />
    <HandCursor onCanvasClick={clickBoardAtPalm} onCanvasHover={hoverBoardAtPalm} />
    <GameHud
      stage={game.stage}
      status={game.status}
      outcome={game.outcome}
      selectedMark={game.selectedMark}
      selectedDifficulty={game.selectedDifficulty}
      isComputerThinking={game.isComputerThinking}
      onStartSetup={game.openMarkSelection}
      onSelectMark={game.selectMark}
      onContinueToDifficulty={game.openDifficultySelection}
      onSelectDifficulty={game.selectDifficulty}
      onStartRound={game.startRound}
      onRestart={game.restart}
    />
  </ScreenSpaceUI>;
};
