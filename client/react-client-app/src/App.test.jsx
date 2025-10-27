import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByText(/react/i);
  expect(heading).toBeInTheDocument();
});
