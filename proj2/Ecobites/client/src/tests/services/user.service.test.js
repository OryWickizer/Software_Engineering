import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { userService } from '../../api/services/user.service';

vi.mock('../../api/axios.config');

describe('userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getProfile', () => {
    it('calls GET /users/:userId', async () => {
      const userProfile = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'customer'
      };
      api.get.mockResolvedValue({ data: userProfile });

      const res = await userService.getProfile('user1');

      expect(api.get).toHaveBeenCalledWith('/users/user1');
      expect(res).toEqual(userProfile);
    });

    it('returns complete user profile data', async () => {
      const profile = {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@test.com',
        role: 'restaurant',
        phone: '555-1234',
        address: '123 Main St'
      };
      api.get.mockResolvedValue({ data: profile });

      const res = await userService.getProfile('user2');

      expect(res.name).toBe('Jane Smith');
      expect(res.phone).toBe('555-1234');
    });

    it('throws error when user not found', async () => {
      api.get.mockRejectedValue(new Error('User not found'));

      await expect(userService.getProfile('invalid')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /users/:userId with updated data', async () => {
      const userData = { name: 'John Updated', phone: '555-9999' };
      const updatedProfile = { id: 'user1', ...userData };
      api.put.mockResolvedValue({ data: updatedProfile });

      const res = await userService.updateProfile('user1', userData);

      expect(api.put).toHaveBeenCalledWith('/users/user1', userData);
      expect(res).toEqual(updatedProfile);
    });

    it('updates user name', async () => {
      const userData = { name: 'New Name' };
      api.put.mockResolvedValue({ data: { id: 'user1', name: 'New Name' } });

      const res = await userService.updateProfile('user1', userData);

      expect(res.name).toBe('New Name');
    });

    it('updates user phone number', async () => {
      const userData = { phone: '555-7777' };
      api.put.mockResolvedValue({ data: { id: 'user2', phone: '555-7777' } });

      const res = await userService.updateProfile('user2', userData);

      expect(res.phone).toBe('555-7777');
    });

    it('updates multiple user fields', async () => {
      const userData = {
        name: 'Updated Name',
        phone: '555-8888',
        email: 'updated@test.com'
      };
      api.put.mockResolvedValue({ data: { id: 'user3', ...userData } });

      const res = await userService.updateProfile('user3', userData);

      expect(res.name).toBe('Updated Name');
      expect(res.email).toBe('updated@test.com');
    });

    it('throws error on failed update', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateProfile('user1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('updateDriverAvailability', () => {
    it('calls PATCH /users/:driverId/availability', async () => {
      api.patch.mockResolvedValue({
        data: { id: 'driver1', isAvailable: true }
      });

      const res = await userService.updateDriverAvailability('driver1', true);

      expect(api.patch).toHaveBeenCalledWith('/users/driver1/availability', { isAvailable: true });
      expect(res.isAvailable).toBe(true);
    });

    it('sets driver as available', async () => {
      api.patch.mockResolvedValue({
        data: { id: 'driver2', isAvailable: true, status: 'online' }
      });

      const res = await userService.updateDriverAvailability('driver2', true);

      expect(res.isAvailable).toBe(true);
    });

    it('sets driver as unavailable', async () => {
      api.patch.mockResolvedValue({
        data: { id: 'driver3', isAvailable: false, status: 'offline' }
      });

      const res = await userService.updateDriverAvailability('driver3', false);

      expect(res.isAvailable).toBe(false);
    });

    it('throws error when driver not found', async () => {
      api.patch.mockRejectedValue(new Error('Driver not found'));

      await expect(userService.updateDriverAvailability('invalid', true))
        .rejects.toThrow('Driver not found');
    });
  });
});
