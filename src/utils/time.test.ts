import { formatTime } from './time';

describe('formatTime', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(1500)).toBe('25:00');
    expect(formatTime(900)).toBe('15:00');
  });

  it('clamps negative values to 00:00', () => {
    expect(formatTime(-5)).toBe('00:00');
  });
});
