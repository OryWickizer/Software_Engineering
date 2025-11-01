/*
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Drivers from '../pages/Drivers';
import '@testing-library/jest-dom';

describe('Drivers Component', () => {
  beforeEach(() => {
    render(<Drivers />);
  });

  test('renders driver profile information', () => {
    expect(screen.getByText('John Driver')).toBeInTheDocument();
    expect(screen.getByText(/EV Driver/)).toBeInTheDocument();
    expect(screen.getByText('Eco Pioneer')).toBeInTheDocument();
  });

  test('displays driver statistics correctly', () => {
    const statsContainer = screen.getByTestId('driver-stats');
    expect(statsContainer).toHaveTextContent('156 Deliveries');
    expect(statsContainer).toHaveTextContent('45 Community Orders');
    expect(statsContainer).toHaveTextContent(/2.3 tons CO2/);
  });

  test('displays rewards information correctly', () => {
    expect(screen.getByText('450 pts')).toBeInTheDocument();
    expect(screen.getByText(/50 pts to Sustainability Champion/)).toBeInTheDocument();
    expect(screen.getByText('x1.5')).toBeInTheDocument(); // EV Bonus
    expect(screen.getByText('x2')).toBeInTheDocument(); // Community Bonus
    expect(screen.getByText('x1.2')).toBeInTheDocument(); // Eco-Route Bonus
  });

  test('switches between order tabs correctly', () => {
    // Test "Available Orders" tab
    const availableTab = screen.getByRole('button', { name: /Available Orders/i });
    fireEvent.click(availableTab);
    expect(screen.getAllByRole('button', { name: /Accept Order/i })).toHaveLength(2);
    
    // Test "Past Orders" tab
    const pastTab = screen.getByRole('button', { name: /Past Orders/i });
    fireEvent.click(pastTab);
    
    // Check for "Delivered" status badges in the Past Orders section
    const deliveredStatuses = screen.getAllByText('Delivered');
    expect(deliveredStatuses.length).toBeGreaterThan(0);
    expect(deliveredStatuses[0]).toBeVisible();
  });

  test('displays order details correctly', () => {
    const availableTab = screen.getByRole('button', { name: /Available Orders/i });
    fireEvent.click(availableTab);
    
    expect(screen.getByText('Fresh Foods')).toBeInTheDocument();
    expect(screen.getByText('2.5km')).toBeInTheDocument();
    expect(screen.getByText('$18-22')).toBeInTheDocument();
  });

  test('switches to reviews section and displays content', () => {
    const reviewsTab = screen.getByRole('button', { name: /Reviews & Insights/i });
    fireEvent.click(reviewsTab);
    
    expect(screen.getByText('Recent Reviews')).toBeInTheDocument();
    expect(screen.getByText('Performance Insights')).toBeInTheDocument();
  });

  test('displays community orders with special indicators', () => {
    // Click "Available Orders" tab
    const availableTab = screen.getByRole('button', { name: /Available Orders/i });
    fireEvent.click(availableTab);
    
    expect(screen.getByText('Organic Bites')).toBeInTheDocument();
    expect(screen.getByText(/👥/)).toBeInTheDocument();
  });

  test('displays order points correctly', () => {
    // Switch to available orders
    const availableTab = screen.getByRole('button', { name: /Available Orders/i });
    fireEvent.click(availableTab);
    
    expect(screen.getByText(/\+36 pts/)).toBeInTheDocument();
    expect(screen.getByText(/\+162 pts/)).toBeInTheDocument();
  });
});
*/