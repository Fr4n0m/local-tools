export function clampTimerInput(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(24 * 60 * 60, Math.floor(value)));
}

export function secondsToClock(totalSeconds: number): string {
  const value = clampTimerInput(totalSeconds);
  const hours = Math.floor(value / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((value % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
