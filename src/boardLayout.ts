import { useTexture } from "@react-three/drei";

import type { CellId } from "./game/types";

export const CROSS_TEXTURE = "/assets/photopea-export/Cross.png";
export const CIRCLE_TEXTURE = "/assets/photopea-export/Circle.png";
export const CROSS_STROKE_TEXTURE = "/assets/photopea-export/Cross-Stroke.png";
export const CIRCLE_STROKE_TEXTURE = "/assets/photopea-export/Circle-Stroke.png";
export const BOARD_TEXTURE = "/assets/photopea-export/board.png";
export const TIC_TAC_TOE_TEXTURES = [
  "/assets/photopea-export/Tic.png",
  "/assets/photopea-export/Tac.png",
  "/assets/photopea-export/Toe.png",
] as const;

// ScreenImage suspends while loading a texture. Warm every state before gameplay.
[CROSS_TEXTURE, CIRCLE_TEXTURE, CROSS_STROKE_TEXTURE, CIRCLE_STROKE_TEXTURE, BOARD_TEXTURE, ...TIC_TAC_TOE_TEXTURES]
  .forEach((texture) => useTexture.preload(texture));

export type CellLayout = {
  id: CellId;
  center: [number, number];
  anchors: { left: number; right: number; top: number; bottom: number };
};

// Photopea's helper transforms have no bounds, so these measured grid cells are
// the shared visual and interaction layout contract.
export const CELL_LAYOUTS: readonly CellLayout[] = [
  { id: "-h-1x1", center: [-157, 121], anchors: { left: -0.62, right: -0.23, top: 0.3, bottom: 0.07 } },
  { id: "-h-2x1", center: [4, 121], anchors: { left: -0.17, right: 0.22, top: 0.3, bottom: 0.07 } },
  { id: "-h-3x1", center: [167, 121], anchors: { left: 0.28, right: 0.67, top: 0.3, bottom: 0.07 } },
  { id: "-h-1x2", center: [-157, -37], anchors: { left: -0.62, right: -0.23, top: 0.04, bottom: -0.2 } },
  { id: "-h-2x2", center: [4, -37], anchors: { left: -0.17, right: 0.22, top: 0.04, bottom: -0.2 } },
  { id: "-h-3x2", center: [167, -37], anchors: { left: 0.28, right: 0.67, top: 0.04, bottom: -0.2 } },
  { id: "-h-1x3", center: [-157, -197], anchors: { left: -0.62, right: -0.23, top: -0.23, bottom: -0.44 } },
  { id: "-h-2x3", center: [4, -197], anchors: { left: -0.17, right: 0.22, top: -0.23, bottom: -0.44 } },
  { id: "-h-3x3", center: [167, -197], anchors: { left: 0.28, right: 0.67, top: -0.23, bottom: -0.44 } },
];

export const cellLayout = (cellId: CellId): CellLayout => {
  const layout = CELL_LAYOUTS.find(({ id }) => id === cellId);
  if (!layout) throw new Error(`Unknown tic-tac-toe cell: ${cellId}`);
  return layout;
};
