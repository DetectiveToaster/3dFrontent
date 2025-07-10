import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';

// Mock CSS from react-toastify to avoid Jest errors
jest.mock('react-toastify/dist/ReactToastify.css', () => {});

// Mock the ThreeDViewer to avoid WebGL issues in jsdom
jest.mock('./Components/ThreeDViewer', () => () => (
  <div data-testid="mock-three-d-viewer" />
));

test('displays landing page heading', () => {
  render(
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
  const heading = screen.getByRole('heading', {
    name: /welcome to our 3d figures store/i,
  });
  expect(heading).toBeInTheDocument();
});
