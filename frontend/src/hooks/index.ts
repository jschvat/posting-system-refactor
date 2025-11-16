/**
 * Custom Hooks Index
 * 
 * Barrel file for all custom React hooks.
 * Import hooks from this file for cleaner imports across the application.
 * 
 * @example
 * import { useFormData, useDebounce, usePagination } from '../hooks';
 */

export { useFormData } from './useFormData';
export type { UseFormDataReturn } from './useFormData';

export { useDebounce } from './useDebounce';

export { usePagination } from './usePagination';
export type { UsePaginationOptions, UsePaginationReturn } from './usePagination';

export { useGeolocation } from './useGeolocation';
export type {
  GeolocationData,
  UseGeolocationOptions,
  UseGeolocationReturn
} from './useGeolocation';

export { useImageUpload } from './useImageUpload';
export type {
  ImageUploadFile,
  ImageUploadOptions,
  ImageUploadResult
} from './useImageUpload';
