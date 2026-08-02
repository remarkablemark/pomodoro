export function formatTime(seconds: number): string {
  const clampedSeconds = Math.max(0, seconds);
  const minutes = Math.floor(clampedSeconds / 60);
  const remainingSeconds = clampedSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
