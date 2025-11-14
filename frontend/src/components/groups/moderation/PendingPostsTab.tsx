import React, { useState, useEffect } from 'react';
import { useToast } from '../../Toast';
import groupPostsApi from '../../../services/groupPostsApi';
import { GroupPost } from '../../../types/group';
import { getErrorMessage } from './moderationUtils';
import {
  LoadingMessage,
  EmptyState,
  SectionTitle,
  PostCard,
  PostHeader,
  PostAuthor,
  PostDate,
  PostTitle,
  PostContent,
  PostUrl,
  PostActions,
  ApproveButton,
  RejectButton
} from './ModerationStyles';

interface PendingPostsTabProps {
  slug: string;
}

export const PendingPostsTab: React.FC<PendingPostsTabProps> = ({ slug }) => {
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPendingPosts();
  }, [slug]);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      const res = await groupPostsApi.getPendingPosts(slug);
      if (res.success && res.data) {
        const data = res.data as any;
        setPosts(data.posts || data.items || []);
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: number) => {
    if (!window.confirm('Approve this post?')) return;

    try {
      setActionLoading(postId);
      const res = await groupPostsApi.approvePost(slug, postId);
      if (res.success) {
        showSuccess('Post approved successfully');
        loadPendingPosts();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: number) => {
    const reason = prompt('Reject this post? Enter reason:');
    if (!reason) return;

    try {
      setActionLoading(postId);
      const res = await groupPostsApi.removePost(slug, postId, { removal_reason: reason });
      if (res.success) {
        showSuccess('Post rejected');
        loadPendingPosts();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading pending posts...</LoadingMessage>;
  }

  if (posts.length === 0) {
    return <EmptyState>No pending posts</EmptyState>;
  }

  return (
    <div>
      <SectionTitle>Pending Posts ({posts.length})</SectionTitle>
      {posts.map(post => (
        <PostCard key={post.id}>
          <PostHeader>
            <PostAuthor>
              {post.username && `@${post.username}`}
              {!post.username && 'Unknown User'}
            </PostAuthor>
            <PostDate>{new Date(post.created_at).toLocaleString()}</PostDate>
          </PostHeader>
          <PostTitle>{post.title}</PostTitle>
          {post.content && <PostContent>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</PostContent>}
          {post.link_url && <PostUrl href={post.link_url} target="_blank" rel="noopener noreferrer">{post.link_url}</PostUrl>}
          <PostActions>
            <ApproveButton
              onClick={() => handleApprove(post.id)}
              disabled={actionLoading === post.id}
            >
              {actionLoading === post.id ? 'Processing...' : 'Approve'}
            </ApproveButton>
            <RejectButton
              onClick={() => handleReject(post.id)}
              disabled={actionLoading === post.id}
            >
              Reject
            </RejectButton>
          </PostActions>
        </PostCard>
      ))}
    </div>
  );
};
