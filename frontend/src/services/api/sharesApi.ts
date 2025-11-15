/**
 * Shares API Service
 * Handles all share-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse } from '../../types';

/**
 * Shares API
 * Endpoints for sharing/unsharing posts
 */
const sharesApi = {
  /**
   * Share a post
   */
  sharePost: async (postId: number, data?: { comment?: string; share_type?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('POST', `/shares/${postId}`, data);
  },

  /**
   * Unshare a post
   */
  unsharePost: async (postId: number): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('DELETE', `/shares/${postId}`);
  },

  /**
   * Check if shared a post
   */
  checkShared: async (postId: number): Promise<ApiResponse<{ has_shared: boolean }>> => {
    return apiRequest<ApiResponse<{ has_shared: boolean }>>('GET', `/shares/check/${postId}`);
  },

  /**
   * Get shares for a post
   */
  getPostShares: async (postId: number, params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', `/shares/post/${postId}`, null, { params });
  },

  /**
   * Get popular shares
   */
  getPopularShares: async (params?: { limit?: number; timeframe?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('GET', '/shares/popular', null, { params });
  },
};

export default sharesApi;
