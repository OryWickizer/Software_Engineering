import { User, IUser } from '../../../models/User.model.ts';
import { testUsers } from '../../fixtures/testData.ts';
import mongoose from 'mongoose';

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const user: IUser = await User.create(testUsers.customer);
    
    expect(user.name).toBe(testUsers.customer.name);
    expect(user.email).toBe(testUsers.customer.email);
    expect(user.password).not.toBe(testUsers.customer.password);
    expect(user.role).toBe('customer');
    expect(user.rewardPoints).toBe(0);
  });

  it('should hash password before saving', async () => {
    const user: IUser = await User.create(testUsers.customer);
    
    expect(user.password).not.toBe(testUsers.customer.password);
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should compare passwords correctly', async () => {
    const user: IUser = await User.create(testUsers.customer);
    
    const isMatch = await user.comparePassword(testUsers.customer.password);
    expect(isMatch).toBe(true);
    
    const isWrong = await user.comparePassword('wrongpassword');
    expect(isWrong).toBe(false);
  });

  it('should require name, email, and password', async () => {
    const invalidUser = new User({
      name: 'Test'
    });

    await expect(invalidUser.save()).rejects.toThrow();
  });

  it('should enforce unique email', async () => {
    await User.create(testUsers.customer);
    
    await expect(
      User.create(testUsers.customer)
    ).rejects.toThrow();
  });

  it('should lowercase email', async () => {
    const user: IUser = await User.create({
      ...testUsers.customer,
      email: 'TEST@TEST.COM'
    });
    
    expect(user.email).toBe('test@test.com');
  });

  it('should have default reward points of 0', async () => {
    const user: IUser = await User.create(testUsers.customer);
    expect(user.rewardPoints).toBe(0);
  });
});