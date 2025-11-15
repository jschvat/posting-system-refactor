/**
 * PostCard Component - coordinating component for displaying individual posts in the feed
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import PostCardHeader from './post/PostCardHeader';
import PostCardMedia from './post/PostCardMedia';
import PostCardActions from './post/PostCardActions';
import PostCardComments from './post/PostCardComments';

const Card = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const PostContent = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PostText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ViewPostLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { state } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const handleToggleComments = useCallback(() => {
    setShowComments(!showComments);
  }, [showComments]);

  const handleReaction = useCallback((emojiName: string) => {
    // Callback wrapper - actual logic handled by PostCardActions
    // This is here for potential future coordination needs
  }, []);

  return (
    <Card>
      {/* Post Header */}
      <PostCardHeader post={post} />

      {/* Post Content */}
      <PostContent>
        <PostText>{post.content}</PostText>
        <ViewPostLink to={`/post/${post.id}`}>
          View full post and comments →
        </ViewPostLink>

        {/* Media Gallery */}
        <PostCardMedia media={post.media} postId={post.id} />
      </PostContent>

      {/* Post Actions */}
      <PostCardActions
        post={post}
        onReactionToggle={handleReaction}
        onToggleComments={handleToggleComments}
        showingComments={showComments}
        onUpdate={onUpdate}
      />

      {/* Comments Section */}
      <PostCardComments
        postId={post.id}
        isOpen={showComments}
        initialCommentCount={post.comment_count}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

// Memoize PostCard to prevent unnecessary re-renders when other posts update
export default React.memo(PostCard, (prevProps, nextProps) => {
  // Only re-render if the post ID or post data changes
  return prevProps.post.id === nextProps.post.id &&
    prevProps.post.updated_at === nextProps.post.updated_at &&
    prevProps.post.comment_count === nextProps.post.comment_count &&
    prevProps.post.share_count === nextProps.post.share_count;
});
