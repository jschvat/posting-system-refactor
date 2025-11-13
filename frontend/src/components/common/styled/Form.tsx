/**
 * Shared Form Components
 * Provides consistent form element styles across the application
 */

import styled, { css } from 'styled-components';

export interface InputProps {
  error?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const inputSizes = {
  small: css`
    padding: 6px 12px;
    font-size: 14px;
  `,
  medium: css`
    padding: 10px 16px;
    font-size: 16px;
  `,
  large: css`
    padding: 14px 20px;
    font-size: 18px;
  `,
};

export const Input = styled.input<InputProps>`
  border: 1px solid ${({ theme, error }) => (error ? '#dc3545' : theme.colors.border || '#d1d5db')};
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.colors.backgroundPrimary || 'white'};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ size = 'medium' }) => inputSizes[size]}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => (error ? '#dc3545' : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme, error }) => (error ? 'rgba(220, 53, 69, 0.1)' : 'rgba(59, 130, 246, 0.1)')};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.backgroundDisabled || '#f3f4f6'};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted || '#9ca3af'};
  }
`;

export const TextArea = styled.textarea<InputProps>`
  border: 1px solid ${({ theme, error }) => (error ? '#dc3545' : theme.colors.border || '#d1d5db')};
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.colors.backgroundPrimary || 'white'};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ size = 'medium' }) => inputSizes[size]}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => (error ? '#dc3545' : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme, error }) => (error ? 'rgba(220, 53, 69, 0.1)' : 'rgba(59, 130, 246, 0.1)')};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.backgroundDisabled || '#f3f4f6'};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted || '#9ca3af'};
  }
`;

export const Select = styled.select<InputProps>`
  border: 1px solid ${({ theme, error }) => (error ? '#dc3545' : theme.colors.border || '#d1d5db')};
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.colors.backgroundPrimary || 'white'};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  ${({ size = 'medium' }) => inputSizes[size]}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => (error ? '#dc3545' : theme.colors.primary)};
    box-shadow: 0 0 0 3px ${({ theme, error }) => (error ? 'rgba(220, 53, 69, 0.1)' : 'rgba(59, 130, 246, 0.1)')};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.backgroundDisabled || '#f3f4f6'};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const FormHelperText = styled.span<{ error?: boolean }>`
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: ${({ theme, error }) => (error ? '#dc3545' : theme.colors.text.secondary)};
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-right: 8px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-right: 8px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  user-select: none;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border || '#e0e0e0'};
`;
