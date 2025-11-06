import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { restaurantService } from '../../api/services/restaurant.service';

vi.mock('../../api/axios.config');

describe('restaurantService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getAll', () => {
    it('calls GET /restaurants', async () => {
      const restaurants = [
        { id: '1', name: 'Pizza Place' },
        { id: '2', name: 'Burger Joint' }
      ];
      api.get.mockResolvedValue({ data: restaurants });

      const res = await restaurantService.getAll();

      expect(api.get).toHaveBeenCalledWith('/restaurants');
      expect(res).toEqual(restaurants);
    });

    it('returns all restaurants', async () => {
      const restaurants = [
        { id: '1', name: 'Italian Bistro', cuisine: 'Italian' },
        { id: '2', name: 'Sushi Bar', cuisine: 'Japanese' },
        { id: '3', name: 'Taco Stand', cuisine: 'Mexican' }
      ];
      api.get.mockResolvedValue({ data: restaurants });

      const res = await restaurantService.getAll();

      expect(res).toHaveLength(3);
      expect(res[0].cuisine).toBe('Italian');
    });

    it('returns empty array when no restaurants exist', async () => {
      api.get.mockResolvedValue({ data: [] });

      const res = await restaurantService.getAll();

      expect(res).toEqual([]);
    });
  });

  describe('getById', () => {
    it('calls GET /restaurants/:id', async () => {
      const restaurant = { id: 'rest1', name: 'Great Food', cuisine: 'American' };
      api.get.mockResolvedValue({ data: restaurant });

      const res = await restaurantService.getById('rest1');

      expect(api.get).toHaveBeenCalledWith('/restaurants/rest1');
      expect(res).toEqual(restaurant);
    });

    it('returns restaurant details by ID', async () => {
      const restaurant = {
        id: 'rest2',
        name: 'Thai Kitchen',
        cuisine: 'Thai',
        address: '123 Main St',
        rating: 4.5
      };
      api.get.mockResolvedValue({ data: restaurant });

      const res = await restaurantService.getById('rest2');

      expect(res.name).toBe('Thai Kitchen');
      expect(res.rating).toBe(4.5);
    });

    it('throws error when restaurant not found', async () => {
      api.get.mockRejectedValue(new Error('Restaurant not found'));

      await expect(restaurantService.getById('invalid')).rejects.toThrow('Restaurant not found');
    });
  });

  describe('searchByCuisine', () => {
    it('calls GET /restaurants with cuisine query parameter', async () => {
      const italianRestaurants = [
        { id: '1', name: 'Pasta Palace', cuisine: 'Italian' },
        { id: '2', name: 'Pizza Roma', cuisine: 'Italian' }
      ];
      api.get.mockResolvedValue({ data: italianRestaurants });

      const res = await restaurantService.searchByCuisine('Italian');

      expect(api.get).toHaveBeenCalledWith('/restaurants?cuisine=Italian');
      expect(res).toEqual(italianRestaurants);
    });

    it('returns restaurants filtered by cuisine type', async () => {
      const mexicanRestaurants = [
        { id: '3', name: 'Taco Town', cuisine: 'Mexican' }
      ];
      api.get.mockResolvedValue({ data: mexicanRestaurants });

      const res = await restaurantService.searchByCuisine('Mexican');

      expect(res).toHaveLength(1);
      expect(res[0].cuisine).toBe('Mexican');
    });

    it('returns empty array when no restaurants match cuisine', async () => {
      api.get.mockResolvedValue({ data: [] });

      const res = await restaurantService.searchByCuisine('Ethiopian');

      expect(res).toEqual([]);
    });

    it('handles special characters in cuisine name', async () => {
      api.get.mockResolvedValue({ data: [] });

      await restaurantService.searchByCuisine('Chinese & Japanese');

      expect(api.get).toHaveBeenCalledWith('/restaurants?cuisine=Chinese & Japanese');
    });
  });
});
