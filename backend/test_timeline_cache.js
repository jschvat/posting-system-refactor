/**
 * Timeline Cache Testing Script
 * Tests the Redis caching implementation for timeline endpoints
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

// Test user token (admin user)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc2MjY0NTc0NCwiZXhwIjoxNzYyNzMyMTQ0LCJhdWQiOiJzb2NpYWwtbWVkaWEtdXNlcnMiLCJpc3MiOiJzb2NpYWwtbWVkaWEtcGxhdGZvcm0ifQ.PpGOvCcc6tSjTVQCbZG4dHmICtnTQ0FNGI028m0M1Fw';

async function makeRequest(url, token) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

async function testTimelineCaching() {
  console.log('\n=== Test 1: Timeline Caching ===');

  const userId = 22; // Admin user
  const cacheKeyPattern = `timeline:${userId}:*`;

  // Clear all timeline cache first
  console.log('Clearing timeline cache...');
  const keys = await redis.keys('timeline:*');
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`✓ Cleared ${keys.length} timeline cache keys`);
  } else {
    console.log('✓ No timeline cache keys found');
  }

  // First request - should hit database
  console.log('\nMaking first request to /timeline...');
  const start1 = Date.now();
  const result1 = await makeRequest(`${API_BASE}/timeline?limit=20`, TEST_TOKEN);
  const time1 = Date.now() - start1;
  console.log(`  Response time: ${time1}ms`);
  console.log(`  Posts returned: ${result1.data?.length || 0}`);

  // Check if cache was set
  const cachedKeys = await redis.keys(cacheKeyPattern);
  if (cachedKeys.length > 0) {
    console.log(`✅ Cache populated (${cachedKeys.length} key(s))`);
    console.log(`  Cache key: ${cachedKeys[0]}`);

    // Check TTL
    const ttl = await redis.ttl(cachedKeys[0]);
    console.log(`  Cache TTL: ${ttl} seconds`);
  } else {
    console.log('❌ Cache NOT populated');
  }

  // Second request - should hit cache
  console.log('\nMaking second request to /timeline...');
  const start2 = Date.now();
  const result2 = await makeRequest(`${API_BASE}/timeline?limit=20`, TEST_TOKEN);
  const time2 = Date.now() - start2;
  console.log(`  Response time: ${time2}ms`);
  console.log(`  Posts returned: ${result2.data?.length || 0}`);

  // Compare times
  const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
  console.log(`\n📊 Performance:`);
  console.log(`  First request (DB):     ${time1}ms`);
  console.log(`  Second request (Cache): ${time2}ms`);
  console.log(`  Improvement: ${improvement}% faster`);

  if (time2 < time1) {
    console.log('✅ Cache is working - second request was faster!');
  } else if (time2 <= time1 * 1.2) {
    console.log('✅ Cache likely working (similar performance)');
  } else {
    console.log('⚠️  Second request not faster (may still be cached)');
  }

  return { cached: cachedKeys.length > 0, improvement };
}

async function testDifferentParameters() {
  console.log('\n=== Test 2: Different Parameters Caching ===');

  const userId = 22;

  // Clear cache
  const keys = await redis.keys('timeline:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  console.log('Testing different parameter combinations...');

  // Test with limit=10
  await makeRequest(`${API_BASE}/timeline?limit=10`, TEST_TOKEN);

  // Test with limit=20
  await makeRequest(`${API_BASE}/timeline?limit=20`, TEST_TOKEN);

  // Test with limit=10&offset=5
  await makeRequest(`${API_BASE}/timeline?limit=10&offset=5`, TEST_TOKEN);

  // Check how many cache keys were created
  const cachedKeys = await redis.keys(`timeline:${userId}:*`);
  console.log(`\n✅ Created ${cachedKeys.length} separate cache keys for different parameters:`);
  cachedKeys.forEach(key => {
    const cleanKey = key.replace('socialapp:', '');
    console.log(`  - ${cleanKey}`);
  });

  return { uniqueKeys: cachedKeys.length };
}

async function testCacheInvalidation() {
  console.log('\n=== Test 3: Cache Invalidation ===');

  const userId = 22;

  // Populate cache by making a request
  console.log('Populating timeline cache...');
  await makeRequest(`${API_BASE}/timeline?limit=20`, TEST_TOKEN);

  let cachedKeys = await redis.keys(`timeline:${userId}:*`);
  console.log(`✓ Cache populated (${cachedKeys.length} key(s))`);

  // Create a new post (this should invalidate the cache)
  console.log('\nCreating a new post (should invalidate cache)...');
  const createResponse = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Test post for cache invalidation - ' + Date.now(),
      privacy_level: 'public'
    })
  });

  if (createResponse.ok) {
    console.log('✓ Post created successfully');
  } else {
    console.log('❌ Failed to create post');
  }

  // Check if cache was invalidated
  cachedKeys = await redis.keys(`timeline:${userId}:*`);
  if (cachedKeys.length === 0) {
    console.log('✅ Cache invalidated successfully!');
  } else {
    console.log(`⚠️  Cache still exists (${cachedKeys.length} key(s))`);
  }

  return { invalidated: cachedKeys.length === 0 };
}

async function testCacheKeys() {
  console.log('\n=== Test 4: All Timeline Cache Keys ===');

  // Get all timeline keys
  const keys = await redis.keys('timeline:*');
  console.log(`Found ${keys.length} timeline cache keys:`);

  if (keys.length > 0) {
    keys.forEach(key => {
      const cleanKey = key.replace('socialapp:', '');
      console.log(`  - ${cleanKey}`);
    });
  } else {
    console.log('  (none)');
  }

  return { totalKeys: keys.length };
}

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Timeline Cache Testing              ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // Test Redis connection
    await redis.ping();
    console.log('✓ Connected to Redis');

    // Run tests
    const results = {
      timeline: await testTimelineCaching(),
      parameters: await testDifferentParameters(),
      invalidation: await testCacheInvalidation(),
      keys: await testCacheKeys()
    };

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║           Test Summary                 ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`Timeline Caching:        ${results.timeline.cached ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Parameter Segmentation:  ${results.parameters.uniqueKeys >= 3 ? '✅ PASS' : '❌ FAIL'} (${results.parameters.uniqueKeys} keys)`);
    console.log(`Cache Invalidation:      ${results.invalidation.invalidated ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Total Timeline Keys:     ${results.keys.totalKeys}`);

    if (results.timeline.improvement) {
      console.log(`Performance Gain:        ${results.timeline.improvement}% faster`);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\nMake sure the server is running on port 3001');
      console.log('Run: npm start');
    }
  } finally {
    await redis.disconnect();
    console.log('\n✓ Disconnected from Redis');
  }
}

// Run the tests
runTests();
