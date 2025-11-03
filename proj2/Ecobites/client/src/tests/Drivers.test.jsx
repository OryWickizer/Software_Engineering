import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Drivers from '../drivers/Drivers.jsx';

vi.mock('../api/services/order.service', () => ({
  orderService: {
    getAvailableForDrivers: vi.fn(),
    getByRole: vi.fn(),
    updateStatus: vi.fn()
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: { _id: 'drv1', role: 'driver', name: 'Dan', vehicleType: 'EV', rewardPoints: 0 },
    setUser: vi.fn(),
    isAuthenticated: true,
    refreshUser: vi.fn()
  })
}));

describe('Drivers', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders available combined order with badge and points (not NaN)', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1', status: 'COMBINED', combineGroupId: 'GRP123', restaurant: 'Resto',
        pickupAddress: { street: '1 Main' }, deliveryAddress: { street: '2 Main' },
        customerName: 'Alice', customerPhone: '123', ecoRoute: true
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Combined Delivery/i)).toBeInTheDocument();
    // points label should render with a number
    const pts = await screen.findByText(/\+\d+ pts/);
    expect(pts.textContent).toMatch(/\+\d+ pts/);
  });
});
