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
  MemberManagementHeader,
  RoleFilterBar,
  RoleFilterButton,
  MemberCard,
  MemberInfo,
  MemberAvatar,
  MemberAvatarPlaceholder,
  MemberDetails,
  MemberName,
  MemberUsername,
  MemberRoleBadge,
  MemberActions,
  RoleSelect,
  BanButton,
  RemoveButton
} from './ModerationStyles';

interface MembersTabProps {
  slug: string;
  userRole: string;
}

export const MembersTab: React.FC<MembersTabProps> = ({ slug, userRole }) => {
  const { showError, showSuccess } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, [slug, roleFilter]);

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

  const loadMembers = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'active' };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      const res = await groupsApi.getGroupMembers(slug, params);
      if (res.success && res.data) {
        setMembers(res.data.members || []);
        setFilteredMembers(res.data.members || []);
      } else {
        setMembers([]);
        setFilteredMembers([]);
      }
    } catch (err: any) {
      console.error('Error loading members:', err);
      showError(getErrorMessage(err));
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!window.confirm(`Change this member's role to ${newRole}?`)) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.updateMemberRole(slug, userId, { role: newRole as any });
      if (res.success) {
        showSuccess('Role updated successfully');
        loadMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanMember = async (userId: number, username: string) => {
    const reason = prompt(`Ban ${username}? Enter reason:`);
    if (!reason) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.banMember(slug, userId, { banned_reason: reason });
      if (res.success) {
        showSuccess('Member banned successfully');
        loadMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: number, username: string) => {
    if (!window.confirm(`Remove ${username} from this group? This action cannot be undone.`)) return;

    try {
      setActionLoading(userId);
      const res = await groupsApi.removeMember(slug, userId);
      if (res.success) {
        showSuccess('Member removed successfully');
        loadMembers();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading members...</LoadingMessage>;
  }

  return (
    <div>
      <SearchHeader>
        <SectionTitle>Members ({filteredMembers.length} / {members.length})</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </SearchHeader>
      <MemberManagementHeader>
        <div></div>
        <RoleFilterBar>
          <RoleFilterButton $active={roleFilter === 'all'} onClick={() => setRoleFilter('all')}>All</RoleFilterButton>
          <RoleFilterButton $active={roleFilter === 'admin'} onClick={() => setRoleFilter('admin')}>Admins</RoleFilterButton>
          <RoleFilterButton $active={roleFilter === 'moderator'} onClick={() => setRoleFilter('moderator')}>Moderators</RoleFilterButton>
          <RoleFilterButton $active={roleFilter === 'member'} onClick={() => setRoleFilter('member')}>Members</RoleFilterButton>
        </RoleFilterBar>
      </MemberManagementHeader>

      {members.length === 0 && <EmptyState>No members found</EmptyState>}
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
              <MemberRoleBadge $role={member.role}>{member.role}</MemberRoleBadge>
            </MemberDetails>
          </MemberInfo>
          {userRole === 'admin' && (
            <MemberActions>
              {member.role !== 'admin' && (
                <RoleSelect
                  value={member.role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChangeRole(member.user_id, e.target.value)}
                  disabled={actionLoading === member.user_id}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </RoleSelect>
              )}
              <BanButton
                onClick={() => handleBanMember(member.user_id, member.username)}
                disabled={actionLoading === member.user_id}
              >
                Ban
              </BanButton>
              {member.role !== 'admin' && (
                <RemoveButton
                  onClick={() => handleRemoveMember(member.user_id, member.username)}
                  disabled={actionLoading === member.user_id}
                >
                  Remove
                </RemoveButton>
              )}
            </MemberActions>
          )}
        </MemberCard>
      ))}
    </div>
  );
};
