/**
 * Shared Card Components
 * Provides consistent card/container styles across the application
 */

import styled, { css } from 'styled-components';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  clickable?: boolean;
}

const cardVariants = {
  default: css`
    background: ${({ theme }) => theme.colors.backgroundPrimary || '${props.theme.colors.white}'};
    border: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
    box-shadow: none;
  `,

  elevated: css`
    background: ${({ theme }) => theme.colors.backgroundPrimary || '${props.theme.colors.white}'};
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `,

  outlined: css`
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
    box-shadow: none;
  `,

  flat: css`
    background: ${({ theme }) => theme.colors.backgroundSecondary || '${props.theme.colors.hover}'};
    border: none;
    box-shadow: none;
  `,
};

const cardPadding = {
  none: css`
    padding: 0;
  `,
  small: css`
    padding: 12px;
  `,
  medium: css`
    padding: 20px;
  `,
  large: css`
    padding: 32px;
  `,
};

export const Card = styled.div<CardProps>`
  border-radius: 8px;
  transition: all 0.2s ease;

  /* Variant styles */
  ${({ variant = 'default' }) => cardVariants[variant]}

  /* Padding */
  ${({ padding = 'medium' }) => cardPadding[padding]}

  /* Hoverable effect */
  ${({ hoverable }) =>
    hoverable &&
    css`
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
    `}

  /* Clickable cursor */
  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const CardSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const CardBody = styled.div`
  flex: 1;
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
`;

export const CardImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px 8px 0 0;
  object-fit: cover;
`;

export const CardGrid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 3 }) => columns}, 1fr);
  gap: ${({ gap = '20px' }) => gap};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
