/**
 * Reactions API Service
 * Handles all reaction-related API calls
 */

import { apiRequest } from '../api';
import { ApiResponse, PaginatedResponse, Reaction, ReactionCount, EmojiOption, User } from '../../types';

/**
 * Reactions API
 */
const reactionsApi = {
  /**
   * Toggle reaction on a post
   */
  togglePostReaction: async (postId: number, data: {
    emoji_name: string;
    emoji_unicode?: string;
  }): Promise<ApiResponse<{ action: string; reaction: Reaction | null; reaction_counts: ReactionCount[] }>> => {
    return apiRequest<ApiResponse<any>>('POST', `/reactions/post/${postId}`, data);
  },

  /**
   * Toggle reaction on a comment
   */
  toggleCommentReaction: async (commentId: number, data: {
    emoji_name: string;
    emoji_unicode?: string;
  }): Promise<ApiResponse<{ action: string; reaction: Reaction | null; reaction_counts: ReactionCount[] }>> => {
    return apiRequest<ApiResponse<any>>('POST', `/reactions/comment/${commentId}`, data);
  },

  /**
   * Get reactions for a post
   */
  getPostReactions: async (postId: number, params?: {
    include_users?: boolean;
  }): Promise<ApiResponse<{ post_id: number; reaction_counts: ReactionCount[]; total_reactions: number; detailed_reactions?: Reaction[] }>> => {
    const searchParams = new URLSearchParams();
    if (params?.include_users !== undefined) searchParams.append('include_users', params.include_users.toString());

    return apiRequest<ApiResponse<any>>('GET', `/reactions/post/${postId}?${searchParams}`);
  },

  /**
   * Get reactions for a comment
   */
  getCommentReactions: async (commentId: number, params?: {
    include_users?: boolean;
  }): Promise<ApiResponse<{ comment_id: number; reaction_counts: ReactionCount[]; total_reactions: number; detailed_reactions?: Reaction[] }>> => {
    const searchParams = new URLSearchParams();
    if (params?.include_users !== undefined) searchParams.append('include_users', params.include_users.toString());

    return apiRequest<ApiResponse<any>>('GET', `/reactions/comment/${commentId}?${searchParams}`);
  },

  /**
   * Get reactions by user
   */
  getUserReactions: async (userId: number, params?: {
    page?: number;
    limit?: number;
    type?: 'post' | 'comment';
  }): Promise<PaginatedResponse<Reaction> & { user: User }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);

    return apiRequest<any>('GET', `/reactions/user/${userId}?${searchParams}`);
  },

  /**
   * Delete a reaction
   */
  deleteReaction: async (id: number): Promise<ApiResponse<{ reaction_counts: ReactionCount[] }>> => {
    return apiRequest<ApiResponse<any>>('DELETE', `/reactions/${id}`);
  },

  /**
   * Get list of available emojis
   */
  getEmojiList: async (): Promise<ApiResponse<{ emojis: EmojiOption[]; total_count: number }>> => {
    return apiRequest<ApiResponse<any>>('GET', '/reactions/emoji-list');
  },

  /**
   * Get popular emojis statistics
   */
  getPopularEmojis: async (params?: {
    days?: number;
    limit?: number;
  }): Promise<ApiResponse<{ popular_emojis: ReactionCount[]; period: string; total_count: number }>> => {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.append('days', params.days.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return apiRequest<ApiResponse<any>>('GET', `/reactions/stats/popular?${searchParams}`);
  },
};

export default reactionsApi;
