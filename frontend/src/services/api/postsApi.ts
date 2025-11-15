/**
 * Posts API Service
 * Handles all post-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, PaginatedResponse, Post, PostFormData } from '../../types';

/**
 * Posts API
 */
const postsApi = {
  /**
   * Get all posts with pagination and filtering
   */
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest';
    privacy?: 'public' | 'friends' | 'private';
    user_id?: number;
  }): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.privacy) searchParams.append('privacy', params.privacy);
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());

    return apiRequest<PaginatedResponse<Post>>('GET', `/posts?${searchParams}`);
  },

  /**
   * Get a single post by ID
   */
  getPost: async (id: number): Promise<ApiResponse<Post>> => {
    return apiRequest<ApiResponse<Post>>('GET', `/posts/${id}`);
  },

  /**
   * Create a new post
   */
  createPost: async (data: PostFormData): Promise<ApiResponse<Post>> => {
    return apiRequest<ApiResponse<Post>>('POST', '/posts', data);
  },

  /**
   * Update a post
   */
  updatePost: async (id: number, data: Partial<PostFormData>): Promise<ApiResponse<Post>> => {
    return apiRequest<ApiResponse<Post>>('PUT', `/posts/${id}`, data);
  },

  /**
   * Delete a post
   */
  deletePost: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('DELETE', `/posts/${id}`);
  },
};

export default postsApi;
