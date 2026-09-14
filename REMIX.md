# Tic-Tac-Toe Remix Guide

This project is a single-player tic-tac-toe game with mouse/touch and hand input.
Start remixing in `src/Scene.tsx`; its game composition lives in `src/PhotopeaGeneratedScene.tsx`.

## Game flow

1. Welcome screen.
2. Player chooses Cross or Circle.
3. Player chooses Easy, Medium, or Hard.
4. The player always takes the first turn.
5. The computer uses the opposite mark.
6. A round ends on a win or draw.
7. **Play again** returns to Welcome and clears the chosen configuration.

## Controls

- **Mouse / touch:** click an empty board cell.
- **Hand cursor:** a glowing palm-center cursor is visible throughout the app.
- **Hand hover:** any tracked non-fist hand over an empty cell previews the player's stroke texture.
- **Hand click:** a new `closed_fist` clicks the HUD button or board cell under the palm. The fist must open again before another click.

## Main edit points

- `src/boardLayout.ts` — board asset paths, mark textures, Tic/Tac/Toe textures, and the nine canonical cell layouts.
- `src/BoardVisuals.tsx` — board rendering, placed marks, hover preview, dimming, near-win hint, and win-line animation.
- `src/useGameRound.ts` — setup stages, turn flow, computer delay, state reset, effects, and timer cleanup.
- `src/game/` — pure board rules and Easy / Medium / Hard computer strategies.
- `src/GameHud.tsx` and `src/GameHud.css` — HTML setup, status, result UI, and styling.
- `src/HandCursor.tsx` and `src/HandCursor.css` — palm cursor, hand hover, closed-fist click behavior, trail, and topmost UI layer.
- `src/WinConfetti.tsx` — player-win confetti only.

## Safeguards for remixing

- Keep Photopea cell IDs (`-h-1x1` through `-h-3x3`) as the board contract.
- Change cell geometry only in `boardLayout.ts`; visual marks, hover previews, and hand hit-tests depend on it.
- Keep game state and all scheduled cleanup in `useGameRound.ts`; do not move timers into visual components.
- Add a new computer style as a `ComputerStrategy` in `src/game/`, then register it in `src/game/computer.ts`.
- Keep the hand cursor's HTML layer above the HUD. It intentionally uses a higher `zIndexRange`.
- `src/App.tsx` and `src/main.tsx` are Vincentt runtime files. Do not edit them for normal game remixes.

## Common remix tasks

- **Reskin the game:** replace URLs in `boardLayout.ts` and update `GameHud.css`.
- **Change grid placement:** edit `CELL_LAYOUTS` in `boardLayout.ts` only.
- **Change AI difficulty:** edit the relevant file in `src/game/`.
- **Change win celebration:** edit `BoardVisuals.tsx` and/or `WinConfetti.tsx` without changing the rules module.
- **Hand-only variant:** remove mouse targets from `PhotopeaGeneratedScene.tsx`; retain `HandCursor`.

## Verification

```sh
pnpm typecheck
pnpm test
pnpm build
```

The game-focused files are lint-clean. The broader starter template currently has unrelated lint findings in App and QA files.

## First task for a new remix session

Replace the board and mark textures, then restyle `GameHud.css`. Do not change `src/game/` or `useGameRound.ts` unless the intended game rules change.
