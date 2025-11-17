/**
 * User profile page component - displays user information and posts
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { usersApi, getUserAvatarUrl, followsApi } from '../services/api';
import reputationApi from '../services/api/reputationApi';
import ratingsApi from '../services/api/ratingsApi';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChatPopup } from '../components/messaging/ChatPopup';
import ProfileHeader from '../components/profile/ProfileHeader';
import FollowersModal from '../components/profile/FollowersModal';

const Container = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const PostsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 1.5rem;
`;

const SectionSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ErrorState = styled.div`
  background: ${({ theme }) => theme.colors.error20};
  border: 1px solid ${({ theme }) => theme.colors.error}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  color: ${({ theme }) => theme.colors.error};

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const RetryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primarydd};
  }
`;

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useAuth();
  const navigate = useNavigate();
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

  const currentUser = state.user;
  const isOwnProfile = currentUser && userId && parseInt(userId) === currentUser.id;

  // Fetch user data
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUser(parseInt(userId!)),
    enabled: !!userId,
  });

  // Fetch user posts
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => usersApi.getUserPosts(parseInt(userId!), { page: 1, limit: 20 }),
    enabled: !!userId,
  });

  // Fetch follow stats
  const {
    data: followStatsData,
    refetch: refetchFollowStats
  } = useQuery({
    queryKey: ['followStats', userId],
    queryFn: () => followsApi.getFollowStats(parseInt(userId!)),
    enabled: !!userId,
  });

  // Fetch reputation data
  const { data: reputationData, refetch: refetchReputation } = useQuery({
    queryKey: ['reputation', userId],
    queryFn: () => reputationApi.getUserReputation(parseInt(userId!)),
    enabled: !!userId,
  });

  // Fetch ratings data
  const { data: ratingsData, refetch: refetchRatings } = useQuery({
    queryKey: ['ratings', userId],
    queryFn: () => ratingsApi.getUserRatings(parseInt(userId!)),
    enabled: !!userId,
  });

  // Note: Location data is now included in the user object from the users API
  // No need for a separate location API call

  // Fetch following list (only when modal is open)
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => followsApi.getFollowing(parseInt(userId!)),
    enabled: !!userId && modalType === 'following',
  });

  // Fetch followers list (only when modal is open)
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => followsApi.getFollowers(parseInt(userId!)),
    enabled: !!userId && modalType === 'followers',
  });

  if (!userId) {
    return (
      <Container>
        <ErrorState>
          <h3>Invalid User</h3>
          <p>No user ID provided.</p>
        </ErrorState>
      </Container>
    );
  }

  if (userLoading) {
    return (
      <Container>
        <LoadingSpinner size="large" text="Loading profile..." />
      </Container>
    );
  }

  if (userError || !userData) {
    return (
      <Container>
        <ErrorState>
          <h3>User Not Found</h3>
          <p>The user you're looking for doesn't exist or has been removed.</p>
          <RetryButton onClick={() => refetchUser()}>
            Try Again
          </RetryButton>
        </ErrorState>
      </Container>
    );
  }

  const user = userData.data;
  const posts = Array.isArray(postsData?.data?.posts) ? postsData!.data.posts : [];
  const avatarUrl = getUserAvatarUrl(user);
  const hasAvatar = Boolean(user.avatar_url) && user.avatar_url !== avatarUrl;

  // Extract reputation and ratings data
  const reputation = reputationData?.data?.reputation;
  const ratingStats = ratingsData?.data?.stats;
  const averageRating = ratingStats ? parseFloat(ratingStats.average_rating) : 0;
  const totalRatings = ratingStats ? parseInt(ratingStats.total_ratings) : 0;

  // Handle stat clicks to open modals
  const handleStatClick = (type: 'followers' | 'following') => {
    setModalType(type);
  };

  // Handle sending a message - open chat popup
  const handleSendMessage = () => {
    setShowChatPopup(true);
  };

  return (
    <Container>
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        avatarUrl={avatarUrl}
        isOwnProfile={isOwnProfile}
        reputation={reputation}
        averageRating={averageRating}
        totalRatings={totalRatings}
        postsCount={posts.length}
        followingCount={followStatsData?.data?.counts?.following_count || 0}
        followersCount={followStatsData?.data?.counts?.follower_count || 0}
        onEditProfile={() => navigate('/settings')}
        onMessage={handleSendMessage}
        onRatingSubmitted={() => {
          refetchReputation();
          refetchRatings();
        }}
        onFollowingClick={() => handleStatClick('following')}
        onFollowersClick={() => handleStatClick('followers')}
      />

      {/* Posts Section */}
      <PostsSection>
        <SectionHeader>
          <SectionTitle>Posts</SectionTitle>
          <SectionSubtitle>
            {isOwnProfile ? 'Your recent posts' : `${user.first_name}'s recent posts`}
          </SectionSubtitle>
        </SectionHeader>

        {/* Posts Content */}
        {postsLoading ? (
          <LoadingSpinner size="medium" text="Loading posts..." />
        ) : postsError ? (
          <ErrorState>
            <h3>Failed to load posts</h3>
            <p>Something went wrong while loading the posts.</p>
            <RetryButton onClick={() => refetchPosts()}>
              Try Again
            </RetryButton>
          </ErrorState>
        ) : posts.length > 0 ? (
          <PostsContainer>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={() => {
                  refetchPosts();
                }}
              />
            ))}
          </PostsContainer>
        ) : (
          <EmptyState>
            <h3>No posts yet</h3>
            <p>
              {isOwnProfile
                ? "You haven't shared anything yet. Create your first post to get started!"
                : `${user.first_name} hasn't shared anything yet.`
              }
            </p>
          </EmptyState>
        )}

      </PostsSection>

      {/* Followers/Following Modal */}
      {modalType && (
        <FollowersModal
          type={modalType}
          users={modalType === 'followers' ? followersData?.data?.followers : followingData?.data?.following}
          isLoading={modalType === 'followers' ? followersLoading : followingLoading}
          isOwnProfile={isOwnProfile}
          firstName={user.first_name}
          onClose={() => setModalType(null)}
        />
      )}

      {showChatPopup && user && (
        <ChatPopup
          userId={user.id}
          username={user.username}
          avatarUrl={avatarUrl}
          onClose={() => setShowChatPopup(false)}
        />
      )}
    </Container>
  );
};

export default UserProfilePage;