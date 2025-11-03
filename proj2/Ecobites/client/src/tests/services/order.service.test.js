import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { orderService } from '../../api/services/order.service';

vi.mock('../../api/axios.config');

describe('orderService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('create calls POST /orders', async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    const res = await orderService.create({ foo: 'bar' });
    expect(api.post).toHaveBeenCalledWith('/orders', { foo: 'bar' });
    expect(res).toEqual({ ok: true });
  });

  it('getByRole calls GET /orders/:role/:userId', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    const res = await orderService.getByRole('customer', '123');
    expect(api.get).toHaveBeenCalledWith('/orders/customer/123');
    expect(res).toEqual([{ id: 1 }]);
  });

  it('getById calls GET /orders/detail/:orderId', async () => {
    api.get.mockResolvedValue({ data: { id: 'o1' } });
    const res = await orderService.getById('o1');
    expect(api.get).toHaveBeenCalledWith('/orders/detail/o1');
    expect(res).toEqual({ id: 'o1' });
  });

  it('updateStatus calls PATCH /orders/:id/status', async () => {
    api.patch.mockResolvedValue({ data: { status: 'READY' } });
    const res = await orderService.updateStatus('o1', { status: 'READY' });
    expect(api.patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'READY' });
    expect(res).toEqual({ status: 'READY' });
  });

  it('getAvailableForDrivers calls GET /orders/available/drivers', async () => {
    api.get.mockResolvedValue({ data: [] });
    const res = await orderService.getAvailableForDrivers();
    expect(api.get).toHaveBeenCalledWith('/orders/available/drivers');
    expect(res).toEqual([]);
  });

  it('cancelOrder calls PATCH /orders/:id/status with CANCELLED', async () => {
    api.patch.mockResolvedValue({ data: { status: 'CANCELLED' } });
    const res = await orderService.cancelOrder('o1');
    expect(api.patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'CANCELLED', updatedBy: 'customer' });
    expect(res).toEqual({ status: 'CANCELLED' });
  });

  it('combineWithNeighbors calls POST /orders/combine', async () => {
    api.post.mockResolvedValue({ data: { message: 'ok' } });
    const res = await orderService.combineWithNeighbors('c1', 750);
    expect(api.post).toHaveBeenCalledWith('/orders/combine', { customerId: 'c1', radiusMeters: 750 });
    expect(res).toEqual({ message: 'ok' });
  });
});
