/**
 * Cache configuration for Redis
 * Based on API Optimization Analysis recommendations
 */

module.exports = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'socialapp:',

    // Connection pool settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,

    // Timeouts
    connectTimeout: 10000,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },

  // TTL (Time To Live) configuration in seconds
  defaultTTL: {
    userProfile: 300,        // 5 minutes - user profiles change infrequently
    sessionData: 1800,       // 30 minutes - session data
    followCounts: 60,        // 1 minute - follow counts (updated frequently)
    followStats: 180,        // 3 minutes - detailed follow stats
    groupInfo: 600,          // 10 minutes - group data
    reactionCounts: 60,      // 1 minute - reaction counts
    leaderboard: 600,        // 10 minutes - reputation leaderboard
    timeline: 300,           // 5 minutes - user timeline
    commentTree: 180,        // 3 minutes - comment hierarchies
    trending: 300,           // 5 minutes - trending content
    reputation: 300,         // 5 minutes - reputation scores
    popularGroups: 900,      // 15 minutes - popular groups list
    sharePopular: 600        // 10 minutes - popular shares
  },

  // Cache enabled flag (can disable for testing)
  enabled: process.env.CACHE_ENABLED !== 'false'
};
