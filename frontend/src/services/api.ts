/**
 * API service layer for the social media posting platform
 * Handles HTTP requests to the backend API using Axios
 */

import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
  Post,
  Comment,
  User,
  Media,
  Reaction,
  ReactionCount,
  PostFormData,
  CommentFormData,
  UserFormData,
  EmojiOption
} from '../types';

// Import centralized configuration
import { getApiBaseUrl } from '../config/app.config';

// API base URL from centralized configuration
const API_BASE_URL = `${getApiBaseUrl()}/api`;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (when authentication is implemented)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token when available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error responses
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API request helper
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
}

// Re-export all API modules for backward compatibility
export { default as postsApi } from './api/postsApi';
export { default as commentsApi } from './api/commentsApi';
export { default as usersApi } from './api/usersApi';
export { default as mediaApi } from './api/mediaApi';
export { default as reactionsApi } from './api/reactionsApi';
export { default as authApi } from './api/authApi';
export { followsApi } from './api/followsApi';
export { default as sharesApi } from './api/sharesApi';
export { default as timelineApi } from './api/timelineApi';
export { default as ratingsApi } from './api/ratingsApi';
export { default as reputationApi } from './api/reputationApi';

// Export the configured axios client for custom requests
export { apiClient };

// Helper function to get media URL
export const getMediaUrl = (media: Media): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/uploads/${media.file_path}`;
};

// Helper function to get user avatar URL or default
export const getUserAvatarUrl = (user: User): string => {
  if (user.avatar_url) {
    // If avatar_url starts with '/', it's a relative path - prepend base URL
    if (user.avatar_url.startsWith('/')) {
      const baseUrl = getApiBaseUrl();
      return `${baseUrl}${user.avatar_url}`;
    }
    // If it's already a full URL, return as-is
    return user.avatar_url;
  }

  // Generate a default avatar using user initials
  const initials = `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1877f2&color=fff&size=150`;
};