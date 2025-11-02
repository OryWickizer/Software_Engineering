import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import Drivers from '../drivers/Drivers';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock the auth service
vi.mock('../api/services/auth.service', () => ({
  getCurrentUser: () => ({ _id: 'driver123', role: 'driver' }),
  isAuthenticated: () => true,
  login: vi.fn(),
  logout: vi.fn()
}));

describe('Drivers Component', () => {
  const renderDrivers = () => {
    return render(
      <AuthProvider>
        <BrowserRouter>
          <Drivers />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders drivers dashboard', () => {
    renderDrivers();
    expect(screen.getByText(/driver dashboard/i)).toBeInTheDocument();
  });

  test('displays available orders section', () => {
    renderDrivers();
    expect(screen.getByText(/available orders/i)).toBeInTheDocument();
  });

  test('displays my deliveries section', () => {
    renderDrivers();
    expect(screen.getByText(/my deliveries/i)).toBeInTheDocument();
  });
});