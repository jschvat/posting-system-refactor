/**
 * Comments API Service
 * Handles all comment-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, Comment, CommentFormData, PaginationInfo } from '../../types';

/**
 * Comments API
 */
const commentsApi = {
  /**
   * Get comments for a post
   */
  getPostComments: async (postId: number, params?: {
    sort?: 'newest' | 'oldest';
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<{ post_id: number; comments: Comment[]; total_count: number; sort: string; pagination: PaginationInfo }>> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    return apiRequest<ApiResponse<any>>('GET', `/comments/post/${postId}?${searchParams}`);
  },

  /**
   * Get a single comment by ID
   */
  getComment: async (id: number): Promise<ApiResponse<Comment>> => {
    return apiRequest<ApiResponse<Comment>>('GET', `/comments/${id}`);
  },

  /**
   * Create a new comment or reply
   */
  createComment: async (data: CommentFormData & { post_id: number }): Promise<ApiResponse<Comment>> => {
    return apiRequest<ApiResponse<Comment>>('POST', '/comments', data);
  },

  /**
   * Update a comment
   */
  updateComment: async (id: number, data: { content: string }): Promise<ApiResponse<Comment>> => {
    return apiRequest<ApiResponse<Comment>>('PUT', `/comments/${id}`, data);
  },

  /**
   * Delete a comment
   */
  deleteComment: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<ApiResponse<void>>('DELETE', `/comments/${id}`);
  },

  /**
   * Get replies for a comment
   */
  getCommentReplies: async (commentId: number, params?: {
    sort?: 'newest' | 'oldest';
    limit?: number;
  }): Promise<ApiResponse<{ parent_comment_id: number; replies: Comment[]; total_count: number; sort: string }>> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiRequest<ApiResponse<any>>('GET', `/comments/${commentId}/replies?${searchParams}`);
  },
};

export default commentsApi;
