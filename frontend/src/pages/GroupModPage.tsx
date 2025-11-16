import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import groupsApi from '../services/groupsApi';
import { Group } from '../types/group';
import {
  PendingMembersTab,
  PendingPostsTab,
  PostsTab,
  MembersTab,
  ModeratorsTab,
  BannedMembersTab,
  ActivityLogTab,
  ErrorMessage
} from '../components/groups/moderation';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const RoleBadge = styled.span<{ $isAdmin: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$isAdmin ? '${props.theme.colors.error}' : '${props.theme.colors.success}'};
  color: ${props.theme.colors.white};
`;

const TabBar = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: none;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-weight: ${props => props.$active ? 600 : 400};
  font-size: 15px;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ContentArea = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 18px;
`;


type TabType = 'pending-members' | 'pending-posts' | 'posts' | 'members' | 'moderators' | 'banned' | 'activity';

// Main Component
const GroupModPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useAuth();
  const user = state.user;
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending-members');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadGroupAndCheckRole();
  }, [slug, user]);

  const loadGroupAndCheckRole = async () => {
    if (!slug || !user) return;

    try {
      setLoading(true);
      console.log('[GroupModPage] Loading group:', slug);
      const groupRes = await groupsApi.getGroup(slug);
      console.log('[GroupModPage] Group response:', groupRes);

      if (groupRes.success && groupRes.data) {
        const g = (groupRes.data as any).group || groupRes.data;
        setGroup(g);
        console.log('[GroupModPage] Group set:', g);

        // Check membership and role
        const membershipRes = await groupsApi.checkMembership(slug);
        console.log('[GroupModPage] Membership response:', membershipRes);

        if (membershipRes.success && membershipRes.data) {
          const { is_member, membership } = membershipRes.data;

          // Only admins and moderators can access this page
          if (is_member && membership && (membership.role === 'admin' || membership.role === 'moderator')) {
            setUserRole(membership.role);
            console.log('[GroupModPage] User role set:', membership.role);
          } else {
            console.log('[GroupModPage] Access denied - not admin/moderator');
            showError('You must be an admin or moderator to access this page');
            navigate(`/g/${slug}`);
            return;
          }
        } else {
          console.log('[GroupModPage] Membership check failed');
          showError('Failed to verify your permissions');
          navigate(`/g/${slug}`);
          return;
        }
      } else {
        console.log('[GroupModPage] Group response not successful');
      }
    } catch (err: any) {
      console.error('[GroupModPage] Error:', err);
      showError(getErrorMessage(err));
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Container><LoadingMessage>Loading moderation console...</LoadingMessage></Container>;
  }

  if (!group) {
    return <Container><ErrorMessage>Group not found</ErrorMessage></Container>;
  }

  if (!userRole) {
    return <Container><ErrorMessage>Checking permissions...</ErrorMessage></Container>;
  }

  return (
    <Container>
      <Header>
        <BackLink onClick={() => navigate(`/g/${slug}`)}>← Back to {group.display_name}</BackLink>
        <Title>Moderation Console</Title>
        <RoleBadge $isAdmin={userRole === 'admin'}>
          {userRole === 'admin' ? 'Admin' : 'Moderator'}
        </RoleBadge>
      </Header>

      <TabBar>
        <Tab
          $active={activeTab === 'pending-members'}
          onClick={() => setActiveTab('pending-members')}
        >
          Pending Members
        </Tab>
        <Tab
          $active={activeTab === 'pending-posts'}
          onClick={() => setActiveTab('pending-posts')}
        >
          Pending Posts
        </Tab>
        <Tab
          $active={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
        >
          All Posts
        </Tab>
        <Tab
          $active={activeTab === 'members'}
          onClick={() => setActiveTab('members')}
        >
          Members
        </Tab>
        {userRole === 'admin' && (
          <Tab
            $active={activeTab === 'moderators'}
            onClick={() => setActiveTab('moderators')}
          >
            Moderators
          </Tab>
        )}
        <Tab
          $active={activeTab === 'banned'}
          onClick={() => setActiveTab('banned')}
        >
          Banned
        </Tab>
        <Tab
          $active={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
        >
          Activity Log
        </Tab>
      </TabBar>

      <ContentArea>
        {activeTab === 'pending-members' && <PendingMembersTab slug={slug!} />}
        {activeTab === 'pending-posts' && <PendingPostsTab slug={slug!} />}
        {activeTab === 'posts' && <PostsTab slug={slug!} />}
        {activeTab === 'members' && <MembersTab slug={slug!} userRole={userRole} />}
        {activeTab === 'moderators' && userRole === 'admin' && <ModeratorsTab slug={slug!} />}
        {activeTab === 'banned' && <BannedMembersTab slug={slug!} />}
        {activeTab === 'activity' && <ActivityLogTab slug={slug!} />}
      </ContentArea>
    </Container>
  );
};

export default GroupModPage;
