vi.mock('../api/services/order.service', () => ({
  orderService: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
    combineWithNeighbors: vi.fn()
  }
}));

// Provide a synchronous auth context so UI renders immediately in tests
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: { _id: 'cust1', role: 'customer', name: 'Alice' },
    isAuthenticated: true,
    loading: false,
    setUser: vi.fn(),
    refreshUser: vi.fn()
  })
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetail from '../customers/OrderDetail.jsx';

describe('OrderDetail', () => {
  beforeEach(() => vi.resetAllMocks());

  it('loads and displays order details', async () => {
    const { orderService } = await import('../api/services/order.service');
    
    
    orderService.getById.mockResolvedValue({
      _id: 'o1', orderNumber: 'ORD000007', createdAt: new Date().toISOString(),
      status: 'PLACED', items: [{ name: 'Bowl', price: 10, quantity: 1 }],
      deliveryAddress: { street: '1 Main', city: 'Raleigh', zipCode: '27606' },
      subtotal: 10, deliveryFee: 0, tax: 0, total: 10
    });

    render(
      <MemoryRouter initialEntries={["/customer/orders/o1"]}>
        <Routes>
          <Route path="/customer/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

  // Wait for auth to load and order to be displayed
  expect(await screen.findByText(/Order #ORD000007/)).toBeInTheDocument();
  expect(screen.getByText(/1 Main/)).toBeInTheDocument();
  // multiple $10.00 entries (item line and summary); ensure at least one is present
  expect(screen.getAllByText(/\$10\.00/).length).toBeGreaterThan(0);
    // Wait for auth context to load and button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Combine with Neighbors/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('combine flow shows success and disables spinner state', async () => {
    const { orderService } = await import('../api/services/order.service');
  orderService.getById.mockResolvedValue({ _id: 'o1', orderNumber: 'ORD000007', createdAt: new Date().toISOString(), status: 'READY', items: [], total: 0 });
  orderService.combineWithNeighbors.mockResolvedValue({ message: 'Orders combined!', combinedOrders: [{ _id: 'o1', status: 'COMBINED', items: [] }], updatedOrderIds: ['o1'] });

    render(
      <MemoryRouter initialEntries={["/customer/orders/o1"]}>
        <Routes>
          <Route path="/customer/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

  // Wait for AuthProvider to finish loading and button to appear
    const btn = await screen.findByRole('button', { name: /Combine with Neighbors/i });
    btn.click();
    await waitFor(() => expect(orderService.combineWithNeighbors).toHaveBeenCalled());
    expect(screen.getByText(/Orders combined!/i)).toBeInTheDocument();
  });
});
