/* eslint-disable @typescript-eslint/no-floating-promises */
import { act, fireEvent, renderHook } from '@testing-library/react';

import { getNextMode, useTimer } from './useTimer';

vi.mock('src/utils/beep', () => ({
  playBeep: vi.fn(),
}));

vi.mock('src/utils/notify', () => ({
  showNotification: vi.fn().mockResolvedValue(undefined),
}));

describe('getNextMode', () => {
  it('returns a short break after work when the next completion is not a multiple of four', () => {
    expect(getNextMode('work', 0)).toBe('shortBreak');
    expect(getNextMode('work', 1)).toBe('shortBreak');
    expect(getNextMode('work', 2)).toBe('shortBreak');
  });

  it('returns a long break after the fourth work session', () => {
    expect(getNextMode('work', 3)).toBe('longBreak');
    expect(getNextMode('work', 7)).toBe('longBreak');
  });

  it('returns work after any break', () => {
    expect(getNextMode('shortBreak', 1)).toBe('work');
    expect(getNextMode('longBreak', 4)).toBe('work');
  });
});

describe('useTimer', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'Date',
      ],
    });
    onComplete.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes in a paused work session', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.mode).toBe('work');
    expect(result.current.timeLeft).toBe(25 * 60);
    expect(result.current.duration).toBe(25 * 60);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.completedSessions).toBe(0);
  });

  it('starts, ticks, and pauses the timer', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeLeft).toBe(25 * 60 - 1);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.timeLeft).toBe(25 * 60 - 1);
  });

  it('toggles the running state', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeLeft).toBe(25 * 60 - 1);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('resets the timer to the current mode duration', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(5000));
    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.timeLeft).toBe(25 * 60);
  });

  it('skips to the next mode without completing the current one', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(1000));
    act(() => {
      result.current.skip();
    });

    expect(result.current.mode).toBe('shortBreak');
    expect(result.current.timeLeft).toBe(5 * 60);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.completedSessions).toBe(0);
  });

  it('completes a work session and moves to a short break', () => {
    const { result } = renderHook(() => useTimer({ onComplete }));

    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(25 * 60 * 1000));

    expect(result.current.mode).toBe('shortBreak');
    expect(result.current.timeLeft).toBe(5 * 60);
    expect(result.current.completedSessions).toBe(1);
    expect(result.current.isRunning).toBe(true);
    expect(onComplete).toHaveBeenCalled();
  });

  it('completes a short break and moves back to work', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.skip();
    });
    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(5 * 60 * 1000));

    expect(result.current.mode).toBe('work');
    expect(result.current.timeLeft).toBe(25 * 60);
    expect(result.current.completedSessions).toBe(0);
  });

  it('completes the fourth work session and moves to a long break', () => {
    const { result } = renderHook(() => useTimer());

    for (let index = 0; index < 3; index += 1) {
      act(() => {
        result.current.start();
      });
      act(() => vi.advanceTimersByTime(25 * 60 * 1000));
      act(() => {
        result.current.skip();
      });
    }

    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(25 * 60 * 1000));

    expect(result.current.mode).toBe('longBreak');
    expect(result.current.timeLeft).toBe(15 * 60);
    expect(result.current.completedSessions).toBe(4);
  });

  it('syncs time when the tab becomes visible again', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    act(() => vi.advanceTimersByTime(2000));

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
      writable: true,
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    act(() => vi.advanceTimersByTime(5000));

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
      writable: true,
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.timeLeft).toBe(25 * 60 - 7);
  });

  it('toggles start/pause with the Space key', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      fireEvent.keyDown(document, { code: 'Space' });
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      fireEvent.keyDown(document, { code: 'Space' });
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('does not toggle when Space is pressed on a button, input, or textarea', () => {
    const { result } = renderHook(() => useTimer());
    const button = document.createElement('button');
    document.body.appendChild(button);

    act(() => {
      fireEvent.keyDown(button, { code: 'Space' });
    });

    expect(result.current.isRunning).toBe(false);

    document.body.removeChild(button);
  });
});
