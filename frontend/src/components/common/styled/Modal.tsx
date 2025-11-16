/**
 * Shared Modal Components
 * Provides consistent modal/dialog styles across the application
 */

import styled from 'styled-components';

export const ModalOverlay = styled.div<{ visible?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: opacity 0.2s ease, visibility 0.2s ease;
  padding: 20px;
  overflow-y: auto;
`;

export const ModalContainer = styled.div<{ size?: 'small' | 'medium' | 'large' | 'fullscreen' }>`
  background: ${({ theme }) => theme.colors.backgroundPrimary || '${props.theme.colors.white}'};
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return '400px';
      case 'large':
        return '900px';
      case 'fullscreen':
        return '100%';
      default:
        return '600px';
    }
  }};
  width: 100%;
  max-height: ${({ size }) => (size === 'fullscreen' ? '100vh' : '90vh')};
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ModalCloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundSecondary || 'rgba(0, 0, 0, 0.05)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const ModalBody = styled.div<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '24px')};
  overflow-y: auto;
  flex: 1;
`;

export const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border || '${props.theme.colors.border}'};
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;
