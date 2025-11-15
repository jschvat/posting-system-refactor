/**
 * Users API Service
 * Handles all user-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, PaginatedResponse, User, UserFormData, Post } from '../../types';

/**
 * Users API
 */
const usersApi = {
  /**
   * Get all users with pagination and search
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());

    return apiRequest<PaginatedResponse<User>>('GET', `/users?${searchParams}`);
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('GET', `/users/${id}`);
  },

  /**
   * Create a new user
   */
  createUser: async (data: UserFormData): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('POST', '/users', data);
  },

  /**
   * Update a user
   */
  updateUser: async (id: number, data: Partial<UserFormData>): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('PUT', `/users/${id}`, data);
  },

  /**
   * Delete/deactivate a user
   */
  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('DELETE', `/users/${id}`);
  },

  /**
   * Get posts by a specific user
   */
  getUserPosts: async (userId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post> & { user: User }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiRequest<any>('GET', `/users/${userId}/posts?${searchParams}`);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (userId: number, file: File): Promise<ApiResponse<{ user: User; avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiRequest<ApiResponse<{ user: User; avatar_url: string }>>('POST', `/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default usersApi;
