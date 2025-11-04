import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Drivers from '../drivers/Drivers.jsx';
import userEvent from '@testing-library/user-event';

vi.mock('../api/services/order.service', () => ({
  orderService: {
    getAvailableForDrivers: vi.fn(),
    getByRole: vi.fn(),
    updateStatus: vi.fn()
  }
}));

// Default mock for authenticated driver
const mockSetUser = vi.fn();
const mockRefreshUser = vi.fn();
let mockAuthContext = {
  user: { _id: 'drv1', role: 'driver', name: 'Dan', vehicleType: 'EV', rewardPoints: 150 },
  setUser: mockSetUser,
  isAuthenticated: true,
  refreshUser: mockRefreshUser
};

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => mockAuthContext
}));

describe('Drivers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset mock context to default driver
    mockAuthContext = {
      user: { _id: 'drv1', role: 'driver', name: 'Dan', vehicleType: 'EV', rewardPoints: 150 },
      setUser: mockSetUser,
      isAuthenticated: true,
      refreshUser: mockRefreshUser
    };
  });

  // Test 1: Keep existing test
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

  // Test 2: Renders driver profile information correctly
  it('renders driver profile with name, rating, and reward points', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dan')).toBeInTheDocument();
      expect(screen.getByText(/150 pts/i)).toBeInTheDocument();
      expect(screen.getByText(/EV Driver/i)).toBeInTheDocument();
    });
  });

  // Test 3: Displays available orders tab
  it('displays available orders when available tab is active', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1',
        restaurant: 'Test Restaurant',
        pickupAddress: { street: '123 Main St' },
        deliveryAddress: { street: '456 Oak Ave' },
        customerName: 'John Doe',
        distance: '2.5 km',
        estimate: '15 mins'
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    expect(await screen.findByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
  });

  // Test 4: Handles accepting an order
  it('accepts an order and moves it to current tab', async () => {
    const { orderService } = await import('../api/services/order.service');
    const testOrder = {
      _id: 'o1',
      restaurant: 'Pizza Place',
      pickupAddress: { street: '100 Main' },
      deliveryAddress: { street: '200 Oak' },
      customerName: 'Jane Smith',
      customerPhone: '555-1234'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([testOrder]);
    orderService.getByRole.mockResolvedValue([]);
    orderService.updateStatus.mockResolvedValue({ ...testOrder, status: 'DRIVER_ASSIGNED' });

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const acceptButton = await screen.findByRole('button', { name: /✓ Accept/i });
    await userEvent.click(acceptButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'DRIVER_ASSIGNED',
        driverId: 'drv1'
      });
    });
  });

  // Test 5: Handles rejecting an order
  it('rejects an order and removes it from available list', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1',
        restaurant: 'Burger Joint',
        pickupAddress: { street: '100 Main' },
        deliveryAddress: { street: '200 Oak' }
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    // Verify the order is initially displayed
    expect(await screen.findByText('Burger Joint')).toBeInTheDocument();

    const rejectButton = await screen.findByRole('button', { name: /✗ Reject/i });
    await userEvent.click(rejectButton);

    // After rejecting, the order should be removed from the available list
    await waitFor(() => {
      expect(screen.queryByText('Burger Joint')).not.toBeInTheDocument();
    });
  });

  // Test 6: Updates order status to OUT_FOR_DELIVERY
  it('updates order status to out for delivery', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Sushi Bar',
      customerName: 'Bob',
      customerPhone: '555-5678',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);
    orderService.updateStatus.mockResolvedValue({ ...currentOrder, status: 'OUT_FOR_DELIVERY' });

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const currentTab = await screen.findByRole('button', { name: /Current Orders/i });
    await userEvent.click(currentTab);

    const outForDeliveryButton = await screen.findByRole('button', { name: /Out for delivery/i });
    await userEvent.click(outForDeliveryButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'OUT_FOR_DELIVERY',
        driverId: 'drv1'
      });
    });
  });

  // Test 7: Updates order status to DELIVERED
  it('updates order status to delivered and updates reward points', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Taco Stand',
      customerName: 'Alice',
      customerPhone: '555-9999',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'OUT_FOR_DELIVERY'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);
    orderService.updateStatus.mockResolvedValue({
      ...currentOrder,
      status: 'DELIVERED',
      driverRewardPoints: 25
    });

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const currentTab = await screen.findByRole('button', { name: /Current Orders/i });
    await userEvent.click(currentTab);

    const completeButton = await screen.findByRole('button', { name: /Complete Delivery/i });
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'DELIVERED',
        driverId: 'drv1'
      });
      expect(mockSetUser).toHaveBeenCalled();
    });
  });

  // Test 8: Switches tabs between available, current, and past
  it('switches between order tabs correctly', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([
      { _id: 'o1', status: 'DELIVERED', restaurant: 'Past Order', date: '2025-10-22' }
    ]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const pastTab = await screen.findByRole('button', { name: /Past Orders/i });
    await userEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Past Order')).toBeInTheDocument();
    });

    const availableTab = screen.getByRole('button', { name: /Available Orders/i });
    await userEvent.click(availableTab);
  });

  // Test 9: Opens and closes location modal
  it('opens location modal when share location is clicked', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Cafe',
      customerName: 'Charlie',
      customerPhone: '555-1111',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);

    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn()
    };
    global.navigator.geolocation = mockGeolocation;

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const currentTab = await screen.findByRole('button', { name: /Current Orders/i });
    await userEvent.click(currentTab);

    const locationButton = await screen.findByRole('button', { name: /📍 Share Location/i });
    await userEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText('Driver Location')).toBeInTheDocument();
    });
  });

  // Test 10: Displays reviews and insights section
  it('displays reviews and insights when reviews section is active', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const reviewsTab = await screen.findByRole('button', { name: /Reviews & Insights/i });
    await userEvent.click(reviewsTab);

    await waitFor(() => {
      expect(screen.getByText('Recent Reviews')).toBeInTheDocument();
      expect(screen.getByText('Performance Insights')).toBeInTheDocument();
    });
  });

  // Test 11: Shows access denied for non-driver users
  it('shows access denied message for non-driver users', async () => {
    mockAuthContext = {
      user: { _id: 'u1', role: 'customer', name: 'Customer' },
      setUser: mockSetUser,
      isAuthenticated: true,
      refreshUser: mockRefreshUser
    };

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/You must be logged in as a driver/i)).toBeInTheDocument();
    });
  });
});
