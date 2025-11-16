import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../../types/group';
import { formatNumber } from '../../utils/numberHelpers';

interface GroupHeaderProps {
  group: Group;
  isMember: boolean;
  userRole: string | null;
  moderators: any[];
  onJoin: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
  canModerate: boolean;
  groupSlug: string;
}

const GroupHeaderComponent: React.FC<GroupHeaderProps> = ({
  group,
  isMember,
  userRole,
  moderators,
  onJoin,
  onLeave,
  onOpenChat,
  canModerate,
  groupSlug
}) => {
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();

  return (
    <GroupHeader>
      {group.banner_url && <Banner src={group.banner_url} alt={group.display_name} />}
      <GroupInfo>
        <GroupIconSection>
          {group.avatar_url && <GroupIcon src={group.avatar_url} alt={group.display_name} />}
          {!group.avatar_url && <DefaultIcon>{group.name.charAt(0).toUpperCase()}</DefaultIcon>}
        </GroupIconSection>
        <GroupMeta>
          <GroupName>{group.display_name}</GroupName>
          <GroupSlug>g/{group.name}</GroupSlug>
          {group.description && <GroupDescription>{group.description}</GroupDescription>}
          <GroupStats>
            <Stat>{formatNumber(group.member_count)} members</Stat>
            <Separator>•</Separator>
            <Stat>{formatNumber(group.post_count)} posts</Stat>
            {moderators.length > 0 && (
              <>
                <Separator>•</Separator>
                <ModeratorsList>
                  {moderators.map((mod: any) => (
                    <ModeratorItem key={mod.user_id}>
                      <ModeratorAvatar
                        src={mod.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mod.username || 'User')}&background=random`}
                        alt={mod.username}
                      />
                      <ModeratorLink to={`/user/${mod.user_id}`} $isAdmin={mod.role === 'admin'}>
                        {mod.display_name || mod.username}
                      </ModeratorLink>
                    </ModeratorItem>
                  ))}
                </ModeratorsList>
              </>
            )}
          </GroupStats>
        </GroupMeta>
        <GroupActions>
          {user && !isMember && (
            <ActionButton onClick={onJoin}>Join</ActionButton>
          )}
          {user && isMember && (
            <>
              {group?.settings?.chat_enabled && (
                <ActionButton onClick={onOpenChat}>
                  💬 Chat
                </ActionButton>
              )}
              <ActionButton $secondary onClick={onLeave}>Leave</ActionButton>
              {canModerate && (
                <ActionButton onClick={() => navigate(`/g/${groupSlug}/moderate`)}>
                  Moderate
                </ActionButton>
              )}
              {userRole === 'admin' && (
                <ActionButton onClick={() => navigate(`/g/${groupSlug}/settings`)}>
                  Settings
                </ActionButton>
              )}
            </>
          )}
        </GroupActions>
      </GroupInfo>
    </GroupHeader>
  );
};

// Styled Components
const GroupHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const Banner = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const GroupInfo = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const GroupIconSection = styled.div`
  margin-top: -40px;
`;

const GroupIcon = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 4px solid ${props => props.theme.colors.surface};
  object-fit: cover;
`;

const DefaultIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 4px solid ${props => props.theme.colors.surface};
  background: ${props => props.theme.colors.primary};
  color: ${props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
`;

const GroupMeta = styled.div`
  flex: 1;
`;

const GroupName = styled.h1`
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const GroupSlug = styled.div`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 12px;
`;

const GroupDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.text};
`;

const GroupStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const Stat = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const Separator = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const ModeratorsList = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ModeratorItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const ModeratorAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const ModeratorLink = styled(Link)<{ $isAdmin?: boolean }>`
  color: ${props => props.$isAdmin ? '${props.theme.colors.error}' : '${props.theme.colors.success}'};
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    color: ${props => props.$isAdmin ? '${props.theme.colors.errorDark}' : '${props => props.theme.colors.success}'};
    text-decoration: underline;
  }
`;

const GroupActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ $secondary?: boolean }>`
  padding: 10px 24px;
  border-radius: 20px;
  border: 1px solid ${props => props.$secondary ? props.theme.colors.border : props.theme.colors.primary};
  background: ${props => props.$secondary ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.$secondary ? props.theme.colors.text : '${props.theme.colors.white}'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$secondary ? props.theme.colors.error : props.theme.colors.primary};
    border-color: ${props => props.$secondary ? props.theme.colors.error : props.theme.colors.primary};
    color: ${props => props.$secondary ? props.theme.colors.error : '${props.theme.colors.white}'};
  }
`;

export default GroupHeaderComponent;
