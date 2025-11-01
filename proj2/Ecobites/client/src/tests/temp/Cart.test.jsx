import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import Customer from '../customers/Customer';
import Checkout from '../customers/Checkout';
import '@testing-library/jest-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Mock services
vi.mock('../api/services/menu.service', () => ({
  getMenuItems: vi.fn(() => Promise.resolve([
    { _id: '1', name: 'Test Item', price: 9.99, description: 'Test Description' }
  ]))
}));

vi.mock('../api/services/order.service', () => ({
  createOrder: vi.fn(() => Promise.resolve({ orderId: 'test123' }))
}));

describe('Cart and Checkout Flow', () => {
  const mockCartContext = {
    cartItems: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 0
  };

  const mockAuthContext = {
    isAuthenticated: true,
    user: { _id: 'user123', role: 'customer' },
    login: vi.fn(),
    logout: vi.fn()
  };

  // Mock auth service
  vi.mock('../api/services/auth.service', () => ({
    getCurrentUser: () => ({ _id: 'user123', role: 'customer' }),
    isAuthenticated: () => true,
    login: vi.fn(),
    logout: vi.fn()
  }));

  const renderComponent = (Component, cartOverrides = {}) => {
    const cartContextValue = { ...mockCartContext, ...cartOverrides };
    
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <CartContext.Provider value={cartContextValue}>
          <BrowserRouter>
            <Component />
          </BrowserRouter>
        </CartContext.Provider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Component (Menu and Cart)', () => {
    test('displays menu items', async () => {
      renderComponent(Customer);
      
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
        expect(screen.getByText('$9.99')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
      });
    });

    test('can add items to cart', async () => {
      const { addToCart } = mockCartContext;
      renderComponent(Customer);
      
      await waitFor(() => {
        const addButton = screen.getByText('Add to Cart');
        fireEvent.click(addButton);
        expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({
          _id: '1',
          name: 'Test Item',
          price: 9.99
        }));
      });
    });
  });

  describe('Checkout Component', () => {
    const mockCartItems = [
      { _id: '1', name: 'Test Item', price: 9.99, quantity: 2 }
    ];

    test('displays cart items and total', () => {
      renderComponent(Checkout, { cartItems: mockCartItems, total: 19.98 });
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('$19.98')).toBeInTheDocument();
    });

    test('can update item quantity', () => {
      const { updateQuantity } = mockCartContext;
      renderComponent(Checkout, { cartItems: mockCartItems });
      
      const incrementButton = screen.getByText('+');
      fireEvent.click(incrementButton);
      
      expect(updateQuantity).toHaveBeenCalledWith('1', 3);
    });

    test('can remove items from cart', () => {
      const { removeFromCart } = mockCartContext;
      renderComponent(Checkout, { cartItems: mockCartItems });
      
      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);
      
      expect(removeFromCart).toHaveBeenCalledWith('1');
    });

    test('places order successfully', async () => {
      renderComponent(Checkout, { 
        cartItems: mockCartItems, 
        total: 19.98,
        clearCart: vi.fn() 
      });
      
      const placeOrderButton = screen.getByText('Place Order');
      fireEvent.click(placeOrderButton);
      
      await waitFor(() => {
        expect(mockCartContext.clearCart).toHaveBeenCalled();
      });
    });
  });
});