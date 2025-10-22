import mongoose from 'mongoose';

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 
  'mongodb://localhost:27017/food-delivery-test';

// Setup before all tests
beforeAll(async () => {
  try {
    await mongoose.connect(TEST_MONGODB_URI);
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    process.exit(1);
  }
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log('✅ Test database disconnected');
});

// Increase timeout for tests
jest.setTimeout(30000);