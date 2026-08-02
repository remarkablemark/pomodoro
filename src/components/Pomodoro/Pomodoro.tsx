import { useEffect, useState } from 'react';
import type { Mode } from 'src/hooks/useTimer';
import { useTimer } from 'src/hooks/useTimer';
import { formatTime } from 'src/utils/time';

const MODE_COLORS: Record<Mode, string> = {
  work: 'text-rose-500',
  shortBreak: 'text-emerald-500',
  longBreak: 'text-blue-500',
};

const MODE_LABELS: Record<Mode, string> = {
  work: 'Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PULSE_DURATION = 300;

export function Pomodoro() {
  const [isPulsing, setIsPulsing] = useState(false);
  const timer = useTimer({
    onComplete: () => {
      setIsPulsing(true);
    },
  });

  useEffect(() => {
    if (!isPulsing) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsPulsing(false);
    }, PULSE_DURATION);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPulsing]);

  /* v8 ignore next */
  const progress = timer.duration > 0 ? timer.timeLeft / timer.duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <section
      aria-label="Pomodoro timer"
      className="flex w-full max-w-md flex-col items-center gap-6 p-4"
    >
      <h1 className="text-3xl font-bold dark:text-slate-100">Pomodoro</h1>

      <div className="relative h-64 w-64">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            fill="none"
            r={RADIUS}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            fill="none"
            r={RADIUS}
            className={`transition-all duration-300 ${
              MODE_COLORS[timer.mode]
            } ${isPulsing ? 'brightness-150' : 'brightness-100'}`}
            stroke="currentColor"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="12"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            aria-live="off"
            className="text-5xl font-bold dark:text-slate-100"
            role="timer"
          >
            {formatTime(timer.timeLeft)}
          </span>
          <span
            aria-atomic="true"
            aria-live="polite"
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            {MODE_LABELS[timer.mode]}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-6 py-2 text-sm font-medium text-slate-800 shadow-xs transition-all hover:border-slate-800 hover:bg-slate-100 focus:border-slate-800 focus:bg-slate-100 focus:ring-0 focus:outline-none active:border-slate-800 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:focus:border-slate-500 dark:focus:bg-slate-800 dark:active:border-slate-500"
          onClick={timer.toggle}
          type="button"
        >
          {timer.isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 focus:border-slate-500 focus:bg-slate-100 focus:ring-0 focus:outline-none dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200 dark:focus:border-slate-500 dark:focus:bg-slate-800"
          onClick={timer.reset}
          type="button"
        >
          Reset
        </button>
        <button
          className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 focus:border-slate-500 focus:bg-slate-100 focus:ring-0 focus:outline-none dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200 dark:focus:border-slate-500 dark:focus:bg-slate-800"
          onClick={timer.skip}
          type="button"
        >
          Skip
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Completed sessions: {timer.completedSessions}
      </p>
    </section>
  );
}
