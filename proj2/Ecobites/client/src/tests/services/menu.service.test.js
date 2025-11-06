import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { menuService } from '../../api/services/menu.service';

vi.mock('../../api/axios.config');

describe('menuService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getByRestaurant', () => {
    it('calls GET /menu/restaurant/:restaurantId', async () => {
      const menuItems = [{ id: '1', name: 'Pizza' }, { id: '2', name: 'Pasta' }];
      api.get.mockResolvedValue({ data: menuItems });

      const res = await menuService.getByRestaurant('rest123');

      expect(api.get).toHaveBeenCalledWith('/menu/restaurant/rest123');
      expect(res).toEqual(menuItems);
    });

    it('returns empty array when restaurant has no menu items', async () => {
      api.get.mockResolvedValue({ data: [] });

      const res = await menuService.getByRestaurant('rest456');

      expect(res).toEqual([]);
    });
  });

  describe('getSeasonalByRestaurant', () => {
    it('calls GET /menu/restaurant/:restaurantId/seasonal', async () => {
      const seasonalItems = [{ id: '1', name: 'Pumpkin Pie', isSeasonal: true }];
      api.get.mockResolvedValue({ data: seasonalItems });

      const res = await menuService.getSeasonalByRestaurant('rest123');

      expect(api.get).toHaveBeenCalledWith('/menu/restaurant/rest123/seasonal');
      expect(res).toEqual(seasonalItems);
    });

    it('returns seasonal items for specific restaurant', async () => {
      const items = [
        { id: '1', name: 'Summer Salad', isSeasonal: true },
        { id: '2', name: 'Winter Soup', isSeasonal: true }
      ];
      api.get.mockResolvedValue({ data: items });

      const res = await menuService.getSeasonalByRestaurant('rest789');

      expect(res).toHaveLength(2);
    });
  });

  describe('getSeasonalAll', () => {
    it('calls GET /menu/seasonal', async () => {
      const allSeasonal = [{ id: '1', name: 'Holiday Special' }];
      api.get.mockResolvedValue({ data: allSeasonal });

      const res = await menuService.getSeasonalAll();

      expect(api.get).toHaveBeenCalledWith('/menu/seasonal');
      expect(res).toEqual(allSeasonal);
    });

    it('returns all seasonal items across restaurants', async () => {
      api.get.mockResolvedValue({ data: [] });

      const res = await menuService.getSeasonalAll();

      expect(res).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls POST /menu with menu data', async () => {
      const menuData = { name: 'Burger', price: 12.99, restaurantId: 'rest1' };
      api.post.mockResolvedValue({ data: { id: 'menu1', ...menuData } });

      const res = await menuService.create(menuData);

      expect(api.post).toHaveBeenCalledWith('/menu', menuData);
      expect(res.name).toBe('Burger');
    });

    it('creates menu item with all fields', async () => {
      const menuData = {
        name: 'Deluxe Pizza',
        price: 18.99,
        description: 'A delicious pizza',
        restaurantId: 'rest1',
        category: 'Main',
        isAvailable: true
      };
      api.post.mockResolvedValue({ data: { id: 'menu2', ...menuData } });

      const res = await menuService.create(menuData);

      expect(res.description).toBe('A delicious pizza');
      expect(res.isAvailable).toBe(true);
    });
  });

  describe('update', () => {
    it('calls PUT /menu/:id with updated data', async () => {
      const menuData = { name: 'Updated Burger', price: 14.99 };
      api.put.mockResolvedValue({ data: { id: 'menu1', ...menuData } });

      const res = await menuService.update('menu1', menuData);

      expect(api.put).toHaveBeenCalledWith('/menu/menu1', menuData);
      expect(res.price).toBe(14.99);
    });

    it('updates menu item successfully', async () => {
      const updated = { name: 'Premium Pizza', price: 22.99 };
      api.put.mockResolvedValue({ data: { id: 'menu3', ...updated } });

      const res = await menuService.update('menu3', updated);

      expect(res.name).toBe('Premium Pizza');
    });
  });

  describe('delete', () => {
    it('calls DELETE /menu/:id', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const res = await menuService.delete('menu1');

      expect(api.delete).toHaveBeenCalledWith('/menu/menu1');
      expect(res.success).toBe(true);
    });

    it('deletes menu item and returns confirmation', async () => {
      api.delete.mockResolvedValue({ data: { message: 'Item deleted' } });

      const res = await menuService.delete('menu5');

      expect(res.message).toBe('Item deleted');
    });
  });

  describe('toggleAvailability', () => {
    it('calls PATCH /menu/:id with isAvailable flag', async () => {
      api.patch.mockResolvedValue({ data: { id: 'menu1', isAvailable: false } });

      const res = await menuService.toggleAvailability('menu1', false);

      expect(api.patch).toHaveBeenCalledWith('/menu/menu1', { isAvailable: false });
      expect(res.isAvailable).toBe(false);
    });

    it('sets item as available', async () => {
      api.patch.mockResolvedValue({ data: { id: 'menu2', isAvailable: true } });

      const res = await menuService.toggleAvailability('menu2', true);

      expect(res.isAvailable).toBe(true);
    });

    it('sets item as unavailable', async () => {
      api.patch.mockResolvedValue({ data: { id: 'menu3', isAvailable: false } });

      const res = await menuService.toggleAvailability('menu3', false);

      expect(res.isAvailable).toBe(false);
    });
  });
});
