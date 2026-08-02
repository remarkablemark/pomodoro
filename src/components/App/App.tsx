import { Pomodoro } from 'src/components/Pomodoro';

export function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-(--breakpoint-xl) flex-col items-center justify-center p-4 text-center dark:bg-slate-900 dark:text-slate-100">
      <Pomodoro />
    </main>
  );
}
