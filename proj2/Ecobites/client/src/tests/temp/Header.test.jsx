import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import SiteHeader from '../site/Header';
import { AuthContext } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock auth service
vi.mock('../api/services/auth.service', () => ({
  getCurrentUser: () => ({ _id: 'user123', role: 'customer' }),
  isAuthenticated: () => true,
  login: vi.fn(),
  logout: vi.fn()
}));

// Mock useNavigate
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('Header Component', () => {
  const renderHeader = (isAuthenticated = false, role = null) => {
    const mockLogout = vi.fn();
    localStorage.setItem('userRole', role);

    render(
      <AuthContext.Provider value={{ isAuthenticated, logout: mockLogout }}>
        <BrowserRouter>
          <SiteHeader showMenuButton={true} />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    return { mockLogout };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('shows all navigation items when not authenticated', () => {
    renderHeader(false);
    
    // Check for presence of all navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Drivers')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    
    // Verify Logout is not present
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('shows limited navigation items when authenticated', () => {
    renderHeader(true, 'customer');
    
    // Check for presence of allowed items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Customer Dashboard')).toBeInTheDocument();
    
    // Verify restricted items are not present
    expect(screen.queryByText('Restaurants')).not.toBeInTheDocument();
    expect(screen.queryByText('Customers')).not.toBeInTheDocument();
    expect(screen.queryByText('Drivers')).not.toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  test('logout functionality works', async () => {
    const { mockLogout } = renderHeader(true, 'customer');
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  test('shows correct dashboard link based on role', () => {
    // Test for customer role
    renderHeader(true, 'customer');
    expect(screen.getByText('Customer Dashboard')).toBeInTheDocument();
    
    // Cleanup and test for restaurant role
    vi.clearAllMocks();
    localStorage.clear();
    render(<></>);
    
    renderHeader(true, 'restaurant');
    expect(screen.getByText('Restaurant Dashboard')).toBeInTheDocument();
    
    // Cleanup and test for driver role
    vi.clearAllMocks();
    localStorage.clear();
    render(<></>);
    
    renderHeader(true, 'driver');
    expect(screen.getByText('Driver Dashboard')).toBeInTheDocument();
  });
});