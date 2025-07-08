import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the ThreeDViewer to avoid WebGL issues in jsdom
jest.mock('./Components/ThreeDViewer', () => () => (
  <div data-testid="mock-three-d-viewer" />
));

test('displays landing page heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /welcome to our 3d figures store/i,
  });
  expect(heading).toBeInTheDocument();
});
