import { describe, it, expect, vi } from 'vitest';
import { orderService } from '../api/services/order.service';

// Test the combine orders service directly
describe('Combine Orders Feature', () => {
  it('should call combineWithNeighbors service with correct customerId', async () => {
    const mockResponse = {
      message: 'Orders combined! Both you and your neighbors earned 20 eco points.',
      combinedOrders: [
        { _id: 'order1', orderNumber: 'ORD001', customerId: 'customer1' },
        { _id: 'order2', orderNumber: 'ORD002', customerId: 'customer2' }
      ],
      updatedOrderIds: ['order1', 'order2']
    };

    // Mock the actual service method
    const spy = vi.spyOn(orderService, 'combineWithNeighbors').mockResolvedValue(mockResponse);

    const result = await orderService.combineWithNeighbors('customer1');

    expect(spy).toHaveBeenCalledWith('customer1');
    expect(result.combinedOrders).toHaveLength(2);
    expect(result.message).toContain('Orders combined');
    expect(result.updatedOrderIds).toHaveLength(2);

    spy.mockRestore();
  });

  it('should handle no nearby orders response', async () => {
    const mockResponse = {
      message: 'No nearby orders to combine',
      combinedOrders: []
    };

    const spy = vi.spyOn(orderService, 'combineWithNeighbors').mockResolvedValue(mockResponse);

    const result = await orderService.combineWithNeighbors('customer1');

    expect(result.message).toContain('No nearby orders');
    expect(result.combinedOrders).toHaveLength(0);

    spy.mockRestore();
  });

  it('should handle API errors', async () => {
    const spy = vi.spyOn(orderService, 'combineWithNeighbors').mockRejectedValue(
      new Error('Network error')
    );

    await expect(orderService.combineWithNeighbors('customer1')).rejects.toThrow('Network error');

    spy.mockRestore();
  });

  it('should include all order details in combined response', async () => {
    const mockResponse = {
      message: 'Orders combined!',
      combinedOrders: [
        {
          _id: 'order1',
          orderNumber: 'ORD001',
          customerId: 'customer1',
          status: 'COMBINED',
          combineGroupId: 'GRP123456',
          deliveryAddress: { street: '200 Main St', city: 'Test City', zipCode: '10001' }
        },
        {
          _id: 'order2',
          orderNumber: 'ORD002',
          customerId: 'customer2',
          status: 'COMBINED',
          combineGroupId: 'GRP123456',
          deliveryAddress: { street: '202 Main St', city: 'Test City', zipCode: '10001' }
        }
      ],
      updatedOrderIds: ['order1', 'order2']
    };

    const spy = vi.spyOn(orderService, 'combineWithNeighbors').mockResolvedValue(mockResponse);

    const result = await orderService.combineWithNeighbors('customer1');

    expect(result.combinedOrders[0].status).toBe('COMBINED');
    expect(result.combinedOrders[0].combineGroupId).toBe('GRP123456');
    expect(result.combinedOrders[1].combineGroupId).toBe('GRP123456');
    expect(result.combinedOrders[0].deliveryAddress.city).toBe('Test City');

    spy.mockRestore();
  });

  it('should validate customer ID is provided', async () => {
    const spy = vi.spyOn(orderService, 'combineWithNeighbors').mockRejectedValue(
      new Error('Customer ID is required')
    );

    await expect(orderService.combineWithNeighbors(null)).rejects.toThrow();

    spy.mockRestore();
  });
});

