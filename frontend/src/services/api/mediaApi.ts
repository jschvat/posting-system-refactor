/**
 * Media API Service
 * Handles all media-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, PaginatedResponse, Media, User } from '../../types';

/**
 * Media API
 */
const mediaApi = {
  /**
   * Upload media files
   */
  uploadFiles: async (data: {
    files: File[];
    post_id?: number;
    comment_id?: number;
    alt_text?: string;
  }): Promise<ApiResponse<Media[]>> => {
    const formData = new FormData();

    // Add files to FormData
    data.files.forEach(file => {
      formData.append('files', file);
    });

    // Add other fields (user_id is now handled by authentication)
    if (data.post_id) formData.append('post_id', data.post_id.toString());
    if (data.comment_id) formData.append('comment_id', data.comment_id.toString());
    if (data.alt_text) formData.append('alt_text', data.alt_text);

    return apiRequest<ApiResponse<Media[]>>('POST', '/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get media file by ID
   */
  getMedia: async (id: number): Promise<ApiResponse<Media>> => {
    return apiRequest<ApiResponse<Media>>('GET', `/media/${id}`);
  },

  /**
   * Get media files for a post
   */
  getPostMedia: async (postId: number, params?: {
    type?: 'image' | 'video' | 'audio' | 'document';
  }): Promise<ApiResponse<{ post_id: number; media: Media[]; count: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);

    return apiRequest<ApiResponse<any>>('GET', `/media/post/${postId}?${searchParams}`);
  },

  /**
   * Get media files for a comment
   */
  getCommentMedia: async (commentId: number, params?: {
    type?: 'image' | 'video' | 'audio' | 'document';
  }): Promise<ApiResponse<{ comment_id: number; media: Media[]; count: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);

    return apiRequest<ApiResponse<any>>('GET', `/media/comment/${commentId}?${searchParams}`);
  },

  /**
   * Update media metadata
   */
  updateMedia: async (id: number, data: { alt_text?: string }): Promise<ApiResponse<Media>> => {
    return apiRequest<ApiResponse<Media>>('PUT', `/media/${id}`, data);
  },

  /**
   * Delete media file
   */
  deleteMedia: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('DELETE', `/media/${id}`);
  },

  /**
   * Get media files by user
   */
  getUserMedia: async (userId: number, params?: {
    page?: number;
    limit?: number;
    type?: 'image' | 'video' | 'audio' | 'document';
  }): Promise<PaginatedResponse<Media> & { user: User }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);

    return apiRequest<any>('GET', `/media/user/${userId}?${searchParams}`);
  },
};

export default mediaApi;
