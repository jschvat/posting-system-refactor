import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import groupsApi from '../services/groupsApi';
import { Group } from '../types/group';
import { BasicInfoSection } from '../components/groups/settings/BasicInfoSection';
import { PrivacySection } from '../components/groups/settings/PrivacySection';
import { GroupChatSection } from '../components/groups/settings/GroupChatSection';
import { PostTypesSection } from '../components/groups/settings/PostTypesSection';
import { ModeratorPermissionsSection } from '../components/groups/settings/ModeratorPermissionsSection';
import { RulesSection } from '../components/groups/settings/RulesSection';
import { getErrorMessage } from '../utils/errorHandlers';

const GroupSettingsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'invite_only'>('public');
  const [postApprovalRequired, setPostApprovalRequired] = useState(false);
  const [rules, setRules] = useState('');

  // Post type settings
  const [allowTextPosts, setAllowTextPosts] = useState(true);
  const [allowLinkPosts, setAllowLinkPosts] = useState(true);
  const [allowImagePosts, setAllowImagePosts] = useState(true);
  const [allowVideoPosts, setAllowVideoPosts] = useState(true);
  const [allowPollPosts, setAllowPollPosts] = useState(true);

  // Moderator permission settings
  const [moderatorCanRemovePosts, setModeratorCanRemovePosts] = useState(true);
  const [moderatorCanRemoveComments, setModeratorCanRemoveComments] = useState(true);
  const [moderatorCanBanMembers, setModeratorCanBanMembers] = useState(true);
  const [moderatorCanApprovePosts, setModeratorCanApprovePosts] = useState(true);
  const [moderatorCanApproveMembers, setModeratorCanApproveMembers] = useState(true);
  const [moderatorCanPinPosts, setModeratorCanPinPosts] = useState(true);
  const [moderatorCanLockPosts, setModeratorCanLockPosts] = useState(true);

  // Group chat settings
  const [chatEnabled, setChatEnabled] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadGroup();
  }, [slug, user]);

  const loadGroup = async () => {
    if (!slug || !user) return;

    try {
      setLoading(true);
      setError(null);

      const groupRes = await groupsApi.getGroup(slug);
      if (groupRes.success && groupRes.data) {
        const g = (groupRes.data as any).group || groupRes.data;
        setGroup(g);
        setDisplayName(g.display_name);
        setDescription(g.description || '');
        setVisibility(g.visibility);
        setPostApprovalRequired(g.post_approval_required);
        setRules(g.rules || '');

        // Post type settings
        setAllowTextPosts(g.allow_text_posts ?? true);
        setAllowLinkPosts(g.allow_link_posts ?? true);
        setAllowImagePosts(g.allow_image_posts ?? true);
        setAllowVideoPosts(g.allow_video_posts ?? true);
        setAllowPollPosts(g.allow_poll_posts ?? true);

        // Moderator permissions
        setModeratorCanRemovePosts(g.moderator_can_remove_posts ?? true);
        setModeratorCanRemoveComments(g.moderator_can_remove_comments ?? true);
        setModeratorCanBanMembers(g.moderator_can_ban_members ?? true);
        setModeratorCanApprovePosts(g.moderator_can_approve_posts ?? true);
        setModeratorCanApproveMembers(g.moderator_can_approve_members ?? true);
        setModeratorCanPinPosts(g.moderator_can_pin_posts ?? true);
        setModeratorCanLockPosts(g.moderator_can_lock_posts ?? true);

        // Chat settings
        setChatEnabled(g.settings?.chat_enabled ?? false);

        // Check if user is admin
        const membershipRes = await groupsApi.checkMembership(slug);
        if (membershipRes.success && membershipRes.data) {
          const { is_member, membership } = membershipRes.data;
          if (!is_member || !membership || membership.role !== 'admin') {
            setError('You must be an admin to access this page');
            navigate(`/g/${slug}`);
            return;
          }
        } else {
          setError('Failed to verify membership');
          navigate(`/g/${slug}`);
          return;
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update group chat setting if changed
      const currentChatEnabled = group?.settings?.chat_enabled ?? false;
      if (chatEnabled !== currentChatEnabled) {
        const chatResponse = await groupsApi.toggleGroupChat(slug, chatEnabled);
        if (!chatResponse.success) {
          throw new Error('Failed to update group chat settings');
        }
      }

      // Update other group settings
      const response = await groupsApi.updateGroup(slug, {
        display_name: displayName,
        description,
        visibility,
        post_approval_required: postApprovalRequired,
        rules,
        allow_text_posts: allowTextPosts,
        allow_link_posts: allowLinkPosts,
        allow_image_posts: allowImagePosts,
        allow_video_posts: allowVideoPosts,
        allow_poll_posts: allowPollPosts,
        moderator_can_remove_posts: moderatorCanRemovePosts,
        moderator_can_remove_comments: moderatorCanRemoveComments,
        moderator_can_ban_members: moderatorCanBanMembers,
        moderator_can_approve_posts: moderatorCanApprovePosts,
        moderator_can_approve_members: moderatorCanApproveMembers,
        moderator_can_pin_posts: moderatorCanPinPosts,
        moderator_can_lock_posts: moderatorCanLockPosts
      });

      if (response.success) {
        setSuccess('Group settings updated successfully!');
        setTimeout(() => {
          navigate(`/g/${slug}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to update group settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading group settings...</LoadingMessage>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container>
        <ErrorMessage>Group not found</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Group Settings</Title>
        <Subtitle>g/{group.name}</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <BasicInfoSection
          displayName={displayName}
          description={description}
          onDisplayNameChange={setDisplayName}
          onDescriptionChange={setDescription}
        />

        <PrivacySection
          visibility={visibility}
          postApprovalRequired={postApprovalRequired}
          onVisibilityChange={setVisibility}
          onPostApprovalRequiredChange={setPostApprovalRequired}
        />

        <GroupChatSection
          chatEnabled={chatEnabled}
          onChatEnabledChange={setChatEnabled}
        />

        <PostTypesSection
          allowTextPosts={allowTextPosts}
          onAllowTextPostsChange={setAllowTextPosts}
          allowLinkPosts={allowLinkPosts}
          onAllowLinkPostsChange={setAllowLinkPosts}
          allowImagePosts={allowImagePosts}
          onAllowImagePostsChange={setAllowImagePosts}
          allowVideoPosts={allowVideoPosts}
          onAllowVideoPostsChange={setAllowVideoPosts}
          allowPollPosts={allowPollPosts}
          onAllowPollPostsChange={setAllowPollPosts}
        />

        <ModeratorPermissionsSection
          moderatorCanRemovePosts={moderatorCanRemovePosts}
          onModeratorCanRemovePostsChange={setModeratorCanRemovePosts}
          moderatorCanRemoveComments={moderatorCanRemoveComments}
          onModeratorCanRemoveCommentsChange={setModeratorCanRemoveComments}
          moderatorCanBanMembers={moderatorCanBanMembers}
          onModeratorCanBanMembersChange={setModeratorCanBanMembers}
          moderatorCanApprovePosts={moderatorCanApprovePosts}
          onModeratorCanApprovePostsChange={setModeratorCanApprovePosts}
          moderatorCanApproveMembers={moderatorCanApproveMembers}
          onModeratorCanApproveMembersChange={setModeratorCanApproveMembers}
          moderatorCanPinPosts={moderatorCanPinPosts}
          onModeratorCanPinPostsChange={setModeratorCanPinPosts}
          moderatorCanLockPosts={moderatorCanLockPosts}
          onModeratorCanLockPostsChange={setModeratorCanLockPosts}
        />

        <RulesSection
          rules={rules}
          onRulesChange={setRules}
        />

        <ButtonGroup>
          <CancelButton type="button" onClick={() => navigate(`/g/${slug}`)}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Subtitle = styled.div`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: ${props.theme.colors.errorLight};
  border: 1px solid ${props.theme.colors.error};
  border-radius: 8px;
  color: ${props.theme.colors.error};
  margin-bottom: 24px;
`;

const SuccessMessage = styled.div`
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid ${props.theme.colors.success};
  border-radius: 8px;
  color: ${props.theme.colors.success};
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  background: ${props => props.theme.colors.primary};
  color: ${props.theme.colors.white};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default GroupSettingsPage;
