import React, { useState, useEffect } from 'react';
import { useToast } from '../../Toast';
import groupPostsApi from '../../../services/groupPostsApi';
import { getErrorMessage } from './moderationUtils';
import {
  LoadingMessage,
  EmptyState,
  SearchHeader,
  SectionTitle,
  SearchInput,
  PostCard,
  PostHeader,
  PostAuthor,
  PostDate,
  PostTitle,
  PostContent,
  PostUrl,
  PostStatus,
  RemovalReason,
  PostActions,
  ApproveButton,
  RejectButton
} from './ModerationStyles';

interface PostsTabProps {
  slug: string;
}

export const PostsTab: React.FC<PostsTabProps> = ({ slug }) => {
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, [slug]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPosts((posts || []).filter(post =>
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.username?.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, posts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await groupPostsApi.getAllPostsForModeration(slug, { limit: 50 });
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
        setFilteredPosts(res.data.posts || []);
      } else {
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      showError(getErrorMessage(err));
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    const reason = prompt('Enter reason for removing this post (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(postId);
      const res = await groupPostsApi.moderateDeletePost(slug, postId, reason);
      if (res.success) {
        showSuccess('Post has been removed');
        loadPosts();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (postId: number) => {
    if (!window.confirm('Restore this post?')) return;

    try {
      setActionLoading(postId);
      const res = await groupPostsApi.restorePost(slug, postId);
      if (res.success) {
        showSuccess('Post has been restored');
        loadPosts();
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading posts...</LoadingMessage>;
  }

  if (posts.length === 0) {
    return <EmptyState>No posts found</EmptyState>;
  }

  return (
    <div>
      <SearchHeader>
        <SectionTitle>All Posts ({filteredPosts.length} / {posts.length})</SectionTitle>
        <SearchInput
          type="text"
          placeholder="Search by title, content, or author..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </SearchHeader>
      {filteredPosts.length === 0 && searchQuery && (
        <EmptyState>No posts found matching "{searchQuery}"</EmptyState>
      )}
      {filteredPosts.map(post => (
        <PostCard key={post.id}>
          <PostHeader>
            <PostAuthor>
              {post.username && `@${post.username}`}
              {!post.username && 'Unknown User'}
            </PostAuthor>
            <PostDate>{new Date(post.created_at).toLocaleString()}</PostDate>
            {post.status === 'removed' && (
              <PostStatus $status="removed">REMOVED</PostStatus>
            )}
            {post.status === 'pending' && (
              <PostStatus $status="pending">PENDING</PostStatus>
            )}
          </PostHeader>
          {post.title && <PostTitle>{post.title}</PostTitle>}
          {post.content && <PostContent>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</PostContent>}
          {post.link_url && <PostUrl href={post.link_url} target="_blank" rel="noopener noreferrer">{post.link_url}</PostUrl>}
          {post.removal_reason && (
            <RemovalReason>Removal Reason: {post.removal_reason}</RemovalReason>
          )}
          <PostActions>
            {post.status !== 'removed' && (
              <RejectButton
                onClick={() => handleDelete(post.id)}
                disabled={actionLoading === post.id}
              >
                {actionLoading === post.id ? 'Processing...' : 'Remove'}
              </RejectButton>
            )}
            {post.status === 'removed' && (
              <ApproveButton
                onClick={() => handleRestore(post.id)}
                disabled={actionLoading === post.id}
              >
                {actionLoading === post.id ? 'Processing...' : 'Restore'}
              </ApproveButton>
            )}
          </PostActions>
        </PostCard>
      ))}
    </div>
  );
};
