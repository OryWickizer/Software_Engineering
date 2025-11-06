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

  // Test 12: Accepts combined group orders (multiple orders at once)
  it('accepts combined group orders and moves all to current tab', async () => {
    const { orderService } = await import('../api/services/order.service');
    const combinedOrders = [
      {
        _id: 'o1',
        status: 'COMBINED',
        combineGroupId: 'GRP456',
        restaurant: 'Pizza Palace',
        pickupAddress: { street: '1 Main' },
        deliveryAddress: { street: '2 Oak' }
      },
      {
        _id: 'o2',
        status: 'COMBINED',
        combineGroupId: 'GRP456',
        restaurant: 'Pizza Palace',
        pickupAddress: { street: '1 Main' },
        deliveryAddress: { street: '3 Elm' }
      },
      {
        _id: 'o3',
        status: 'COMBINED',
        combineGroupId: 'GRP456',
        restaurant: 'Pizza Palace',
        pickupAddress: { street: '1 Main' },
        deliveryAddress: { street: '4 Pine' }
      }
    ];

    orderService.getAvailableForDrivers.mockResolvedValue(combinedOrders);
    orderService.getByRole.mockResolvedValue([]);
    orderService.updateStatus.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    // Find and click the first accept group button (there are multiple for the same group)
    const acceptGroupButtons = await screen.findAllByRole('button', { name: /✓ Accept Group/i });
    await userEvent.click(acceptGroupButtons[0]);

    // Verify all three orders were updated
    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledTimes(3);
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'DRIVER_ASSIGNED',
        driverId: 'drv1'
      });
      expect(orderService.updateStatus).toHaveBeenCalledWith('o2', {
        status: 'DRIVER_ASSIGNED',
        driverId: 'drv1'
      });
      expect(orderService.updateStatus).toHaveBeenCalledWith('o3', {
        status: 'DRIVER_ASSIGNED',
        driverId: 'drv1'
      });
    });
  });

  // Test 13: Calculates reward points correctly with EV multiplier
  it('calculates reward points with EV multiplier for eco-route orders', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1',
        restaurant: 'Eco Cafe',
        pickupAddress: { street: '1 Main' },
        deliveryAddress: { street: '2 Main' },
        driverRewardPoints: 10,
        ecoRoute: true,
        type: 'community'
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    // Base: 10 pts, EV multiplier: 1.5, Community multiplier: 2.0, Eco-route multiplier: 1.2
    // Expected: 10 * 1.5 * 2.0 * 1.2 = 36 pts
    expect(await screen.findByText(/\+36 pts/)).toBeInTheDocument();
  });

  // Test 14: Handles geolocation success with accurate coordinates
  it('successfully retrieves and displays driver location with coordinates', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Test Restaurant',
      customerName: 'John',
      customerPhone: '555-1234',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);

    // Mock successful geolocation
    const mockPosition = {
      coords: {
        latitude: 35.7796,
        longitude: -78.6382,
        accuracy: 10
      }
    };

    const mockGetCurrentPosition = vi.fn((success) => {
      success(mockPosition);
    });

    global.navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition
    };

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
      expect(screen.getByText(/35.779600/)).toBeInTheDocument();
      expect(screen.getByText(/-78.638200/)).toBeInTheDocument();
      expect(screen.getByText(/10.00 meters/)).toBeInTheDocument();
    });
  });

  // Test 15: Handles geolocation permission denied error
  it('displays error message when geolocation permission is denied', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Test Restaurant',
      customerName: 'John',
      customerPhone: '555-1234',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);

    // Mock geolocation error
    const mockGetCurrentPosition = vi.fn((success, error) => {
      error({ message: 'User denied Geolocation' });
    });

    global.navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition
    };

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
      expect(screen.getByText(/User denied Geolocation/i)).toBeInTheDocument();
    });
  });

  // Test 16: Updates user context and calls refreshUser when delivery is completed with rewards
  it('updates user context and calls refreshUser when delivery is completed with rewards', async () => {
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
      driverRewardPoints: 30
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
      // Verify setUser was called to update reward points
      expect(mockSetUser).toHaveBeenCalled();
      const setUserCall = mockSetUser.mock.calls[0][0];
      const updatedUser = setUserCall({ _id: 'drv1', role: 'driver', name: 'Dan', vehicleType: 'EV', rewardPoints: 150 });
      expect(updatedUser.rewardPoints).toBe(180); // 150 + 30

      // Verify refreshUser was called
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  // Test 17: Handles API error when accepting order
  it('handles error gracefully when order acceptance API call fails', async () => {
    const { orderService } = await import('../api/services/order.service');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1',
        restaurant: 'Error Restaurant',
        pickupAddress: { street: '100 Main' },
        deliveryAddress: { street: '200 Oak' }
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);
    orderService.updateStatus.mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const acceptButton = await screen.findByRole('button', { name: /✓ Accept/i });
    await userEvent.click(acceptButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error accepting order:', expect.any(Error));
    });

    // Order should still be in available list
    expect(screen.getByText('Error Restaurant')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // Test 18: Auto-switches to current tab when order is accepted
  it('automatically switches to current tab after accepting an order', async () => {
    const { orderService } = await import('../api/services/order.service');
    const testOrder = {
      _id: 'o1',
      restaurant: 'Auto Switch Pizza',
      pickupAddress: { street: '100 Main' },
      deliveryAddress: { street: '200 Oak' },
      customerName: 'Jane Smith',
      customerPhone: '555-1234',
      status: 'PENDING'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([testOrder]);
    orderService.getByRole.mockResolvedValue([]);
    orderService.updateStatus.mockResolvedValue({ ...testOrder, status: 'DRIVER_ASSIGNED' });

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    // Should start on available tab
    const availableTab = await screen.findByRole('button', { name: /Available Orders/i });
    expect(availableTab).toHaveClass('bg-emerald-600');

    const acceptButton = await screen.findByRole('button', { name: /✓ Accept/i });
    await userEvent.click(acceptButton);

    // Should auto-switch to current tab
    await waitFor(() => {
      const currentTab = screen.getByRole('button', { name: /Current Orders/i });
      expect(currentTab).toHaveClass('bg-emerald-600');
    });
  });

  // Test 19: Handles order with complex address objects
  it('correctly formats and displays complex address objects', async () => {
    const { orderService } = await import('../api/services/order.service');
    orderService.getAvailableForDrivers.mockResolvedValue([
      {
        _id: 'o1',
        restaurant: 'Address Test Restaurant',
        pickupAddress: {
          street: '123 Main Street',
          city: 'Raleigh',
          zipCode: '27601'
        },
        deliveryAddress: {
          street: '456 Oak Avenue',
          city: 'Durham',
          zip: '27701'
        }
      }
    ]);
    orderService.getByRole.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    expect(await screen.findByText('Address Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText(/123 Main Street, Raleigh, 27601/)).toBeInTheDocument();
    expect(screen.getByText(/456 Oak Avenue, Durham, 27701/)).toBeInTheDocument();
  });

  // Test 20: Tests multiple order status updates in sequence
  it('calls API correctly for multiple status updates in sequence', async () => {
    const { orderService } = await import('../api/services/order.service');
    const testOrder = {
      _id: 'o1',
      orderNumber: '99999',
      restaurant: 'Lifecycle Restaurant',
      pickupAddress: { street: '100 Main' },
      deliveryAddress: { street: '200 Oak' },
      customerName: 'Test Customer',
      customerPhone: '555-0000',
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([testOrder]);
    orderService.updateStatus
      .mockResolvedValueOnce({ ...testOrder, status: 'OUT_FOR_DELIVERY' })
      .mockResolvedValueOnce({ ...testOrder, status: 'DELIVERED', driverRewardPoints: 20 });

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    // Wait for current tab to be active and show the order
    const currentTab = await screen.findByRole('button', { name: /Current Orders/i });
    await userEvent.click(currentTab);

    // Step 1: Mark as out for delivery
    const outForDeliveryButtons = await screen.findAllByRole('button', { name: /Out for delivery/i });
    await userEvent.click(outForDeliveryButtons[0]);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'OUT_FOR_DELIVERY',
        driverId: 'drv1'
      });
    });

    // Step 2: Complete delivery
    const completeButtons = await screen.findAllByRole('button', { name: /Complete Delivery/i });
    await userEvent.click(completeButtons[0]);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('o1', {
        status: 'DELIVERED',
        driverId: 'drv1'
      });
      expect(orderService.updateStatus).toHaveBeenCalledTimes(2);
    });
  });

  // Test 21: Tests refreshing location in modal
  it('allows refreshing location multiple times in location modal', async () => {
    const { orderService } = await import('../api/services/order.service');
    const currentOrder = {
      _id: 'o1',
      orderNumber: '12345',
      restaurant: 'Refresh Test',
      customerName: 'John',
      customerPhone: '555-1234',
      pickupAddress: { street: '1 Main' },
      deliveryAddress: { street: '2 Main' },
      status: 'DRIVER_ASSIGNED'
    };

    orderService.getAvailableForDrivers.mockResolvedValue([]);
    orderService.getByRole.mockResolvedValue([currentOrder]);

    let callCount = 0;
    const mockGetCurrentPosition = vi.fn((success) => {
      callCount++;
      success({
        coords: {
          latitude: 35.7796 + (callCount * 0.001),
          longitude: -78.6382 + (callCount * 0.001),
          accuracy: 10
        }
      });
    });

    global.navigator.geolocation = {
      getCurrentPosition: mockGetCurrentPosition
    };

    render(
      <MemoryRouter>
        <Drivers />
      </MemoryRouter>
    );

    const currentTab = await screen.findByRole('button', { name: /Current Orders/i });
    await userEvent.click(currentTab);

    const locationButton = await screen.findByRole('button', { name: /📍 Share Location/i });
    await userEvent.click(locationButton);

    // Wait for initial location to be displayed
    await waitFor(() => {
      expect(screen.getByText('Driver Location')).toBeInTheDocument();
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Verify the geolocation was called
    expect(mockGetCurrentPosition).toHaveBeenCalled();

    // Find refresh button
    const refreshButton = await screen.findByRole('button', { name: /🔄 Refresh Location/i });
    await userEvent.click(refreshButton);

    // Wait for location to be refreshed
    await waitFor(() => {
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2);
    }, { timeout: 2000 });
  });
});
