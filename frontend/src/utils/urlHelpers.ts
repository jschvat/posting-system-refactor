/**
 * Centralized URL helper utilities for frontend
 * Provides consistent URL transformation across the application
 */

import { getApiBaseUrl } from '../config/app.config';

/**
 * Converts a relative path to a full URL
 * If the path is already a full URL, returns it unchanged
 *
 * @param path - The relative path to convert
 * @returns The full URL or undefined if no path provided
 */
export const toFullUrl = (path: string | undefined | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getApiBaseUrl()}${path}`;
};

/**
 * Converts a relative avatar URL to a full URL
 * Alias for toFullUrl for semantic clarity
 *
 * @param path - The relative avatar path
 * @returns The full avatar URL or undefined
 */
export const toFullAvatarUrl = (path: string | undefined | null): string | undefined => {
  return toFullUrl(path);
};

/**
 * Converts a relative banner URL to a full URL
 * Alias for toFullUrl for semantic clarity
 *
 * @param path - The relative banner path
 * @returns The full banner URL or undefined
 */
export const toFullBannerUrl = (path: string | undefined | null): string | undefined => {
  return toFullUrl(path);
};

/**
 * Converts a relative media URL to a full URL
 * Alias for toFullUrl for semantic clarity
 *
 * @param path - The relative media path
 * @returns The full media URL or undefined
 */
export const toFullMediaUrl = (path: string | undefined | null): string | undefined => {
  return toFullUrl(path);
};

/**
 * Transforms an object by converting specified relative URL fields to full URLs
 *
 * @param obj - The object to transform
 * @param urlFields - Array of field names to transform
 * @returns New object with transformed URL fields
 */
export const transformObjectWithFullUrls = <T extends Record<string, any>>(
  obj: T | null | undefined,
  urlFields: (keyof T)[]
): T | null => {
  if (!obj) return null;

  const transformed = { ...obj };

  urlFields.forEach(field => {
    if (transformed[field]) {
      transformed[field] = toFullUrl(transformed[field] as string) as T[keyof T];
    }
  });

  return transformed;
};

/**
 * Transforms a user object with full URLs for avatar and banner
 *
 * @param user - The user object
 * @returns User object with full URLs
 */
export const transformUserWithFullUrls = <T extends { avatar_url?: string; banner_url?: string }>(
  user: T | null | undefined
): T | null => {
  return transformObjectWithFullUrls(user, ['avatar_url', 'banner_url']);
};

/**
 * Transforms a group object with full URLs for avatar and banner
 *
 * @param group - The group object
 * @returns Group object with full URLs
 */
export const transformGroupWithFullUrls = <T extends { avatar_url?: string; banner_url?: string }>(
  group: T | null | undefined
): T | null => {
  return transformObjectWithFullUrls(group, ['avatar_url', 'banner_url']);
};

/**
 * Transforms a marketplace listing with full URLs
 *
 * @param listing - The marketplace listing object
 * @returns Listing object with full URLs
 */
export const transformListingWithFullUrls = <T extends {
  primary_image?: string;
  seller_image?: string;
  media?: Array<{ file_url?: string; thumbnail_url?: string }>;
}>(
  listing: T | null | undefined
): T | null => {
  if (!listing) return null;

  const transformed = { ...listing };

  if (transformed.primary_image) {
    transformed.primary_image = toFullUrl(transformed.primary_image) as T['primary_image'];
  }

  if (transformed.seller_image) {
    transformed.seller_image = toFullUrl(transformed.seller_image) as T['seller_image'];
  }

  if (transformed.media && Array.isArray(transformed.media)) {
    transformed.media = transformed.media.map(m => ({
      ...m,
      file_url: toFullUrl(m.file_url),
      thumbnail_url: toFullUrl(m.thumbnail_url)
    })) as T['media'];
  }

  return transformed;
};

/**
 * Transforms a post object with full URLs for media
 *
 * @param post - The post object
 * @returns Post object with full URLs
 */
export const transformPostWithFullUrls = <T extends {
  avatar_url?: string;
  media_url?: string;
  media_thumbnail_url?: string;
  shared_post?: any;
}>(
  post: T | null | undefined
): T | null => {
  if (!post) return null;

  const transformed = { ...post };

  // Transform user avatar URL if present
  if (transformed.avatar_url) {
    transformed.avatar_url = toFullUrl(transformed.avatar_url) as T['avatar_url'];
  }

  // Transform media URLs
  if (transformed.media_url) {
    transformed.media_url = toFullUrl(transformed.media_url) as T['media_url'];
  }

  if (transformed.media_thumbnail_url) {
    transformed.media_thumbnail_url = toFullUrl(transformed.media_thumbnail_url) as T['media_thumbnail_url'];
  }

  // Transform shared post recursively if present
  if (transformed.shared_post) {
    transformed.shared_post = transformPostWithFullUrls(transformed.shared_post);
  }

  return transformed;
};

/**
 * Transforms an array of objects with full URLs
 *
 * @param items - Array of objects to transform
 * @param transformFn - Transform function to apply to each item
 * @returns Array of transformed objects
 */
export const transformArrayWithFullUrls = <T>(
  items: T[] | null | undefined,
  transformFn: (item: T) => T | null
): T[] => {
  if (!Array.isArray(items)) return [];
  return items.map(item => transformFn(item)).filter((item): item is T => item !== null);
};

/**
 * Checks if a URL is external (different domain)
 *
 * @param url - The URL to check
 * @returns True if the URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const currentHost = window.location.hostname;
    return urlObj.hostname !== currentHost;
  } catch {
    // If URL parsing fails, assume it's a relative URL (not external)
    return false;
  }
};

/**
 * Gets the file extension from a URL
 *
 * @param url - The URL to extract extension from
 * @returns The file extension (without dot) or undefined
 */
export const getFileExtension = (url: string): string | undefined => {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : undefined;
  } catch {
    // If URL parsing fails, try to extract from string directly
    const parts = url.split('.');
    return parts.length > 1 ? parts[parts.length - 1].split('?')[0].toLowerCase() : undefined;
  }
};

/**
 * Builds a query string from an object
 *
 * @param params - Object containing query parameters
 * @returns Query string (with leading ?)
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};
