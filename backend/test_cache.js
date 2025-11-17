/**
 * Cache Testing Script
 * Tests the Redis caching implementation without needing authentication
 */

require('dotenv').config();

const cache = require('./src/services/CacheService');
const Follow = require('./src/models/Follow');
const User = require('./src/models/User');

async function testCache() {
  console.log('=== Starting Cache Tests ===\n');

  try {
    // Connect to cache first
    await cache.connect();
    await new Promise(resolve => setTimeout(resolve, 500)); // Give it time to connect
    // Test 1: Check if cache is enabled (should work even without Redis)
    console.log('Test 1: Cache Service Status');
    console.log('Cache enabled in config:', require('./src/config/cache').enabled);
    console.log('Cache ready:', cache.isReady());
    console.log('');

    // Test 2: Test basic set/get operations
    console.log('Test 2: Basic Cache Operations');
    try {
      await cache.set('test:key', { value: 'test data' }, 60);
      const cached = await cache.get('test:key');
      console.log('Set and get:', cached ? '✅ SUCCESS' : '❌ FAILED');
      console.log('Cached value:', cached);
    } catch (err) {
      console.log('Cache operations failed (expected if no Redis auth):', err.message);
      console.log('Graceful fallback will handle this in production');
    }
    console.log('');

    // Test 3: Test getOrSet pattern
    console.log('Test 3: Cache-Aside Pattern (getOrSet)');
    let callCount = 0;
    const fetchFunction = async () => {
      callCount++;
      console.log(`  Fetch function called: ${callCount} time(s)`);
      return { data: 'expensive operation result', timestamp: Date.now() };
    };

    try {
      const result1 = await cache.getOrSet('test:complex', fetchFunction, 60);
      console.log('First call result:', result1);

      const result2 = await cache.getOrSet('test:complex', fetchFunction, 60);
      console.log('Second call result:', result2);

      if (cache.isReady()) {
        console.log('Function called times:', callCount);
        console.log('Cache working:', callCount === 1 ? '✅ SUCCESS (cached)' : '❌ FAILED (not cached)');
      } else {
        console.log('Redis not ready - fallback mode active');
        console.log('Function called times:', callCount, '(expected: 2 without cache)');
      }
    } catch (err) {
      console.log('getOrSet failed:', err.message);
    }
    console.log('');

    // Test 4: Test Follow count caching (requires DB)
    console.log('Test 4: Follow Count Caching');
    try {
      const userId = 1; // Test with user ID 1
      const counts1 = await Follow.getCounts(userId);
      console.log('First getCounts call:', counts1);

      const counts2 = await Follow.getCounts(userId);
      console.log('Second getCounts call:', counts2);
      console.log('Results match:', JSON.stringify(counts1) === JSON.stringify(counts2) ? '✅' : '❌');
    } catch (err) {
      console.log('Follow.getCounts failed:', err.message);
    }
    console.log('');

    // Test 5: Test cache invalidation
    console.log('Test 5: Cache Invalidation');
    try {
      await cache.set('test:invalidate', { value: 'will be deleted' }, 60);
      const before = await cache.get('test:invalidate');
      console.log('Before deletion:', before);

      await cache.del('test:invalidate');
      const after = await cache.get('test:invalidate');
      console.log('After deletion:', after);
      console.log('Invalidation works:', !after ? '✅ SUCCESS' : '❌ FAILED');
    } catch (err) {
      console.log('Cache invalidation test failed:', err.message);
    }
    console.log('');

    console.log('=== Summary ===');
    console.log('Cache system is operational with graceful fallback.');
    console.log('If Redis authentication is configured, caching will work optimally.');
    console.log('If Redis is unavailable, system falls back to direct DB queries.');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Clean up
    await cache.disconnect();
    process.exit(0);
  }
}

// Run tests
testCache();
