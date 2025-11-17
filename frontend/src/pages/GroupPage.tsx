import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import groupsApi from '../services/groupsApi';
import groupPostsApi from '../services/groupPostsApi';
import { Group, GroupPost, PostSortType, VoteType, CreatePostData } from '../types/group';
import GroupFeed from '../components/groups/GroupFeed';
import GroupHeader from '../components/groups/GroupHeader';
import GroupChatPopup from '../components/groups/GroupChatPopup';
import { messagesApi, Conversation, Message } from '../services/api/messagesApi';
import { usePagination } from '../hooks/usePagination';
import { getErrorMessage } from '../utils/errorHandlers';

const GroupPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<PostSortType>('hot');
  const pagination = usePagination({ initialPage: 1, itemsPerPage: 20 });
  const [showComposer, setShowComposer] = useState(false);
  const [moderators, setModerators] = useState<any[]>([]);

  // Chat popup state
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      loadGroupData();
      loadModerators();
    }
  }, [slug]);

  useEffect(() => {
    if (slug && group) {
      loadPosts();
    }
  }, [slug, group, sortBy, pagination.page]);

  const loadGroupData = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const groupResponse = await groupsApi.getGroup(slug);

      if (groupResponse.success && groupResponse.data) {
        const groupData = groupResponse.data as any;
        setGroup(groupData.group || groupData);

        // Check membership from group response (backend includes user_role and user_status)
        if (user) {
          setIsMember(groupData.user_status === 'active');
          setUserRole(groupData.user_role || null);
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const loadModerators = async () => {
    if (!slug) return;

    try {
      // Fetch admins and moderators
      const response = await groupsApi.getGroupMembers(slug, {
        limit: 50,
        status: 'active'
      });

      if (response.success && response.data) {
        const data = response.data as any;
        const members = data.members || data.items || [];

        // Filter for admin and moderator roles
        const modList = members.filter((m: any) =>
          m.role === 'admin' || m.role === 'moderator'
        );

        setModerators(modList);
      }
    } catch (err: any) {
      console.error('Failed to load moderators:', err);
      // Don't show error to user, just log it
    }
  };

  const loadPosts = async () => {
    if (!slug) return;

    try {
      const response = await groupPostsApi.getGroupPosts(slug, {
        page: pagination.page,
        limit: pagination.itemsPerPage,
        sort: sortBy
      });

      if (response.success && response.data) {
        const data = response.data as any;
        setPosts(data.posts || []);
        if (data.total) {
          pagination.setTotalItems(data.total);
        }
      }
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setPosts([]); // Ensure posts is always an array
    }
  };

  const loadGroupChat = async () => {
    if (!slug || !isMember) return;

    try {
      setChatLoading(true);
      const response = await groupsApi.getGroupChat(slug);
      if (response.success && response.data) {
        setConversation(response.data.conversation);
        // Load messages for the conversation
        const messagesResponse = await messagesApi.getMessages(response.data.conversation.id, { limit: 100 });
        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data.messages || []);
        } else {
          setMessages([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load group chat:', err);
      showError('Failed to load group chat');
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  // Load chat when opening popup
  useEffect(() => {
    if (showChatPopup && group?.settings?.chat_enabled && isMember && !conversation) {
      loadGroupChat();
    }
  }, [showChatPopup, group, isMember]);

  const handleJoin = async () => {
    if (!user || !slug) {
      navigate('/login');
      return;
    }

    try {
      const response = await groupsApi.joinGroup(slug);
      if (response.success) {
        setIsMember(true);
        if (group) {
          setGroup({ ...group, member_count: group.member_count + 1 });
        }
      }
    } catch (err: any) {
      showError(getErrorMessage(err) || 'Failed to join group');
    }
  };

  const handleLeave = async () => {
    if (!user || !slug) return;

    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await groupsApi.leaveGroup(slug);
      if (response.success) {
        setIsMember(false);
        setUserRole(null);
        if (group) {
          setGroup({ ...group, member_count: Math.max(0, group.member_count - 1) });
        }
      }
    } catch (err: any) {
      showError(getErrorMessage(err) || 'Failed to leave group');
    }
  };

  const handleCreatePost = async (data: CreatePostData) => {
    if (!slug) return;

    try {
      const response = await groupPostsApi.createPost(slug, data);
      if (response.success) {
        setShowComposer(false);
        loadPosts(); // Reload posts
        if (group?.post_approval_required && userRole === 'member') {
          showInfo('Your post has been submitted for approval by moderators.');
        }
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.toLowerCase().includes('member')) {
        showError('You must be a member of this group to create posts. Please join the group first.');
      } else {
        showError(errorMsg || 'Failed to create post');
      }
    }
  };

  const handleVote = async (postId: number, voteType: VoteType) => {
    if (!user || !slug) {
      navigate('/login');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      const response = await groupPostsApi.toggleVote(slug, postId, voteType, post?.user_vote);

      if (response.success && response.data) {
        setPosts(posts.map(p =>
          p.id === postId
            ? {
                ...p,
                upvotes: response.data!.counts.upvotes,
                downvotes: response.data!.counts.downvotes,
                score: response.data!.counts.score,
                user_vote: response.data!.counts.user_vote
              }
            : p
        ));
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      if (errorMsg.toLowerCase().includes('member')) {
        showError('You must be a member of this group to vote on posts. Please join the group first.');
      } else {
        showError(errorMsg || 'Failed to vote');
      }
    }
  };

  const handlePin = async (postId: number) => {
    if (!slug) return;

    try {
      await groupPostsApi.togglePinPost(slug, postId);
      loadPosts();
    } catch (err: any) {
      showError(getErrorMessage(err) || 'Failed to pin post');
    }
  };

  const handleLock = async (postId: number) => {
    if (!slug) return;

    try {
      await groupPostsApi.toggleLockPost(slug, postId);
      loadPosts();
    } catch (err: any) {
      showError(getErrorMessage(err) || 'Failed to lock post');
    }
  };

  const handleRemove = async (postId: number) => {
    if (!slug) return;

    const reason = window.prompt('Enter removal reason:');
    if (!reason) return;

    try {
      await groupPostsApi.removePost(slug, postId, { removal_reason: reason });
      loadPosts();
    } catch (err: any) {
      showError(getErrorMessage(err) || 'Failed to remove post');
    }
  };

  // Chat message handlers
  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      const response = await messagesApi.sendMessage(conversation.id, {
        content,
        message_type: 'text'
      });

      if (response.success && response.data) {
        setMessages(prev => [...(prev || []), response.data!]);
      }
    } catch (err: any) {
      showError('Failed to send message');
    }
  };

  const handleEditMessage = async (messageId: number, content: string) => {
    try {
      const response = await messagesApi.editMessage(messageId, content);
      if (response.success && response.data) {
        setMessages(prev => (prev || []).map(msg =>
          msg.id === messageId
            ? { ...msg, content, edited_at: new Date().toISOString() }
            : msg
        ));
      }
    } catch (err: any) {
      showError('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const response = await messagesApi.deleteMessage(messageId);
      if (response.success) {
        setMessages(prev => (prev || []).map(msg =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), content: 'This message was deleted' }
            : msg
        ));
      }
    } catch (err: any) {
      showError('Failed to delete message');
    }
  };

  const handleReactionToggle = async (messageId: number, emoji: string) => {
    try {
      const response = await messagesApi.toggleReaction(messageId, emoji);
      if (response.success && response.data) {
        setMessages(prev => (prev || []).map(msg =>
          msg.id === messageId
            ? { ...msg, reactions: response.data!.reactions }
            : msg
        ));
      }
    } catch (err: any) {
      showError('Failed to toggle reaction');
    }
  };

  const canModerate = userRole === 'moderator' || userRole === 'admin';

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading group...</LoadingMessage>
      </Container>
    );
  }

  if (error || !group) {
    return (
      <Container>
        <ErrorMessage>{error || 'Group not found'}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <GroupHeader
        group={group}
        isMember={isMember}
        userRole={userRole}
        moderators={moderators}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onOpenChat={() => setShowChatPopup(true)}
        canModerate={canModerate}
        groupSlug={slug!}
      />

      <ContentArea>
        <MainContent>
          <GroupFeed
            posts={posts}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showComposer={showComposer}
            onToggleComposer={() => setShowComposer(!showComposer)}
            isMember={isMember}
            group={group}
            userRole={userRole}
            onCreatePost={handleCreatePost}
            onVote={handleVote}
            canModerate={canModerate}
            onPin={handlePin}
            onLock={handleLock}
            onRemove={handleRemove}
            groupSlug={slug!}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            user={user}
          />
        </MainContent>

        <Sidebar>
          {group.rules && (
            <SidebarCard>
              <SidebarTitle>Rules</SidebarTitle>
              <SidebarText style={{ whiteSpace: 'pre-wrap' }}>{group.rules}</SidebarText>
            </SidebarCard>
          )}
        </Sidebar>
      </ContentArea>

      {/* Group Chat Popup */}
      {showChatPopup && conversation && (
        <GroupChatPopup
          conversation={conversation}
          messages={messages}
          chatLoading={chatLoading}
          onClose={() => setShowChatPopup(false)}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onReactionToggle={handleReactionToggle}
          groupName={group.display_name}
          groupSlug={slug!}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 24px;
  display: flex;
  gap: 24px;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 18px;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.errorLight};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.error};
  margin: 24px;
`;

const Sidebar = styled.aside`
  width: 320px;
  flex-shrink: 0;

  @media (max-width: 968px) {
    width: 100%;
  }
`;

const SidebarCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const SidebarTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const SidebarText = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.text};
`;

const SidebarStat = styled.div`
  padding: 8px 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

export default GroupPage;
