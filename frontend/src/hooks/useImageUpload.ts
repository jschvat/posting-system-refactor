/**
 * useImageUpload - Reusable hook for handling image file selection, preview generation, and validation
 *
 * Supports both single and multiple image uploads with configurable validation options.
 * Automatically handles preview URL generation and cleanup to prevent memory leaks.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ImageUploadFile {
  id: string;
  file: File;
  preview: string;
  isPrimary?: boolean;
  uploadProgress?: number;
  uploaded?: boolean;
  mediaId?: number;
}

export interface ImageUploadOptions {
  maxSize?: number; // in MB, default 10
  maxCount?: number; // maximum number of images, default 10
  allowedTypes?: string[]; // default ['image/*']
  allowMultiple?: boolean; // default true
  onError?: (message: string) => void;
}

export interface ImageUploadResult {
  selectedFiles: ImageUploadFile[];
  previews: string[];
  error: string | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilesFromArray: (files: File[]) => void;
  removeFile: (id: string) => void;
  setPrimary: (id: string) => void;
  clearAll: () => void;
  updateProgress: (id: string, progress: number) => void;
  updateUploaded: (id: string, mediaId?: number) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxSize: 10,
  maxCount: 10,
  allowedTypes: ['image/*'],
  allowMultiple: true,
  onError: () => {}
};

/**
 * Custom hook for image upload handling
 *
 * @param options - Configuration options for validation and behavior
 * @returns Object with state and handler functions
 *
 * @example
 * // Single image upload (avatar)
 * const { selectedFiles, handleFileSelect, removeFile } = useImageUpload({
 *   maxSize: 5,
 *   maxCount: 1,
 *   allowMultiple: false,
 *   onError: showError
 * });
 *
 * @example
 * // Multiple image upload (marketplace listing)
 * const { selectedFiles, handleFilesFromArray, setPrimary, reorderFiles } = useImageUpload({
 *   maxSize: 10,
 *   maxCount: 10,
 *   allowMultiple: true,
 *   onError: showError
 * });
 */
export const useImageUpload = (options: ImageUploadOptions = {}): ImageUploadResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [selectedFiles, setSelectedFiles] = useState<ImageUploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [selectedFiles]);

  const validateFile = useCallback((file: File): string | null => {
    // Validate file type
    const isValidType = opts.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `${file.name} is not a valid image file. Allowed types: ${opts.allowedTypes.join(', ')}`;
    }

    // Validate file size
    const maxSizeBytes = opts.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `${file.name} is too large. Maximum size is ${opts.maxSize}MB`;
    }

    return null;
  }, [opts.allowedTypes, opts.maxSize]);

  const handleFilesFromArray = useCallback((files: File[]) => {
    setError(null);

    // Check if adding these files would exceed the max count
    if (!opts.allowMultiple && files.length > 1) {
      const errorMsg = 'Only one file can be uploaded';
      setError(errorMsg);
      opts.onError(errorMsg);
      return;
    }

    const remainingSlots = opts.maxCount - selectedFiles.length;
    if (files.length > remainingSlots) {
      const errorMsg = opts.allowMultiple
        ? `You can only upload up to ${opts.maxCount} images. ${remainingSlots} slot(s) remaining.`
        : `You can only upload ${opts.maxCount} image(s)`;
      setError(errorMsg);
      opts.onError(errorMsg);
      return;
    }

    // Validate and process files
    const validFiles: ImageUploadFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      // Create preview
      const imageFile: ImageUploadFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        isPrimary: selectedFiles.length === 0 && validFiles.length === 0, // First image is primary
        uploadProgress: 0,
        uploaded: false
      };

      validFiles.push(imageFile);
    }

    // Report errors if any
    if (errors.length > 0) {
      const errorMsg = errors.join('; ');
      setError(errorMsg);
      opts.onError(errorMsg);
    }

    // Add valid files
    if (validFiles.length > 0) {
      if (!opts.allowMultiple) {
        // For single upload, revoke previous preview and replace
        selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setSelectedFiles(validFiles);
      } else {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
  }, [selectedFiles, opts, validateFile]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFilesFromArray(files);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [handleFilesFromArray]);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      const newFiles = prev.filter(f => f.id !== id);

      // If we removed the primary image, make the first remaining image primary
      if (fileToRemove?.isPrimary && newFiles.length > 0) {
        newFiles[0].isPrimary = true;
      }

      return newFiles;
    });
    setError(null);
  }, []);

  const setPrimary = useCallback((id: string) => {
    setSelectedFiles(prev =>
      prev.map(file => ({
        ...file,
        isPrimary: file.id === id
      }))
    );
  }, []);

  const clearAll = useCallback(() => {
    selectedFiles.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });
    setSelectedFiles([]);
    setError(null);
  }, [selectedFiles]);

  const updateProgress = useCallback((id: string, progress: number) => {
    setSelectedFiles(prev =>
      prev.map(file =>
        file.id === id ? { ...file, uploadProgress: progress } : file
      )
    );
  }, []);

  const updateUploaded = useCallback((id: string, mediaId?: number) => {
    setSelectedFiles(prev =>
      prev.map(file =>
        file.id === id ? { ...file, uploaded: true, uploadProgress: 100, mediaId } : file
      )
    );
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedFiles(prev => {
      if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= prev.length ||
          toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }

      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);

      return newFiles;
    });
  }, []);

  const previews = selectedFiles.map(f => f.preview);

  return {
    selectedFiles,
    previews,
    error,
    handleFileSelect,
    handleFilesFromArray,
    removeFile,
    setPrimary,
    clearAll,
    updateProgress,
    updateUploaded,
    reorderFiles
  };
};

export default useImageUpload;
