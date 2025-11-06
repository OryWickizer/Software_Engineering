vi.mock('../api/services/order.service', () => ({
  orderService: {
    getByRole: vi.fn()
  }
}));

// Provide a synchronous and stable auth context with a customer for this test
const mockAuthCtx = {
  user: { _id: 'cust1', role: 'customer', name: 'Alice' },
  isAuthenticated: true,
  loading: false,
  setUser: vi.fn(),
  refreshUser: vi.fn()
};
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => mockAuthCtx
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderStatus from '../customers/OrderStatus.jsx';

describe('OrderStatus', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders orders and status badge', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getByRole.mockResolvedValue([
      { _id: 'o1', orderNumber: 'ORD000001', createdAt: new Date().toISOString(), status: 'DELIVERED', items: [{ name: 'Bowl', quantity: 1 }], total: 10, restaurant: 'Resto' },
      { _id: 'o2', orderNumber: 'ORD000002', createdAt: new Date().toISOString(), status: 'PREPARING', items: [{ name: 'Soup', quantity: 2 }], total: 12, restaurant: 'Resto' }
    ]);

    render(
      <MemoryRouter>
        <OrderStatus />
      </MemoryRouter>
    );

    // Wait for the data fetch to occur
    await waitFor(() => {
      expect(orderService.getByRole).toHaveBeenCalled();
    });
    // Then verify orders rendered (non-flaky assertions)
    await waitFor(() => {
      const headers = screen.getAllByText(/Order #/);
      expect(headers.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
      expect(screen.getByText(/Preparing Food/i)).toBeInTheDocument();
    });
  });
});
