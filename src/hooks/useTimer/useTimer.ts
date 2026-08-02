import { useEffect, useRef, useState } from 'react';
import { playBeep } from 'src/utils/beep';
import { showNotification } from 'src/utils/notify';

export type Mode = 'work' | 'shortBreak' | 'longBreak';

const WORK_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;

const DURATIONS: Record<Mode, number> = {
  work: WORK_DURATION,
  shortBreak: SHORT_BREAK_DURATION,
  longBreak: LONG_BREAK_DURATION,
};

const TICK_RATE = 1000;
const LONG_BREAK_INTERVAL = 4;

interface UseTimerOptions {
  onComplete?: () => void;
}

export interface UseTimerReturn {
  completedSessions: number;
  duration: number;
  isRunning: boolean;
  mode: Mode;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  start: () => void;
  timeLeft: number;
  toggle: () => void;
}

interface TimerState {
  completedSessions: number;
  isRunning: boolean;
  mode: Mode;
  timeLeft: number;
}

export function getNextMode(
  currentMode: Mode,
  completedSessions: number,
): Mode {
  if (currentMode !== 'work') {
    return 'work';
  }
  if ((completedSessions + 1) % LONG_BREAK_INTERVAL === 0) {
    return 'longBreak';
  }
  return 'shortBreak';
}

export function useTimer({ onComplete }: UseTimerOptions = {}): UseTimerReturn {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(WORK_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const stateRef = useRef<TimerState>({
    completedSessions: 0,
    isRunning: false,
    mode: 'work',
    timeLeft: WORK_DURATION,
  });

  useEffect(() => {
    stateRef.current = { completedSessions, isRunning, mode, timeLeft };
  }, [completedSessions, isRunning, mode, timeLeft]);

  const onCompleteRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const lastTickRef = useRef<number>(0);

  const start = () => {
    setIsRunning(true);
  };
  const pause = () => {
    setIsRunning(false);
  };
  const toggle = () => {
    setIsRunning((previous) => !previous);
  };
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const skip = () => {
    const nextMode = getNextMode(
      stateRef.current.mode,
      stateRef.current.completedSessions,
    );
    setMode(nextMode);
    setTimeLeft(DURATIONS[nextMode]);
  };

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const complete = () => {
      const { mode: currentMode, completedSessions: completed } =
        stateRef.current;
      const nextCompleted = currentMode === 'work' ? completed + 1 : completed;
      const nextMode = getNextMode(currentMode, completed);

      const nextState: TimerState = {
        completedSessions: nextCompleted,
        isRunning: true,
        mode: nextMode,
        timeLeft: DURATIONS[nextMode],
      };

      setMode(nextMode);
      setTimeLeft(nextState.timeLeft);
      setCompletedSessions(nextCompleted);
      setIsRunning(true);
      stateRef.current = nextState;

      playBeep();
      void showNotification(nextMode);
      onCompleteRef.current?.();
    };

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);

      if (delta < 1) {
        return;
      }

      lastTickRef.current += delta * 1000;

      const currentTimeLeft = stateRef.current.timeLeft;
      const next = currentTimeLeft - delta;

      if (next <= 0) {
        stateRef.current.timeLeft = 0;
        complete();
      } else {
        stateRef.current.timeLeft = next;
        setTimeLeft(next);
      }
    };

    lastTickRef.current = Date.now();
    const intervalId = setInterval(() => {
      tick();
    }, TICK_RATE);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        event.code === 'Space' &&
        !['BUTTON', 'INPUT', 'TEXTAREA'].includes(target.tagName)
      ) {
        event.preventDefault();
        setIsRunning((previous) => !previous);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    completedSessions,
    duration: DURATIONS[mode],
    isRunning,
    mode,
    pause,
    reset,
    skip,
    start,
    timeLeft,
    toggle,
  };
}
