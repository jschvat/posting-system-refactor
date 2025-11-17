/**
 * Shared Button Components
 * Provides consistent button styles across the application
 */

import styled, { css } from 'styled-components';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryDark || ${({ theme }) => theme.colors.primaryDark}};
    }
  `,

  secondary: css`
    background: ${({ theme }) => theme.colors.secondary || ${({ theme }) => theme.colors.text.secondary}};
    color: ${({ theme }) => theme.colors.white};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.secondaryDark || ${({ theme }) => theme.colors.text.primary}};
    }
  `,

  danger: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.white};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.errorDark};
    }
  `,

  success: css`
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.white};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.successDark};
    }
  `,

  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.white};
    }
  `,

  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: none;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.backgroundSecondary || 'rgba(0, 0, 0, 0.05)'};
    }
  `,

  link: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: none;
    padding: 0;
    text-decoration: underline;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primaryDark || ${({ theme }) => theme.colors.primaryDark}};
    }
  `,
};

const buttonSizes = {
  small: css`
    padding: 6px 12px;
    font-size: 14px;
  `,

  medium: css`
    padding: 10px 20px;
    font-size: 16px;
  `,

  large: css`
    padding: 14px 28px;
    font-size: 18px;
  `,
};

export const Button = styled.button<ButtonProps>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  user-select: none;

  /* Size variants */
  ${({ size = 'medium' }) => buttonSizes[size]}

  /* Color variants */
  ${({ variant = 'primary' }) => buttonVariants[variant]}

  /* Full width */
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Loading state */
  ${({ isLoading }) =>
    isLoading &&
    css`
      position: relative;
      color: transparent;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin-left: -8px;
        margin-top: -8px;
        border: 2px solid currentColor;
        border-radius: 50%;
        border-top-color: transparent;
        animation: button-loading-spinner 0.6s linear infinite;
      }

      @keyframes button-loading-spinner {
        from {
          transform: rotate(0turn);
        }
        to {
          transform: rotate(1turn);
        }
      }
    `}

  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const IconButton = styled(Button)`
  padding: 8px;
  border-radius: 50%;
  min-width: auto;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  &.vertical {
    flex-direction: column;
  }

  &.attached {
    gap: 0;

    ${Button} {
      border-radius: 0;

      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }

      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }
  }
`;
