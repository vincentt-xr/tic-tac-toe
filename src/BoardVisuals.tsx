import { ScreenImage, ScreenShape, ScreenTransform } from "@vincentt-xr/sdk";
import { startTransition, useEffect, useState } from "react";

import {
  CELL_LAYOUTS,
  cellLayout,
  CIRCLE_STROKE_TEXTURE,
  CIRCLE_TEXTURE,
  CROSS_STROKE_TEXTURE,
  CROSS_TEXTURE,
  TIC_TAC_TOE_TEXTURES,
  type CellLayout,
} from "./boardLayout";
import type { Board, CellId, Mark, Outcome } from "./game/types";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

const CellImage = ({
  cell,
  board,
  winningIndex,
  showTicTacToe,
  reduceMotion,
  isEmphasized,
}: {
  cell: CellLayout;
  board: Board;
  winningIndex: number | undefined;
  showTicTacToe: boolean;
  reduceMotion: boolean;
  isEmphasized: boolean;
}) => {
  const mark = board[cell.id];
  const isWinning = winningIndex !== undefined;
  const revealedTexture = isWinning && showTicTacToe ? TIC_TAC_TOE_TEXTURES[winningIndex] : null;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!mark || revealedTexture || reduceMotion) {
      setScale(1);
      return undefined;
    }
    let frame = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 220, 1);
      const nextScale = progress < 0.7
        ? 0.93 + (0.13 * (progress / 0.7))
        : 1.06 - (0.06 * ((progress - 0.7) / 0.3));
      setScale(nextScale);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    setScale(0.93);
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [mark, reduceMotion, revealedTexture]);

  if (!mark && !revealedTexture) return null;
  const image = revealedTexture ?? (mark === "cross" ? CROSS_TEXTURE : CIRCLE_TEXTURE);
  const size = 108 * scale * (isEmphasized ? 1.06 : 1);

  return <ScreenImage
    name={`${cell.id}-${revealedTexture ? "tic-tac-toe" : mark}`}
    src={image}
    coordinateSpace="canvas"
    canvasSize={{ width: 720, height: 1280 }}
    position={cell.center}
    size={[size, size]}
    fit="contain"
    transparent
    alphaTest={0.01}
    opacity={isWinning || !showTicTacToe ? 1 : 0.28}
    renderOrder={1002}
    overlay
  />;
};

const CellOverlay = ({ cell, color, opacity, name }: { cell: CellLayout; color: string; opacity: number; name: string }) => (
  <ScreenTransform anchors={cell.anchors}>
    <mesh name={name} renderOrder={1005}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  </ScreenTransform>
);

const WinningLine = ({ cells, progress }: { cells: readonly CellId[]; progress: number }) => {
  const [start, end] = cells.map((id) => cellLayout(id).center);
  const lineEnd: [number, number] = [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress,
  ];
  const toNormalized = ([x, y]: [number, number]) => ({ x: (x + 360) / 720, y: (640 - y) / 1280 });

  return <ScreenShape
    name="winning-line"
    transform={{ position: { x: 0, y: 0 }, size: { width: 720, height: 1280 }, rotation: 0 }}
    settings={{
      kind: "line",
      fillColor: "#f8d98c",
      strokeColor: "#f2c26d",
      strokeWidth: 13,
      lineStart: toNormalized(start),
      lineEnd: toNormalized(lineEnd),
    }}
    renderOrder={1006}
  />;
};

const HoverPreview = ({ cell, mark }: { cell: CellLayout; mark: Mark }) => (
  <ScreenImage
    name={`${cell.id}-hover-${mark}-stroke`}
    src={mark === "cross" ? CROSS_STROKE_TEXTURE : CIRCLE_STROKE_TEXTURE}
    coordinateSpace="canvas"
    canvasSize={{ width: 720, height: 1280 }}
    position={cell.center}
    size={[108, 108]}
    fit="contain"
    transparent
    alphaTest={0.01}
    renderOrder={1003}
    overlay
  />
);

type BoardVisualsProps = {
  board: Board;
  outcome: Outcome;
  selectedMark: Mark | null;
  winningCells: readonly CellId[] | null;
  showTicTacToe: boolean;
  reduceMotion: boolean;
  flashedCell: CellId | null;
  winningGlowIndex: number | null;
  endingProgress: number;
  nearWinCells: readonly CellId[];
  hoveredCell: CellId | null;
};

/** Renders board state only; useGameRound owns all game and timer state. */
export const BoardVisuals = ({
  board,
  outcome,
  selectedMark,
  winningCells,
  showTicTacToe,
  reduceMotion,
  flashedCell,
  winningGlowIndex,
  endingProgress,
  nearWinCells,
  hoveredCell,
}: BoardVisualsProps) => (
  <>
    <ScreenImage
      name="board"
      src="/assets/photopea-export/board.png"
      anchors={{ left: -1, right: 1, top: 1, bottom: -1 }}
      fit="contain"
      transparent
      alphaTest={0.01}
      renderOrder={1000}
      overlay
    />
    {CELL_LAYOUTS.map((cell) => {
      const listIndex = winningCells?.indexOf(cell.id) ?? -1;
      return <CellImage
        key={cell.id}
        cell={cell}
        board={board}
        winningIndex={listIndex === -1 ? undefined : listIndex}
        showTicTacToe={showTicTacToe}
        reduceMotion={reduceMotion}
        isEmphasized={listIndex >= 0 && listIndex <= (winningGlowIndex ?? -1)}
      />;
    })}
    {winningCells && CELL_LAYOUTS.filter((cell) => !winningCells.includes(cell.id)).map((cell) => <CellOverlay key={`${cell.id}-dim`} cell={cell} color="#160a04" opacity={0.58 * clamp(endingProgress / 0.3)} name={`${cell.id}-dimmed`} />)}
    {flashedCell && <CellOverlay cell={cellLayout(flashedCell)} color="#f2c26d" opacity={0.42} name={`${flashedCell}-click-flash`} />}
    {winningCells && winningGlowIndex !== null && <CellOverlay cell={cellLayout(winningCells[winningGlowIndex])} color="#f2c26d" opacity={0.48} name={`${winningCells[winningGlowIndex]}-winning-glow`} />}
    {winningCells && <WinningLine cells={winningCells} progress={clamp((endingProgress - 0.28) / 0.28)} />}
    {outcome === "draw" && CELL_LAYOUTS.map((cell) => <CellOverlay key={`${cell.id}-draw-settle`} cell={cell} color="#160a04" opacity={0.16} name={`${cell.id}-draw-settle`} />)}
    {nearWinCells.map((id) => <CellOverlay key={`${id}-near-win`} cell={cellLayout(id)} color="#f2c26d" opacity={0.18} name={`${id}-near-win`} />)}
    {hoveredCell && selectedMark && <HoverPreview cell={cellLayout(hoveredCell)} mark={selectedMark} />}
  </>
);

type BoardInteractionTargetsProps = {
  board: Board;
  enabled: boolean;
  onPlayCell: (cell: CellId) => void;
  onHoverCell: (cell: CellId | null) => void;
};

/** Invisible R3F targets preserve mouse/touch input without covering visuals. */
export const BoardInteractionTargets = ({ board, enabled, onPlayCell, onHoverCell }: BoardInteractionTargetsProps) => {
  if (!enabled) return null;
  return <>
    {CELL_LAYOUTS.filter((cell) => board[cell.id] === null).map((cell) => (
      <ScreenTransform key={`${cell.id}-target`} anchors={cell.anchors}>
        <mesh
          name={`${cell.id}-target`}
          onClick={() => onPlayCell(cell.id)}
          onPointerDown={() => onHoverCell(cell.id)}
          onPointerOver={() => startTransition(() => onHoverCell(cell.id))}
          onPointerOut={() => startTransition(() => onHoverCell(null))}
          renderOrder={1010}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </ScreenTransform>
    ))}
  </>;
};
