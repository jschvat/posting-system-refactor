import styled from 'styled-components';

export const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 18px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
`;

export const ErrorMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.error};
  font-size: 16px;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 16px 0;
`;

export const MemberCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
`;

export const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const MemberAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

export const MemberAvatarPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
`;

export const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MemberName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const MemberUsername = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const MemberDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const MemberActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ApproveButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: ${props => props.theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RejectButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.error};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error}10;
    border-color: ${props => props.theme.colors.error};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SearchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const PostStatus = styled.span<{ $status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$status === 'removed' ? props.theme.colors.error : props.theme.colors.warning};
  color: ${({ theme }) => theme.colors.white};
`;

export const RemovalReason = styled.div`
  padding: 8px;
  background: ${({ theme }) => theme.colors.errorLight};
  border-left: 3px solid ${({ theme }) => theme.colors.error};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  border-radius: 4px;
  margin-top: 8px;
`;

// Post-related styled components
export const PostCard = styled.div`
  padding: 16px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
`;

export const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const PostAuthor = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const PostDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const PostTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

export const PostContent = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 8px 0;
`;

export const PostUrl = styled.a`
  font-size: 13px;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  word-break: break-all;
  display: block;
  margin-bottom: 12px;

  &:hover {
    text-decoration: underline;
  }
`;

export const PostActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

// Member management components
export const MemberManagementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const RoleFilterBar = styled.div`
  display: flex;
  gap: 8px;
`;

export const RoleFilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.text};
  font-size: 13px;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.$active ? props.theme.colors.white : props.theme.colors.primary};
  }
`;

export const MemberRoleBadge = styled.span<{ $role: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.$role === 'admin') return props.theme.colors.error;
    if (props.$role === 'moderator') return props.theme.colors.success;
    return props.theme.colors.text.muted;
  }};
  color: ${({ theme }) => theme.colors.white};
`;

export const RoleSelect = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BanButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.error};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error}10;
    border-color: ${props => props.theme.colors.error};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RemoveButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error}10;
    border-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.error};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Activity log components
export const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
`;

export const ActivityIcon = styled.div`
  font-size: 24px;
  line-height: 1;
`;

export const ActivityContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ActivityAction = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text};

  strong {
    font-weight: 600;
  }
`;

export const ActivityTarget = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const ActivityDetails = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

export const ActivityTimestamp = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;
