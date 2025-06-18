import { render, screen } from '@testing-library/react';
import App from './App';

test('displays landing page heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /welcome to our 3d figures store/i,
  });
  expect(heading).toBeInTheDocument();
});
