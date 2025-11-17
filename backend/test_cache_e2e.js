/**
 * End-to-End Cache Testing Script
 * Comprehensive tests for all caching implementations
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

const redis = new Redis(REDIS_CONFIG);

// Test user credentials
const testUser = {
  identifier: 'testuser@example.com',
  password: 'Test123!@#'
};

let authToken = null;
let testUserId = null;

// Helper function to make authenticated requests
async function makeRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return await response.json();
}

// Login to get auth token
async function login() {
  console.log('Logging in...');
  const response = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });

  if (response.success) {
    authToken = response.data.token;
    testUserId = response.data.user.id;
    console.log(`✓ Logged in as user ID: ${testUserId}`);
    return true;
  } else {
    console.log('⚠️  Login failed, trying to register...');
    const registerResponse = await makeRequest(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Test123!@#',
        first_name: 'Test',
        last_name: 'User'
      })
    });

    if (registerResponse.success) {
      authToken = registerResponse.data.token;
      testUserId = registerResponse.data.user.id;
      console.log(`✓ Registered and logged in as user ID: ${testUserId}`);
      return true;
    }
  }

  return false;
}

/**
 * Test 1: User Profile Caching
 */
async function testUserProfileCaching() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 1: User Profile Caching        ║');
  console.log('╚════════════════════════════════════════╝\n');

  const cacheKey = `user:profile:${testUserId}`;

  // Clear cache
  await redis.del(cacheKey);
  console.log('✓ Cache cleared');

  // First request (should hit database)
  console.log('\n1. First request (Database):');
  const start1 = Date.now();
  const result1 = await makeRequest(`${API_BASE}/users/${testUserId}`);
  const time1 = Date.now() - start1;
  console.log(`   Time: ${time1}ms`);
  console.log(`   User: ${result1.data?.username}`);

  // Check if cache was populated
  const cached = await redis.get(cacheKey);
  console.log(`   Cache populated: ${cached ? '✅ YES' : '❌ NO'}`);

  // Second request (should hit cache)
  console.log('\n2. Second request (Cache):');
  const start2 = Date.now();
  const result2 = await makeRequest(`${API_BASE}/users/${testUserId}`);
  const time2 = Date.now() - start2;
  console.log(`   Time: ${time2}ms`);

  // Verify improvement
  const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
  console.log(`\n   Performance: ${improvement}% faster`);
  console.log(`   Result: ${time2 < time1 ? '✅ PASS' : '❌ FAIL'}`);

  // Check TTL
  const ttl = await redis.ttl(cacheKey);
  console.log(`   Cache TTL: ${ttl} seconds`);

  return {
    passed: time2 <= time1 && cached !== null,
    improvement,
    time1,
    time2
  };
}

/**
 * Test 2: Follow Count Caching
 */
async function testFollowCountCaching() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 2: Follow Count Caching        ║');
  console.log('╚════════════════════════════════════════╝\n');

  const cacheKey = `follow:counts:${testUserId}`;

  // Clear cache
  await redis.del(cacheKey);
  await redis.del(`user:profile:${testUserId}`);
  console.log('✓ Cache cleared');

  // Make request to trigger follow count caching
  console.log('\n1. Fetching user profile (triggers follow count cache):');
  await makeRequest(`${API_BASE}/users/${testUserId}`);

  // Check if follow counts were cached
  const cached = await redis.get(cacheKey);
  if (cached) {
    const counts = JSON.parse(cached);
    console.log(`   ✅ Follow counts cached:`);
    console.log(`      Followers: ${counts.followers_count}`);
    console.log(`      Following: ${counts.following_count}`);
    return { passed: true, counts };
  } else {
    console.log('   ❌ Follow counts NOT cached');
    return { passed: false };
  }
}

/**
 * Test 3: Cache Invalidation on Profile Update
 */
async function testCacheInvalidation() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 3: Cache Invalidation          ║');
  console.log('╚════════════════════════════════════════╝\n');

  const cacheKey = `user:profile:${testUserId}`;

  // Populate cache
  console.log('1. Populating cache...');
  await makeRequest(`${API_BASE}/users/${testUserId}`);

  let cached = await redis.get(cacheKey);
  console.log(`   Cache populated: ${cached ? '✅ YES' : '❌ NO'}`);

  // Update profile (should invalidate cache)
  console.log('\n2. Updating profile (should invalidate cache)...');
  await makeRequest(`${API_BASE}/users/profile`, {
    method: 'PUT',
    body: JSON.stringify({
      bio: 'Updated bio - ' + Date.now()
    })
  });

  // Check if cache was invalidated
  cached = await redis.get(cacheKey);
  const invalidated = !cached;
  console.log(`   Cache invalidated: ${invalidated ? '✅ YES' : '❌ NO'}`);

  return { passed: invalidated };
}

/**
 * Test 4: Post Creation Cache Invalidation
 */
async function testPostCreationInvalidation() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 4: Post Creation Invalidation  ║');
  console.log('╚════════════════════════════════════════╝\n');

  const profileKey = `user:profile:${testUserId}`;
  const timelineKey = `timeline:${testUserId}:*`;

  // Populate caches
  console.log('1. Populating caches...');
  await makeRequest(`${API_BASE}/users/${testUserId}`);

  let profileCached = await redis.get(profileKey);
  console.log(`   Profile cache: ${profileCached ? '✅ POPULATED' : '❌ EMPTY'}`);

  // Create a post (should invalidate both caches)
  console.log('\n2. Creating a post...');
  const postResponse = await makeRequest(`${API_BASE}/posts`, {
    method: 'POST',
    body: JSON.stringify({
      content: 'Test post for cache invalidation - ' + Date.now(),
      privacy_level: 'public'
    })
  });

  console.log(`   Post created: ${postResponse.success ? '✅ YES' : '❌ NO'}`);

  // Check if caches were invalidated
  profileCached = await redis.get(profileKey);
  const timelineKeys = await redis.keys(timelineKey);

  const profileInvalidated = !profileCached;
  const timelineInvalidated = timelineKeys.length === 0;

  console.log(`\n3. Cache invalidation:`);
  console.log(`   Profile cache cleared: ${profileInvalidated ? '✅ YES' : '❌ NO'}`);
  console.log(`   Timeline cache cleared: ${timelineInvalidated ? '✅ YES' : '⚠️  NO (may not exist)'}`);

  return {
    passed: profileInvalidated,
    postId: postResponse.data?.id
  };
}

/**
 * Test 5: Follow/Unfollow Cache Invalidation
 */
async function testFollowCacheInvalidation() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 5: Follow/Unfollow Invalidation║');
  console.log('╚════════════════════════════════════════╝\n');

  const followCountKey = `follow:counts:${testUserId}`;
  const targetUserId = 1; // Follow user ID 1

  // Populate cache
  console.log('1. Populating follow count cache...');
  await makeRequest(`${API_BASE}/users/${testUserId}`);

  let cached = await redis.get(followCountKey);
  const initialCounts = cached ? JSON.parse(cached) : null;
  console.log(`   Initial following count: ${initialCounts?.following_count || 0}`);

  // Follow a user
  console.log('\n2. Following user...');
  await makeRequest(`${API_BASE}/users/${targetUserId}/follow`, {
    method: 'POST'
  });

  // Check if cache was invalidated
  cached = await redis.get(followCountKey);
  const invalidated = !cached;
  console.log(`   Follow count cache invalidated: ${invalidated ? '✅ YES' : '❌ NO'}`);

  // Fetch fresh counts
  await makeRequest(`${API_BASE}/users/${testUserId}`);
  cached = await redis.get(followCountKey);
  const newCounts = cached ? JSON.parse(cached) : null;
  console.log(`   New following count: ${newCounts?.following_count || 0}`);

  return { passed: invalidated };
}

/**
 * Test 6: Concurrent Request Handling
 */
async function testConcurrentRequests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 6: Concurrent Request Handling ║');
  console.log('╚════════════════════════════════════════╝\n');

  const cacheKey = `user:profile:${testUserId}`;

  // Clear cache
  await redis.del(cacheKey);
  console.log('✓ Cache cleared');

  // Make 10 concurrent requests
  console.log('\n1. Making 10 concurrent requests...');
  const start = Date.now();
  const promises = Array(10).fill(null).map(() =>
    makeRequest(`${API_BASE}/users/${testUserId}`)
  );

  const results = await Promise.all(promises);
  const totalTime = Date.now() - start;

  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Avg per request: ${(totalTime / 10).toFixed(1)}ms`);
  console.log(`   All succeeded: ${results.every(r => r.success) ? '✅ YES' : '❌ NO'}`);

  // Check cache was populated
  const cached = await redis.get(cacheKey);
  console.log(`   Cache populated: ${cached ? '✅ YES' : '❌ NO'}`);

  return {
    passed: results.every(r => r.success) && cached !== null,
    totalTime,
    avgTime: totalTime / 10
  };
}

/**
 * Test 7: Cache Key Patterns
 */
async function testCacheKeyPatterns() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Test 7: Cache Key Patterns          ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Trigger various cache operations
  await makeRequest(`${API_BASE}/users/${testUserId}`);
  await makeRequest(`${API_BASE}/timeline?limit=20`);

  // Get all cache keys
  const keys = await redis.keys('*');

  console.log(`Total cache keys: ${keys.length}`);

  // Group keys by type
  const keyTypes = {};
  keys.forEach(key => {
    const cleanKey = key.replace('socialapp:', '');
    const type = cleanKey.split(':')[0];
    keyTypes[type] = (keyTypes[type] || 0) + 1;
  });

  console.log('\nKeys by type:');
  Object.entries(keyTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} key(s)`);
  });

  // Show sample keys
  console.log('\nSample keys:');
  keys.slice(0, 5).forEach(key => {
    console.log(`   - ${key.replace('socialapp:', '')}`);
  });

  return { passed: keys.length > 0, keyCount: keys.length, keyTypes };
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   End-to-End Cache Testing Suite      ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Connect to Redis
    await redis.ping();
    console.log('✓ Connected to Redis\n');

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      throw new Error('Failed to authenticate');
    }

    // Run tests
    const results = {
      userProfile: await testUserProfileCaching(),
      followCount: await testFollowCountCaching(),
      invalidation: await testCacheInvalidation(),
      postCreation: await testPostCreationInvalidation(),
      followInvalidation: await testFollowCacheInvalidation(),
      concurrent: await testConcurrentRequests(),
      keyPatterns: await testCacheKeyPatterns()
    };

    // Summary
    console.log('\n\n╔════════════════════════════════════════╗');
    console.log('║           Test Summary                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    const tests = [
      ['User Profile Caching', results.userProfile.passed],
      ['Follow Count Caching', results.followCount.passed],
      ['Cache Invalidation', results.invalidation.passed],
      ['Post Creation Invalidation', results.postCreation.passed],
      ['Follow/Unfollow Invalidation', results.followInvalidation.passed],
      ['Concurrent Requests', results.concurrent.passed],
      ['Cache Key Patterns', results.keyPatterns.passed]
    ];

    tests.forEach(([name, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${name}`);
    });

    const passCount = tests.filter(([, passed]) => passed).length;
    const totalTests = tests.length;

    console.log(`\n${passCount}/${totalTests} tests passed`);

    // Performance summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║        Performance Summary             ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`User Profile Cache:`);
    console.log(`  DB request: ${results.userProfile.time1}ms`);
    console.log(`  Cached request: ${results.userProfile.time2}ms`);
    console.log(`  Improvement: ${results.userProfile.improvement}%`);

    console.log(`\nConcurrent Requests:`);
    console.log(`  10 requests: ${results.concurrent.totalTime}ms`);
    console.log(`  Avg per request: ${results.concurrent.avgTime.toFixed(1)}ms`);

    console.log(`\nCache Statistics:`);
    console.log(`  Total keys: ${results.keyPatterns.keyCount}`);
    Object.entries(results.keyPatterns.keyTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  } catch (error) {
    console.error('\n❌ Test Suite Error:', error.message);
    console.error(error.stack);
  } finally {
    await redis.disconnect();
    console.log('\n✓ Disconnected from Redis');
  }
}

// Run the tests
runAllTests();
