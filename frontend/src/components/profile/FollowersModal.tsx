/**
 * FollowersModal component - displays followers or following list in a modal
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { followsApi, getUserAvatarUrl } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: number;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10000;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 4px 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const UserAvatar = styled.div<{ $hasImage?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => $hasImage ? 'transparent' : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props.theme.colors.white};
  font-weight: bold;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserDisplayName = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1rem;
`;

const UserUsername = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ErrorState = styled.div`
  background: ${({ theme }) => theme.colors.error}20;
  border: 1px solid ${({ theme }) => theme.colors.error}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.error};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${props.theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
`;

const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, type, userId }) => {
  // Fetch followers or following list
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [type, userId],
    queryFn: () => type === 'followers'
      ? followsApi.getFollowers(userId)
      : followsApi.getFollowing(userId),
    enabled: isOpen && !!userId,
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const users = type === 'followers'
    ? data?.data?.followers || []
    : data?.data?.following || [];

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <>
      <Overlay onClick={handleOverlayClick} />
      <Modal>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {isLoading ? (
          <LoadingSpinner size="medium" text={`Loading ${type}...`} />
        ) : error ? (
          <ErrorState>
            <h3>Failed to load {type}</h3>
            <p>Something went wrong while loading the {type}.</p>
            <RetryButton onClick={() => refetch()}>
              Try Again
            </RetryButton>
          </ErrorState>
        ) : users.length > 0 ? (
          <UserList>
            {users.map((user: any) => (
              <UserItem
                key={user.id}
                to={`/profile/${user.id}`}
                onClick={onClose}
              >
                <UserAvatar $hasImage={!!user.avatar_url}>
                  {user.avatar_url ? (
                    <img src={getUserAvatarUrl(user)} alt={user.username} />
                  ) : (
                    user.first_name?.charAt(0) || user.username?.charAt(0) || '?'
                  )}
                </UserAvatar>
                <UserInfo>
                  <UserDisplayName>{user.first_name} {user.last_name}</UserDisplayName>
                  <UserUsername>@{user.username}</UserUsername>
                </UserInfo>
              </UserItem>
            ))}
          </UserList>
        ) : (
          <EmptyState>
            <h3>No {type} yet</h3>
            <p>
              {type === 'followers'
                ? "This user doesn't have any followers yet."
                : "This user isn't following anyone yet."
              }
            </p>
          </EmptyState>
        )}
      </Modal>
    </>
  );
};

export default FollowersModal;
