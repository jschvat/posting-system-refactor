import React, { useState, useEffect } from 'react';
import { useToast } from '../../Toast';
import groupsApi from '../../../services/groupsApi';
import { getErrorMessage } from './moderationUtils';
import {
  LoadingMessage,
  EmptyState,
  SearchHeader,
  SectionTitle,
  SearchInput,
  ApproveButton,
  MemberCard,
  MemberInfo,
  MemberAvatar,
  MemberAvatarPlaceholder,
  MemberDetails,
  MemberName,
  MemberUsername,
  MemberDate,
  MemberActions
} from './ModerationStyles';

interface BannedMembersTabProps {
  slug: string;
}

export const BannedMembersTab: React.FC<BannedMembersTabProps> = ({ slug }) => {
  const { showError, showSuccess } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBannedMembers();
  }, [slug]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers((members || []).filter(member =>
        member.username?.toLowerCase().includes(query) ||
        member.display_name?.toLowerCase().includes(query) ||
        `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, members]);

  const loadBannedMembers = async () => {
    try {
      setLoading(true);
      const res = await groupsApi.getBannedMembers(slug);
      if (res.success && res.data) {
        setMembers(res.data.members);
        setFilteredMembers(res.data.members);
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (userId: number, username: string) => {
    if (!window.confirm(`Unban ${username}?`)) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.unbanMember(slug, userId);
      if (res.success) {
        showSuccess('Member unbanned successfully');
        loadBannedMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading banned members...</LoadingMessage>;
  }

  if (members.length === 0) {
    return <EmptyState>No banned members</EmptyState>;
  }

  return (
    <div>
      <SearchHeader>
        <SectionTitle>Banned Members ({filteredMembers.length} / {members.length})</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </SearchHeader>
      {filteredMembers.length === 0 && searchQuery && (
        <EmptyState>No banned members found matching "{searchQuery}"</EmptyState>
      )}
      {filteredMembers.map(member => (
        <MemberCard key={member.user_id}>
          <MemberInfo>
            {member.avatar_url && <MemberAvatar src={member.avatar_url} alt={member.username} />}
            {!member.avatar_url && <MemberAvatarPlaceholder>{member.username.charAt(0).toUpperCase()}</MemberAvatarPlaceholder>}
            <MemberDetails>
              <MemberName>{member.display_name || member.username}</MemberName>
              <MemberUsername>@{member.username}</MemberUsername>
              <MemberDate>Banned {new Date(member.joined_at).toLocaleDateString()}</MemberDate>
            </MemberDetails>
          </MemberInfo>
          <MemberActions>
            <ApproveButton
              onClick={() => handleUnban(member.user_id, member.username)}
              disabled={actionLoading === member.user_id}
            >
              {actionLoading === member.user_id ? 'Processing...' : 'Unban'}
            </ApproveButton>
          </MemberActions>
        </MemberCard>
      ))}
    </div>
  );
};
