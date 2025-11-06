import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { profileService } from '../../api/services/profile.service';

vi.mock('../../api/axios.config');

describe('profileService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('geocodeAddress', () => {
    it('calls POST /profile/geocode with address data', async () => {
      const addressData = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      };
      const geocodeResponse = {
        ...addressData,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      };
      api.post.mockResolvedValue({ data: geocodeResponse });

      const res = await profileService.geocodeAddress(addressData);

      expect(api.post).toHaveBeenCalledWith('/profile/geocode', addressData);
      expect(res).toEqual(geocodeResponse);
    });

    it('returns coordinates for valid address', async () => {
      const addressData = { street: '456 Oak Ave', city: 'Boston', zipCode: '02101' };
      api.post.mockResolvedValue({
        data: {
          ...addressData,
          coordinates: { lat: 42.3601, lng: -71.0589 }
        }
      });

      const res = await profileService.geocodeAddress(addressData);

      expect(res.coordinates).toBeDefined();
      expect(res.coordinates.lat).toBe(42.3601);
      expect(res.coordinates.lng).toBe(-71.0589);
    });

    it('handles geocoding without saving to profile', async () => {
      const addressData = { street: '789 Pine Rd', city: 'Seattle', zipCode: '98101' };
      api.post.mockResolvedValue({ data: { ...addressData, coordinates: { lat: 47.6062, lng: -122.3321 } } });

      await profileService.geocodeAddress(addressData);

      expect(api.post).toHaveBeenCalledWith('/profile/geocode', addressData);
    });

    it('throws error on invalid address', async () => {
      const addressData = { street: 'Invalid', city: 'Unknown', zipCode: '00000' };
      api.post.mockRejectedValue(new Error('Geocoding failed'));

      await expect(profileService.geocodeAddress(addressData)).rejects.toThrow('Geocoding failed');
    });
  });

  describe('updateAddress', () => {
    it('calls POST /profile/address with address data', async () => {
      const addressData = {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
      };
      const response = {
        success: true,
        address: {
          ...addressData,
          coordinates: { lat: 40.7128, lng: -74.0060 }
        }
      };
      api.post.mockResolvedValue({ data: response });

      const res = await profileService.updateAddress(addressData);

      expect(api.post).toHaveBeenCalledWith('/profile/address', addressData);
      expect(res).toEqual(response);
    });

    it('saves address to user profile', async () => {
      const addressData = { street: '456 Elm St', city: 'Los Angeles', zipCode: '90001' };
      api.post.mockResolvedValue({
        data: {
          success: true,
          address: { ...addressData, coordinates: { lat: 34.0522, lng: -118.2437 } }
        }
      });

      const res = await profileService.updateAddress(addressData);

      expect(res.success).toBe(true);
      expect(res.address.street).toBe('456 Elm St');
    });

    it('returns updated address with coordinates', async () => {
      const addressData = { street: '789 Oak Blvd', city: 'Chicago', zipCode: '60601' };
      const coords = { lat: 41.8781, lng: -87.6298 };
      api.post.mockResolvedValue({
        data: {
          success: true,
          address: { ...addressData, coordinates: coords }
        }
      });

      const res = await profileService.updateAddress(addressData);

      expect(res.address.coordinates).toEqual(coords);
    });

    it('handles full address with all fields', async () => {
      const addressData = {
        street: '321 Maple Dr',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        apt: '5B'
      };
      api.post.mockResolvedValue({
        data: {
          success: true,
          address: { ...addressData, coordinates: { lat: 29.7604, lng: -95.3698 } }
        }
      });

      const res = await profileService.updateAddress(addressData);

      expect(res.address.apt).toBe('5B');
      expect(res.address.state).toBe('TX');
    });

    it('throws error when address update fails', async () => {
      const addressData = { street: '', city: '', zipCode: '' };
      api.post.mockRejectedValue(new Error('Address update failed'));

      await expect(profileService.updateAddress(addressData)).rejects.toThrow('Address update failed');
    });
  });
});
