/* eslint-disable @typescript-eslint/no-floating-promises */
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Pomodoro } from '.';

describe('Pomodoro component', () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the timer and controls', () => {
    render(<Pomodoro />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Pomodoro',
    );
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Completed sessions: 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('starts and pauses the timer when the button is clicked', () => {
    render(<Pomodoro />);

    const toggle = screen.getByRole('button', { name: 'Start' });

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('Pause');

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('timer')).toHaveTextContent('24:59');

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('Start');
  });

  it('toggles the timer with the Space key', () => {
    render(<Pomodoro />);

    fireEvent.keyDown(document, { code: 'Space' });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    fireEvent.keyDown(document, { code: 'Space' });
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('does not toggle via the global listener when a button has focus', () => {
    render(<Pomodoro />);

    const toggle = screen.getByRole('button', { name: 'Start' });
    toggle.focus();

    fireEvent.keyDown(toggle, { code: 'Space' });
    expect(toggle).toHaveTextContent('Start');

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent('Pause');
  });

  it('resets the timer to the current mode duration', () => {
    render(<Pomodoro />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('skips to the next mode', () => {
    render(<Pomodoro />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));

    expect(screen.getByRole('timer')).toHaveTextContent('5:00');
    expect(screen.getByText('Short Break')).toBeInTheDocument();
  });

  it('updates the ring progress as time decreases', () => {
    render(<Pomodoro />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => vi.advanceTimersByTime(1000));

    const ring = document.querySelector('circle[stroke="currentColor"]');
    expect(ring).toBeInTheDocument();
    expect(ring?.getAttribute('stroke-dashoffset')).not.toBe('0');
  });

  it('completes a work session, shows the break, and pulses the ring', () => {
    render(<Pomodoro />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => vi.advanceTimersByTime(25 * 60 * 1000));

    expect(screen.getByText('Short Break')).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('5:00');
    expect(screen.getByText('Completed sessions: 1')).toBeInTheDocument();

    const ring = document.querySelector('circle[stroke="currentColor"]');
    expect(ring).toBeInTheDocument();
    expect(ring?.classList.contains('brightness-150')).toBe(true);

    act(() => vi.advanceTimersByTime(300));
    expect(ring?.classList.contains('brightness-150')).toBe(false);
  });
});
