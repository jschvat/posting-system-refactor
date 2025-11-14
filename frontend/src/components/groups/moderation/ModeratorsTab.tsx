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
  MemberRoleBadge,
  MemberActions,
  RemoveButton
} from './ModerationStyles';

interface ModeratorsTabProps {
  slug: string;
}

export const ModeratorsTab: React.FC<ModeratorsTabProps> = ({ slug }) => {
  const { showError, showSuccess } = useToast();
  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [showAddModerator, setShowAddModerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadModerators();
    loadAllMembers();
  }, [slug]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(allMembers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(allMembers.filter(member =>
        member.username?.toLowerCase().includes(query) ||
        member.display_name?.toLowerCase().includes(query) ||
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, allMembers]);

  const loadModerators = async () => {
    try {
      setLoading(true);
      const res = await groupsApi.getGroupMembers(slug, { status: 'active' });
      if (res.success && res.data) {
        const mods = (res.data.members || []).filter((m: any) =>
          m.role === 'moderator' || m.role === 'admin'
        );
        setModerators(mods);
      } else {
        setModerators([]);
      }
    } catch (err: any) {
      console.error('Error loading moderators:', err);
      showError(getErrorMessage(err));
      setModerators([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    try {
      const res = await groupsApi.getGroupMembers(slug, { status: 'active', role: 'member' });
      if (res.success && res.data) {
        setAllMembers(res.data.members || []);
        setFilteredMembers(res.data.members || []);
      }
    } catch (err: any) {
      console.error('Error loading members:', err);
    }
  };

  const handlePromoteToModerator = async (userId: number) => {
    try {
      setActionLoading(userId);
      const res = await groupsApi.updateMemberRole(slug, userId, { role: 'moderator' });
      if (res.success) {
        showSuccess('Member promoted to moderator');
        loadModerators();
        loadAllMembers();
        setShowAddModerator(false);
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemoteToMember = async (userId: number, username: string) => {
    if (!window.confirm(`Demote ${username} to regular member?`)) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.updateMemberRole(slug, userId, { role: 'member' });
      if (res.success) {
        showSuccess('Moderator demoted to member');
        loadModerators();
        loadAllMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading moderators...</LoadingMessage>;
  }

  return (
    <div>
      <SearchHeader>
        <SectionTitle>Moderators & Admins ({moderators.length})</SectionTitle>
        <ApproveButton onClick={() => setShowAddModerator(!showAddModerator)}>
          {showAddModerator ? 'Cancel' : 'Add Moderator'}
        </ApproveButton>
      </SearchHeader>

      {showAddModerator && (
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle style={{ fontSize: '16px', marginBottom: '12px' }}>Select member to promote:</SectionTitle>
          <SearchInput
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '12px', width: '100%' }}
          />
          {filteredMembers.length === 0 && searchQuery && (
            <EmptyState>No members found matching "{searchQuery}"</EmptyState>
          )}
          {filteredMembers.length === 0 && !searchQuery && (
            <EmptyState>No regular members available to promote</EmptyState>
          )}
          {filteredMembers.length > 0 && (
            filteredMembers.map(member => (
              <MemberCard key={member.user_id}>
                <MemberInfo>
                  {member.avatar_url && <MemberAvatar src={member.avatar_url} alt={member.username} />}
                  {!member.avatar_url && <MemberAvatarPlaceholder>{member.username.charAt(0).toUpperCase()}</MemberAvatarPlaceholder>}
                  <MemberDetails>
                    <MemberName>{member.display_name || member.username}</MemberName>
                    <MemberUsername>@{member.username}</MemberUsername>
                  </MemberDetails>
                </MemberInfo>
                <MemberActions>
                  <ApproveButton
                    onClick={() => handlePromoteToModerator(member.user_id)}
                    disabled={actionLoading === member.user_id}
                  >
                    {actionLoading === member.user_id ? 'Promoting...' : 'Promote to Moderator'}
                  </ApproveButton>
                </MemberActions>
              </MemberCard>
            ))
          )}
        </div>
      )}

      {moderators.length === 0 && <EmptyState>No moderators or admins found</EmptyState>}

      {moderators.map(moderator => (
        <MemberCard key={moderator.user_id}>
          <MemberInfo>
            {moderator.avatar_url && <MemberAvatar src={moderator.avatar_url} alt={moderator.username} />}
            {!moderator.avatar_url && <MemberAvatarPlaceholder>{moderator.username.charAt(0).toUpperCase()}</MemberAvatarPlaceholder>}
            <MemberDetails>
              <MemberName>{moderator.display_name || moderator.username}</MemberName>
              <MemberUsername>@{moderator.username}</MemberUsername>
              <MemberRoleBadge $role={moderator.role}>{moderator.role}</MemberRoleBadge>
              {moderator.joined_at && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Joined {new Date(moderator.joined_at).toLocaleDateString()}
                </div>
              )}
            </MemberDetails>
          </MemberInfo>
          <MemberActions>
            {moderator.role === 'moderator' && (
              <RemoveButton
                onClick={() => handleDemoteToMember(moderator.user_id, moderator.username)}
                disabled={actionLoading === moderator.user_id}
              >
                {actionLoading === moderator.user_id ? 'Demoting...' : 'Demote to Member'}
              </RemoveButton>
            )}
            {moderator.role === 'admin' && (
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                Group Admin (cannot be demoted)
              </div>
            )}
          </MemberActions>
        </MemberCard>
      ))}
    </div>
  );
};
