import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import Login from '../pages/login';
import '@testing-library/jest-dom';

// Mock useNavigate hook
vi.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }) => children,
    useNavigate: () => vi.fn()
  }
});

// Test data generator functions
const generateTestUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  ...overrides
});

const generateFormInput = (type = 'login') => {
  const user = generateTestUser();
  return type === 'login' 
    ? { email: user.email, password: user.password }
    : { name: user.name, email: user.email, password: user.password };
};

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  // Test 1: Initial Render - Sign In Mode
  test('renders sign in form by default', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Full name')).not.toBeInTheDocument();
  });

  // Test 2: Switch to Register Mode
  test('switches to register mode when clicking register link', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/New to EcoBites\? Join now/i));
    
    expect(screen.getByText('Join EcoBites')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  // Test 3: Form Input Validation
  test('validates required fields in login form', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    // Try to submit empty form
    fireEvent.click(submitButton);
    
    // Check for required field validation
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  // Test 4: Form Input Values
  test('updates input values correctly with dynamic test data', () => {
    renderLogin();
    const testData = generateFormInput('login');
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    
    expect(emailInput.value).toBe(testData.email);
    expect(passwordInput.value).toBe(testData.password);
  });

  // Test 5: Loading State
  test('shows loading state when form is submitted with dynamic data', async () => {
    renderLogin();
    const testData = generateFormInput('login');
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    fireEvent.click(submitButton);
    
    // Check for loading state
    expect(screen.getByRole('button', { name: /Sign In/i })).toHaveClass('disabled:opacity-60');
    
    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  // Test 6: Register Form Validation
  test('validates all required fields in register form', () => {
    renderLogin();
    fireEvent.click(screen.getByText(/New to EcoBites\? Join now/i));
    
    const nameInput = screen.getByPlaceholderText('Full name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});