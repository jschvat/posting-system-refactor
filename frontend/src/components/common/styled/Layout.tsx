/**
 * Shared Layout Components
 * Provides consistent layout patterns across the application
 */

import styled from 'styled-components';

export const Container = styled.div<{ maxWidth?: string }>`
  max-width: ${({ maxWidth = '1200px' }) => maxWidth};
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const FlexContainer = styled.div<{
  direction?: 'row' | 'column';
  justify?: string;
  align?: string;
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'stretch' }) => align};
  gap: ${({ gap = '0' }) => gap};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 1 }) => columns}, 1fr);
  gap: ${({ gap = '20px' }) => gap};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(${({ columns = 1 }) => Math.min(columns, 2)}, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Spacer = styled.div<{ size?: string }>`
  height: ${({ size = '20px' }) => size};
  width: 100%;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
  margin: 20px 0;
`;

export const Section = styled.section<{ padding?: string }>`
  padding: ${({ padding = '40px 0' }) => padding};

  @media (max-width: 768px) {
    padding: 24px 0;
  }
`;

export const PageHeader = styled.header`
  margin-bottom: 32px;
`;

export const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const PageSubtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ThreeColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  min-width: 0; /* Prevents flex items from overflowing */
`;

export const Sidebar = styled.aside`
  flex-shrink: 0;
`;

export const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

export const ScrollContainer = styled.div<{ maxHeight?: string }>`
  max-height: ${({ maxHeight = '500px' }) => maxHeight};
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundSecondary || '${props.theme.colors.borderLight}'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border || '${props.theme.colors.text.secondary}'};
    border-radius: 4px;

    &:hover {
      background: ${props.theme.colors.text.primary};
    }
  }
`;
