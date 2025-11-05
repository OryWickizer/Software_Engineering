import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CustomerOrders from '../restaurants/CustomerOrders';
import { orderService } from '../api/services/order.service';
import { useAuth } from '../hooks/useAuth';

// Mock dependencies
vi.mock('../api/services/order.service');
vi.mock('../hooks/useAuth');

describe('CustomerOrders', () => {
  const mockRestaurantUser = {
    _id: 'restaurant123',
    role: 'restaurant',
    email: 'restaurant@example.com'
  };

  const mockOrders = [
    {
      _id: 'order1',
      customerId: 'customer1',
      customerName: 'John Doe',
      status: 'PLACED',
      items: [
        { name: 'Burger', price: 10, quantity: 2 },
        { name: 'Fries', price: 5, quantity: 1 }
      ],
      specialInstructions: 'No onions',
      createdAt: new Date('2025-01-01T12:00:00Z').toISOString()
    },
    {
      _id: 'order2',
      customerId: 'customer2',
      customerName: 'Jane Smith',
      status: 'ACCEPTED',
      items: [
        { name: 'Pizza', price: 15, quantity: 1 }
      ],
      createdAt: new Date('2025-01-01T13:00:00Z').toISOString()
    },
    {
      _id: 'order3',
      customerId: 'customer3',
      customerName: 'Bob Johnson',
      status: 'CANCELLED',
      items: [
        { name: 'Salad', price: 8, quantity: 1 }
      ],
      createdAt: new Date('2025-01-01T14:00:00Z').toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Component should only fetch orders if user has restaurant role
  test('should only fetch orders for restaurant role users', async () => {
    const nonRestaurantUser = { _id: 'user123', role: 'customer' };
    useAuth.mockReturnValue({ user: nonRestaurantUser });
    orderService.getByRole.mockResolvedValue([]);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(orderService.getByRole).not.toHaveBeenCalled();
    });
  });

  // Test 2: Component should fetch and display orders on mount for restaurant users
  test('should fetch and display orders on mount for restaurant users', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(orderService.getByRole).toHaveBeenCalledWith('restaurant', 'restaurant123');
    });

    // Check if orders are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  // Test 3: Status mapping - PLACED/PENDING/RECEIVED should map to 'incoming' category
  test('should correctly map PLACED/PENDING/RECEIVED statuses to incoming category', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    const placedOrder = { ...mockOrders[0], status: 'PLACED' };
    orderService.getByRole.mockResolvedValue([placedOrder]);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should appear in incoming tab (default)
    expect(screen.getByText('PLACED')).toBeInTheDocument();
  });

  // Test 4: Status mapping - ACCEPTED/PREPARING/READY statuses should map to 'accepted' category
  test('should correctly map ACCEPTED/PREPARING/READY statuses to accepted category', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    const acceptedOrder = { ...mockOrders[1], status: 'ACCEPTED' };
    orderService.getByRole.mockResolvedValue([acceptedOrder]);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(orderService.getByRole).toHaveBeenCalled();
    });

    // Switch to accepted tab
    const acceptedTab = screen.getByRole('button', { name: /accepted/i });
    fireEvent.click(acceptedTab);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
  });

  // Test 5: Tab switching should filter orders by category
  test('should filter orders by category when switching tabs', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Initially on incoming tab - should show order1
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

    // Switch to accepted tab
    const acceptedTab = screen.getByRole('button', { name: /accepted/i });
    fireEvent.click(acceptedTab);

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Switch to rejected tab
    const rejectedTab = screen.getByRole('button', { name: /rejected/i });
    fireEvent.click(rejectedTab);

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  // Test 6: Accepting an order should update its status to ACCEPTED
  test('should update order status to ACCEPTED when accept button is clicked', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);
    const updatedOrder = { ...mockOrders[0], status: 'ACCEPTED' };
    orderService.updateStatus.mockResolvedValue(updatedOrder);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: 'Accept' });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('order1', { status: 'ACCEPTED' });
    });
  });

  // Test 7: Rejecting an order should update its status to CANCELLED
  test('should update order status to CANCELLED when reject button is clicked', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);
    const updatedOrder = { ...mockOrders[0], status: 'CANCELLED' };
    orderService.updateStatus.mockResolvedValue(updatedOrder);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: 'Reject' });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('order1', { status: 'CANCELLED' });
    });
  });

  // Test 8: Marking an order ready should update its status to READY
  test('should update order status to READY when mark ready button is clicked', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);
    const updatedOrder = { ...mockOrders[1], status: 'READY' };
    orderService.updateStatus.mockResolvedValue(updatedOrder);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(orderService.getByRole).toHaveBeenCalled();
    });

    // Switch to accepted tab
    const acceptedTab = screen.getByRole('button', { name: /accepted/i });
    fireEvent.click(acceptedTab);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const markReadyButton = screen.getByRole('button', { name: /mark ready/i });
    fireEvent.click(markReadyButton);

    await waitFor(() => {
      expect(orderService.updateStatus).toHaveBeenCalledWith('order2', { status: 'READY' });
    });
  });

  // Test 9: Order total calculation should correctly sum item prices and quantities
  test('should correctly calculate order total from items', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockResolvedValue(mockOrders);

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Order 1: 2 Burgers at $10 + 1 Fries at $5 = $25
    expect(screen.getByText('Total: $25.00')).toBeInTheDocument();
  });

  // Test 10: Component should handle and display errors when fetching orders fails
  test('should display error message when fetching orders fails', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    const errorMessage = 'Failed to fetch orders';
    orderService.getByRole.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });

    render(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  // Test 11 (Bonus): Component should display loading state while fetching orders
  test('should display loading state while fetching orders', async () => {
    useAuth.mockReturnValue({ user: mockRestaurantUser });
    orderService.getByRole.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CustomerOrders />);

    expect(screen.getByText(/Loading orders/i)).toBeInTheDocument();
  });
});
