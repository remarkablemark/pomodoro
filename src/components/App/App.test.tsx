import { render, screen } from '@testing-library/react';

import { App } from '.';

describe('App component', () => {
  it('renders the Pomodoro timer', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Pomodoro',
    );
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });
});
