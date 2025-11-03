import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderStatus from '../customers/OrderStatus.jsx';

vi.mock('../api/services/order.service', () => ({
  orderService: {
    getByRole: vi.fn()
  }
}));

vi.mock('../api/services/auth.service', () => ({
  authService: {
    getCurrentUser: () => ({ _id: 'cust1', role: 'customer', name: 'Alice' })
  }
}));

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

    expect(await screen.findByText(/Order History/i)).toBeInTheDocument();
    expect(await screen.findByText(/ORD000001/)).toBeInTheDocument();
    expect(screen.getByText(/Delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD000002/)).toBeInTheDocument();
    expect(screen.getByText(/Preparing/i)).toBeInTheDocument();
  });
});
