import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../../api/axios.config';
import { authService } from '../../api/services/auth.service';

vi.mock('../../api/axios.config');

describe('authService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('register', () => {
    it('calls POST /auth/register with user data', async () => {
      const userData = { name: 'John', email: 'john@test.com', password: 'pass123' };
      api.post.mockResolvedValue({ data: { user: userData, token: 'abc123' } });

      const res = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(res).toEqual({ user: userData, token: 'abc123' });
    });

    it('handles registration with all required fields', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'secure123',
        phone: '555-1234',
        role: 'customer'
      };
      api.post.mockResolvedValue({ data: { user: userData, token: 'xyz789' } });

      const res = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(res.user).toEqual(userData);
    });

    it('throws error on failed registration', async () => {
      const userData = { email: 'bad@test.com', password: 'weak' };
      api.post.mockRejectedValue(new Error('Registration failed'));

      await expect(authService.register(userData)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
      const credentials = { email: 'user@test.com', password: 'pass123' };
      api.post.mockResolvedValue({ data: { user: { id: '1', email: credentials.email } } });

      const res = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(res.user.email).toBe(credentials.email);
    });

    it('returns user data on successful login', async () => {
      const credentials = { email: 'john@test.com', password: 'pass123' };
      const userData = { id: '1', name: 'John', email: 'john@test.com', role: 'customer' };
      api.post.mockResolvedValue({ data: { user: userData } });

      const res = await authService.login(credentials);

      expect(res.user).toEqual(userData);
    });

    it('throws error on invalid credentials', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login({ email: 'bad@test.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      api.post.mockResolvedValue({ data: { success: true } });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('handles logout without errors', async () => {
      api.post.mockResolvedValue({ data: {} });

      await expect(authService.logout()).resolves.not.toThrow();
    });

    it('throws error if logout fails', async () => {
      api.post.mockRejectedValue(new Error('Logout failed'));

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('fetchMe', () => {
    it('calls GET /auth/me', async () => {
      const user = { id: '1', name: 'John', email: 'john@test.com' };
      api.get.mockResolvedValue({ data: { user } });

      const res = await authService.fetchMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(res).toEqual(user);
    });

    it('returns user data from response', async () => {
      const user = { id: '2', name: 'Jane', email: 'jane@test.com', role: 'restaurant' };
      api.get.mockResolvedValue({ data: { user } });

      const res = await authService.fetchMe();

      expect(res).toEqual(user);
    });

    it('returns undefined when user is not in response', async () => {
      api.get.mockResolvedValue({ data: {} });

      const res = await authService.fetchMe();

      expect(res).toBeUndefined();
    });

    it('throws error when request fails', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(authService.fetchMe()).rejects.toThrow('Unauthorized');
    });
  });
});
