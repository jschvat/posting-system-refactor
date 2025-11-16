/**
 * useFormData Hook
 *
 * Generic form state management hook for handling form data with automatic
 * input type detection (text, checkbox, select, textarea, number, file, radio).
 *
 * @example
 * const { formData, handleChange, setFormData, resetForm, updateField } = useFormData({
 *   title: '',
 *   description: '',
 *   price: '',
 *   isActive: true
 * });
 */

import { useState, useCallback } from 'react';

export interface UseFormDataReturn<T> {
  formData: T;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  resetForm: () => void;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
}

export function useFormData<T extends Record<string, any>>(
  initialValues: T
): UseFormDataReturn<T> {
  const [formData, setFormData] = useState<T>(initialValues);

  /**
   * Universal change handler for all input types
   */
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (!name) {
      console.warn('useFormData: Input element is missing a "name" attribute');
      return;
    }

    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      // Parse number inputs
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (type === 'file') {
      // Handle file inputs
      const files = (e.target as HTMLInputElement).files;
      setFormData(prev => ({ ...prev, [name]: files }));
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      // Handle text, email, password, url, tel, textarea, select, etc.
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  /**
   * Programmatically update a specific field
   */
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [initialValues]);

  return {
    formData,
    handleChange,
    setFormData,
    resetForm,
    updateField
  };
}

export default useFormData;
