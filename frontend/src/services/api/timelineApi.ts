/**
 * Timeline API Service
 * Handles all timeline/feed-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse } from '../../types';

/**
 * Timeline API
 * Endpoints for personalized timeline/feed
 */
const timelineApi = {
  /**
   * Get personalized timeline
   */
  getTimeline: async (params?: { page?: number; limit?: number; min_score?: number }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', '/timeline', null, { params });
  },

  /**
   * Get following feed
   */
  getFollowingFeed: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', '/timeline/following', null, { params });
  },

  /**
   * Get discover feed
   */
  getDiscoverFeed: async (params?: { limit?: number }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', '/timeline/discover', null, { params });
  },

  /**
   * Get trending posts
   */
  getTrendingPosts: async (params?: { limit?: number; timeframe?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', '/timeline/trending', null, { params });
  },

  /**
   * Refresh timeline cache
   */
  refreshTimeline: async (): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('POST', '/timeline/refresh');
  },
};

export default timelineApi;
