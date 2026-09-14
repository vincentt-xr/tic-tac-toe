/** Keep development diagnostics available without shipping gameplay logs. */
export const debugGame = (event: string, detail: Record<string, unknown> = {}) => {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.info("[tic-tac-toe]", event, detail);
};
