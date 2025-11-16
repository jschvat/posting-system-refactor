/**
 * usePagination Hook
 * 
 * Manages pagination state with navigation helpers.
 * Supports both total items (auto-calculates pages) and direct page count.
 *
 * @example
 * const pagination = usePagination({
 *   initialPage: 1,
 *   itemsPerPage: 20,
 *   totalItems: 150
 * });
 * 
 * // Use in API call
 * const { page, itemsPerPage, offset } = pagination;
 * fetchData({ page, limit: itemsPerPage, offset });
 * 
 * // Update from API response
 * pagination.setTotalItems(response.total);
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  offset: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetPage: () => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    itemsPerPage = 20,
    totalItems,
    totalPages: initialTotalPages,
    onPageChange
  } = options;

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPagesState] = useState(() => {
    if (initialTotalPages) return initialTotalPages;
    if (totalItems) return Math.ceil(totalItems / itemsPerPage);
    return 1;
  });

  // Calculate offset for API requests (0-indexed)
  const offset = useMemo(() => (page - 1) * itemsPerPage, [page, itemsPerPage]);

  // Helper flags
  const hasNext = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrev = useMemo(() => page > 1, [page]);
  const isFirstPage = useMemo(() => page === 1, [page]);
  const isLastPage = useMemo(() => page === totalPages, [page, totalPages]);

  // Trigger callback when page changes
  useEffect(() => {
    onPageChange?.(page);
  }, [page, onPageChange]);

  /**
   * Navigate to next page (with bounds checking)
   */
  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  /**
   * Navigate to previous page (with bounds checking)
   */
  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  /**
   * Navigate to specific page (with bounds checking)
   */
  const goToPage = useCallback((newPage: number) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(clampedPage);
  }, [totalPages]);

  /**
   * Reset to initial page
   */
  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  /**
   * Update total pages directly
   */
  const setTotalPages = useCallback((pages: number) => {
    setTotalPagesState(Math.max(1, pages));
  }, []);

  /**
   * Update total items (auto-calculates total pages)
   */
  const setTotalItems = useCallback((items: number) => {
    const pages = Math.ceil(items / itemsPerPage);
    setTotalPagesState(Math.max(1, pages));
  }, [itemsPerPage]);

  return {
    page,
    totalPages,
    itemsPerPage,
    offset,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setTotalPages,
    setTotalItems,
    hasNext,
    hasPrev,
    isFirstPage,
    isLastPage
  };
}

export default usePagination;
