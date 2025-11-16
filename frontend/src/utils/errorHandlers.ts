/**
 * Centralized Error Handling Utilities
 *
 * This module provides standardized error handling functions to eliminate
 * code duplication and ensure consistent error message extraction across
 * the application.
 */

import { AxiosError } from 'axios';
import { ApiError } from '../types';

/**
 * Extracts a user-friendly error message from various error types
 *
 * Handles:
 * - Axios errors with API error responses
 * - Standard Error objects
 * - String error messages
 * - Unknown error types
 *
 * @param err - The error object (can be any type)
 * @param fallback - Default message if no error message found
 * @returns User-friendly error message string
 *
 * @example
 * try {
 *   await api.call();
 * } catch (error) {
 *   showError(getErrorMessage(error));
 * }
 */
export function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
  // Handle Axios errors with API error responses
  if (isAxiosError(err)) {
    const apiError = err.response?.data?.error;

    // API error is a string
    if (typeof apiError === 'string') {
      return apiError;
    }

    // API error is an ApiError object with message
    if (apiError && typeof apiError === 'object' && 'message' in apiError) {
      return String(apiError.message);
    }

    // Fall back to axios error message
    if (err.message) {
      return err.message;
    }
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Handle string errors
  if (typeof err === 'string') {
    return err;
  }

  // Handle objects with message property
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }

  return fallback;
}

/**
 * Type guard to check if an error is an AxiosError
 *
 * @param error - The error to check
 * @returns True if error is an AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError<{ error?: ApiError | string }> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}

/**
 * Handles API errors with optional toast notification
 *
 * @param error - The error to handle
 * @param showError - Optional toast error function
 * @param customMessage - Optional custom error message
 * @returns The extracted error message
 *
 * @example
 * try {
 *   await api.call();
 * } catch (error) {
 *   handleApiError(error, showError, 'Failed to load data');
 * }
 */
export function handleApiError(
  error: unknown,
  showError?: (message: string) => void,
  customMessage?: string
): string {
  const message = customMessage || getErrorMessage(error);

  if (showError) {
    showError(message);
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  return message;
}

/**
 * Extracts validation errors from API response
 *
 * @param error - The error object
 * @returns Object mapping field names to error messages, or null
 *
 * @example
 * const validationErrors = getValidationErrors(error);
 * if (validationErrors) {
 *   setFieldErrors(validationErrors);
 * }
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (!isAxiosError(error)) {
    return null;
  }

  const apiError = error.response?.data?.error;

  // Check if error has details array (validation errors)
  if (
    apiError &&
    typeof apiError === 'object' &&
    'details' in apiError &&
    Array.isArray(apiError.details)
  ) {
    const errors: Record<string, string> = {};

    apiError.details.forEach((detail: any) => {
      if (detail.field && detail.message) {
        errors[detail.field] = detail.message;
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  return null;
}

/**
 * Checks if an error is a network error (no response from server)
 *
 * @param error - The error to check
 * @returns True if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return !error.response && error.message === 'Network Error';
}

/**
 * Checks if an error is an authentication error (401)
 *
 * @param error - The error to check
 * @returns True if error is a 401 Unauthorized
 */
export function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 401;
}

/**
 * Checks if an error is a forbidden error (403)
 *
 * @param error - The error to check
 * @returns True if error is a 403 Forbidden
 */
export function isForbiddenError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 403;
}

/**
 * Checks if an error is a not found error (404)
 *
 * @param error - The error to check
 * @returns True if error is a 404 Not Found
 */
export function isNotFoundError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 404;
}
