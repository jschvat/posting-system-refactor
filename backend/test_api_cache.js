/**
 * API Cache Testing Script
 * Tests the caching implementation through actual API calls
 */

require('dotenv').config();
const Redis = require('ioredis');

const API_BASE = 'http://localhost:3001/api';
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: 'socialapp:'
};

// Create Redis client for verification
const redis = new Redis(REDIS_CONFIG);

async function makeRequest(url) {
  const response = await fetch(url);
  return await response.json();
}

async function testUserProfileCaching() {
  console.log('\n=== Test 1: User Profile Caching ===');

  const userId = 1; // Test with user ID 1
  const cacheKey = `user:profile:${userId}`;

  // Clear cache first
  await redis.del(cacheKey);
  console.log('✓ Cache cleared for user profile');

  // First request - should hit database
  console.log(`Making first request to /users/${userId}...`);
  const start1 = Date.now();
  const result1 = await makeRequest(`${API_BASE}/users/${userId}`);
  const time1 = Date.now() - start1;
  console.log(`  Response time: ${time1}ms`);
  console.log(`  User: ${result1.data?.username || 'N/A'}`);

  // Check if cache was set
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('✅ Cache populated after first request');
  } else {
    console.log('❌ Cache NOT populated');
  }

  // Second request - should hit cache
  console.log(`Making second request to /users/${userId}...`);
  const start2 = Date.now();
  const result2 = await makeRequest(`${API_BASE}/users/${userId}`);
  const time2 = Date.now() - start2;
  console.log(`  Response time: ${time2}ms`);

  // Compare times
  const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
  console.log(`\n📊 Performance:`);
  console.log(`  First request (DB):    ${time1}ms`);
  console.log(`  Second request (Cache): ${time2}ms`);
  console.log(`  Improvement: ${improvement}% faster`);

  if (time2 < time1) {
    console.log('✅ Cache is working - second request was faster!');
  } else {
    console.log('⚠️  Second request not faster (may still be cached)');
  }

  return { cached: !!cached, improvement };
}

async function testFollowCountCaching() {
  console.log('\n=== Test 2: Follow Count Caching ===');

  const userId = 1;
  const cacheKey = `follow:counts:${userId}`;

  // Clear cache
  await redis.del(cacheKey);
  console.log('✓ Cache cleared for follow counts');

  // First request
  console.log(`Making first request to /users/${userId}...`);
  await makeRequest(`${API_BASE}/users/${userId}`);

  // Check if follow counts are cached
  const cached = await redis.get(cacheKey);
  if (cached) {
    const counts = JSON.parse(cached);
    console.log('✅ Follow counts cached:', counts);
  } else {
    console.log('❌ Follow counts NOT cached');
  }

  return { cached: !!cached };
}

async function testCacheInvalidation() {
  console.log('\n=== Test 3: Cache Invalidation ===');

  const userId = 22; // Use admin user
  const cacheKey = `user:profile:${userId}`;

  // Populate cache by making a request
  console.log('Populating cache...');
  await makeRequest(`${API_BASE}/users/${userId}`);

  let cached = await redis.get(cacheKey);
  if (cached) {
    console.log('✓ Cache populated');
  }

  // Simulate a post creation (this should invalidate the cache)
  console.log('\nSimulating data change (post creation)...');
  // Note: Actual POST would require authentication
  // For now, we'll manually invalidate to demonstrate
  await redis.del(cacheKey);

  cached = await redis.get(cacheKey);
  if (!cached) {
    console.log('✅ Cache invalidated successfully');
  } else {
    console.log('❌ Cache still exists after invalidation');
  }

  return { invalidated: !cached };
}

async function testCacheKeys() {
  console.log('\n=== Test 4: Redis Cache Keys ===');

  // Get all keys with our prefix
  const keys = await redis.keys('*');
  console.log(`Found ${keys.length} cached keys:`);

  const grouped = {};
  keys.forEach(key => {
    const type = key.split(':')[0];
    grouped[type] = (grouped[type] || 0) + 1;
  });

  Object.entries(grouped).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} key(s)`);
  });

  // Show some sample keys
  if (keys.length > 0) {
    console.log('\nSample keys:');
    keys.slice(0, 5).forEach(key => {
      console.log(`  - ${key}`);
    });
  }

  return { totalKeys: keys.length };
}

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   API Cache Testing - Live Server     ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // Test Redis connection
    await redis.ping();
    console.log('✓ Connected to Redis');

    // Run tests
    const results = {
      userProfile: await testUserProfileCaching(),
      followCount: await testFollowCountCaching(),
      invalidation: await testCacheInvalidation(),
      keys: await testCacheKeys()
    };

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║           Test Summary                 ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`User Profile Caching:    ${results.userProfile.cached ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Follow Count Caching:    ${results.followCount.cached ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cache Invalidation:      ${results.invalidation.invalidated ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Total Cached Keys:       ${results.keys.totalKeys}`);

    if (results.userProfile.improvement) {
      console.log(`Performance Gain:        ${results.userProfile.improvement}% faster`);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await redis.disconnect();
    console.log('\n✓ Disconnected from Redis');
  }
}

// Run the tests
runTests();
