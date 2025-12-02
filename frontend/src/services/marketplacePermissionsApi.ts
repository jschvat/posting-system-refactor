/**
 * Marketplace Permissions API Service
 * Handles API calls for marketplace access permissions
 */

import { apiClient as api } from './api';

export interface MarketplaceType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  requires_permission: boolean;
  has_access?: boolean;
  granted_at?: string | null;
  expires_at?: string | null;
  granted_by_username?: string | null;
}

export interface UserPermissionsResponse {
  marketplaces: MarketplaceType[];
  accessible_marketplaces: MarketplaceType[];
}

export interface CheckAccessResponse {
  slug: string;
  has_access: boolean;
}

export interface GrantPermissionRequest {
  user_id: number;
  marketplace_slug: string;
  expires_at?: string;
  notes?: string;
}

export interface RevokePermissionRequest {
  user_id: number;
  marketplace_slug: string;
}

export interface UserWithPermission {
  permission_id: number;
  user_id: number;
  username: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  marketplace_id: number;
  marketplace_name: string;
  marketplace_slug: string;
  marketplace_icon: string | null;
  granted_at: string;
  expires_at: string | null;
  notes: string | null;
  granted_by_username: string | null;
}

export interface AllPermissionsResponse {
  permissions: UserWithPermission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchUser {
  id: number;
  username: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
}

/**
 * Get current user's marketplace permissions
 */
export const getMyPermissions = async (): Promise<UserPermissionsResponse> => {
  const response = await api.get('/marketplace-permissions/my-permissions');
  return response.data.data;
};

/**
 * Check if current user has access to a specific marketplace
 */
export const checkAccess = async (slug: string): Promise<boolean> => {
  const response = await api.get<{ data: CheckAccessResponse }>(`/marketplace-permissions/check/${slug}`);
  return response.data.data.has_access;
};

/**
 * Get all marketplace types (admin)
 */
export const getMarketplaceTypes = async (): Promise<MarketplaceType[]> => {
  const response = await api.get('/marketplace-permissions/marketplace-types');
  return response.data.data.marketplace_types;
};

/**
 * Grant marketplace access to a user (admin only)
 */
export const grantPermission = async (request: GrantPermissionRequest): Promise<void> => {
  await api.post('/marketplace-permissions/grant', request);
};

/**
 * Revoke marketplace access from a user (admin only)
 */
export const revokePermission = async (request: RevokePermissionRequest): Promise<void> => {
  await api.delete('/marketplace-permissions/revoke', { data: request });
};

/**
 * Get marketplace permissions for a specific user (admin only)
 */
export const getUserPermissions = async (userId: number): Promise<MarketplaceType[]> => {
  const response = await api.get(`/marketplace-permissions/users/${userId}`);
  return response.data.data.permissions;
};

/**
 * Get all users with their marketplace permissions (admin only)
 */
export const getAllPermissions = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  marketplace?: string;
}): Promise<AllPermissionsResponse> => {
  const response = await api.get('/marketplace-permissions/all-permissions', { params });
  return response.data.data;
};

/**
 * Search users for granting permissions (admin only)
 */
export const searchUsers = async (query: string, limit?: number): Promise<SearchUser[]> => {
  const response = await api.get('/marketplace-permissions/search-users', {
    params: { q: query, limit }
  });
  return response.data.data.users;
};

export const marketplacePermissionsApi = {
  getMyPermissions,
  checkAccess,
  getMarketplaceTypes,
  grantPermission,
  revokePermission,
  getUserPermissions,
  getAllPermissions,
  searchUsers
};

export default marketplacePermissionsApi;
