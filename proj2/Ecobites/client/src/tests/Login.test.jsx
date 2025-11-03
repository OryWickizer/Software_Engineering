import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../api/services/auth.service';
import '@testing-library/jest-dom';
import Login from '../pages/login';

// Mock the axios config module first
vi.mock('../api/axios.config', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock the auth service
vi.mock('../api/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'customer' },
      token: 'fake-jwt-token'
    }),
    register: vi.fn().mockResolvedValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'customer' },
      token: 'fake-jwt-token'
    })
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Create mock API instance
const mockApi = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  },
  post: vi.fn(() => Promise.resolve({ data: { user: { id: '123', role: 'customer' }, token: 'mock-token' } }))
};

// Mock axios config
vi.mock('../api/axios.config', () => ({
  default: mockApi
}));

// Mock auth service
const mockAuthResponse = { user: { id: '123', role: 'customer' } };

vi.mock('../api/services/auth.service', () => ({
  authService: {
    getCurrentUser: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    login: vi.fn(() => Promise.resolve(mockAuthResponse)),
    logout: vi.fn(),
    register: vi.fn(() => Promise.resolve(mockAuthResponse))
  }
}));

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
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
    return render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    vi.clearAllMocks();
    localStorage.clear();
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

  // Test 5: Login Form Submission
  test('handles login submission with auth service call', async () => {
    renderLogin();
    const testData = generateFormInput('login');
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: testData.email,
        password: testData.password
      });
    });
  });

  // Test 6: Registration Form Submission
  test('handles registration with auth service call', async () => {
    renderLogin();
    
    // Switch to register mode and wait for state update
    fireEvent.click(screen.getByText(/New to EcoBites\? Join now/i));
    await waitFor(() => {
      expect(screen.getByText('Join EcoBites')).toBeInTheDocument();
    });
    
    const testData = generateFormInput('register');
    
    const nameInput = screen.getByPlaceholderText('Full name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    
    fireEvent.change(nameInput, { target: { value: testData.name } });
    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: testData.name,
        email: testData.email,
          password: testData.password,
          phone: ''
      });
    });
  });

  // Test 7: Form Validation
  test('validates required fields in registration form', async () => {
    renderLogin();
    fireEvent.click(screen.getByText(/New to EcoBites\? Join now/i));
    
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    
    await waitFor(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText('Full name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });
});