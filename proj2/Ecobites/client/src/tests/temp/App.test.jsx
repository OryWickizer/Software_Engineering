import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import App from '../App';
import '@testing-library/jest-dom';

// Mock auth service
vi.mock('../api/services/auth.service', () => ({
  getCurrentUser: () => null,
  isAuthenticated: () => false,
  login: vi.fn(),
  logout: vi.fn()
}));

test('renders app heading', () => {
  render(
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
  expect(screen.getByText(/EcoBites/i)).toBeInTheDocument();
});
