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
  MemberCard,
  MemberInfo,
  MemberAvatar,
  MemberAvatarPlaceholder,
  MemberDetails,
  MemberName,
  MemberUsername,
  MemberDate,
  MemberActions,
  ApproveButton,
  RejectButton
} from './ModerationStyles';

interface PendingMembersTabProps {
  slug: string;
}

export const PendingMembersTab: React.FC<PendingMembersTabProps> = ({ slug }) => {
  const [members, setMembers] = useState<any[]>([]);
  const { showError, showSuccess } = useToast();
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPendingMembers();
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

  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const res = await groupsApi.getPendingMembers(slug);
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

  const handleApprove = async (userId: number) => {
    if (!window.confirm('Approve this membership request?')) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.approveMember(slug, userId);
      if (res.success) {
        showSuccess('Member approved successfully');
        loadPendingMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (!window.confirm('Reject this membership request? This action cannot be undone.')) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.rejectMember(slug, userId);
      if (res.success) {
        showSuccess('Membership request rejected');
        loadPendingMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading pending members...</LoadingMessage>;
  }

  if (members.length === 0) {
    return <EmptyState>No pending membership requests</EmptyState>;
  }

  return (
    <div>
      <SearchHeader>
        <SectionTitle>Pending Membership Requests ({filteredMembers.length} / {members.length})</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </SearchHeader>
      {filteredMembers.length === 0 && searchQuery && (
        <EmptyState>No members found matching "{searchQuery}"</EmptyState>
      )}
      {filteredMembers.map(member => (
        <MemberCard key={member.user_id}>
          <MemberInfo>
            {member.avatar_url && <MemberAvatar src={member.avatar_url} alt={member.username} />}
            {!member.avatar_url && <MemberAvatarPlaceholder>{member.username.charAt(0).toUpperCase()}</MemberAvatarPlaceholder>}
            <MemberDetails>
              <MemberName>{member.display_name || member.username}</MemberName>
              <MemberUsername>@{member.username}</MemberUsername>
              <MemberDate>Requested {new Date(member.joined_at).toLocaleDateString()}</MemberDate>
            </MemberDetails>
          </MemberInfo>
          <MemberActions>
            <ApproveButton
              onClick={() => handleApprove(member.user_id)}
              disabled={actionLoading === member.user_id}
            >
              {actionLoading === member.user_id ? 'Processing...' : 'Approve'}
            </ApproveButton>
            <RejectButton
              onClick={() => handleReject(member.user_id)}
              disabled={actionLoading === member.user_id}
            >
              Reject
            </RejectButton>
          </MemberActions>
        </MemberCard>
      ))}
    </div>
  );
};
