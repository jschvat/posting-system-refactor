/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, User, UserFormData } from '../../types';

/**
 * Authentication API
 */
const authApi = {
  /**
   * Register a new user
   */
  register: async (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    bio?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiRequest<ApiResponse<any>>('POST', '/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (data: {
    username: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiRequest<ApiResponse<any>>('POST', '/auth/login', {
      identifier: data.username,
      password: data.password
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('POST', '/auth/logout');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('GET', '/auth/me');
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: Partial<UserFormData>): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('PUT', '/auth/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('POST', '/auth/change-password', data);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (data: { email: string }): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('POST', '/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    new_password: string;
  }): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('POST', '/auth/reset-password', data);
  },
};

export default authApi;
