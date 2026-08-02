import { formatTime } from './time';

describe('formatTime', () => {
  it('formats seconds as M:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(1500)).toBe('25:00');
    expect(formatTime(900)).toBe('15:00');
  });

  it('clamps negative values to 0:00', () => {
    expect(formatTime(-5)).toBe('0:00');
  });
});
