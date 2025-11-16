/**
 * OnlineFollowers Component
 * Displays a list of followed users who are currently online
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OnlineIndicator } from '../common/OnlineIndicator';
import { FollowUser } from '../../services/api/followsApi';
import { ChatPopup } from '../messaging/ChatPopup';

const Container = styled.div`
  background: ${props.theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin: 0;
`;

const OnlineCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props.theme.colors.success};
  background: ${props.theme.colors.successLight};
  padding: 2px 8px;
  border-radius: 12px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props.theme.colors.borderLight};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props.theme.colors.border};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.text.muted};
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props.theme.colors.hover};
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props.theme.colors.white};
  font-weight: 600;
  font-size: 16px;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FullName = styled.div`
  font-size: 12px;
  color: ${props.theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MessageButton = styled.button`
  padding: 6px 12px;
  background: ${props.theme.colors.info};
  color: ${props.theme.colors.white};
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props.theme.colors.infoDark};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${props.theme.colors.text.secondary};
  font-size: 14px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${props.theme.colors.text.secondary};
  font-size: 14px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${props.theme.colors.error};
  font-size: 14px;
`;

interface OnlineFollowersProps {
  maxVisible?: number;
  showMessageButton?: boolean;
}

export const OnlineFollowers: React.FC<OnlineFollowersProps> = ({
  maxVisible = 10,
  showMessageButton = true
}) => {
  const navigate = useNavigate();
  const { onlineUsers, followedUsers, isLoading, error } = useOnlineStatus();
  const [chatUser, setChatUser] = useState<{ id: number; username: string; avatarUrl?: string } | null>(null);

  // Filter online users
  const onlineFollowers = followedUsers.filter(user => onlineUsers[user.id]);

  // Limit visible users
  const visibleOnlineFollowers = onlineFollowers.slice(0, maxVisible);

  const handleUserClick = (user: FollowUser) => {
    navigate(`/profile/${user.username}`);
  };

  const handleMessageClick = (e: React.MouseEvent, user: FollowUser) => {
    e.stopPropagation();
    setChatUser({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url
    });
  };

  const getInitials = (user: FollowUser): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getFullName = (user: FollowUser): string | null => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return null;
  };

  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Online Now</Title>
        </Header>
        <LoadingState>Loading...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Online Now</Title>
        </Header>
        <ErrorState>{error}</ErrorState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <Title>Online Now</Title>
          {onlineFollowers.length > 0 && (
            <OnlineCount>{onlineFollowers.length}</OnlineCount>
          )}
        </Header>

        {visibleOnlineFollowers.length === 0 ? (
          <EmptyState>
            {followedUsers.length === 0
              ? 'Follow users to see when they\'re online'
              : 'None of your followed users are online'}
          </EmptyState>
        ) : (
          <UserList>
            {visibleOnlineFollowers.map(user => (
              <UserItem key={user.id} onClick={() => handleUserClick(user)}>
                <AvatarContainer>
                  {user.avatar_url ? (
                    <Avatar src={user.avatar_url} alt={user.username} />
                  ) : (
                    <DefaultAvatar>{getInitials(user)}</DefaultAvatar>
                  )}
                  <OnlineIndicator isOnline={true} size="small" />
                </AvatarContainer>

                <UserInfo>
                  <Username>@{user.username}</Username>
                  {getFullName(user) && <FullName>{getFullName(user)}</FullName>}
                </UserInfo>

                {showMessageButton && (
                  <MessageButton onClick={(e) => handleMessageClick(e, user)}>
                    Message
                  </MessageButton>
                )}
              </UserItem>
            ))}
          </UserList>
        )}
      </Container>

      {chatUser && (
        <ChatPopup
          userId={chatUser.id}
          username={chatUser.username}
          avatarUrl={chatUser.avatarUrl}
          onClose={() => setChatUser(null)}
        />
      )}
    </>
  );
};
