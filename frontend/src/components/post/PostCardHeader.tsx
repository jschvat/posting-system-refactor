/**
 * PostCardHeader Component - displays post author information and metadata
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Post } from '../../types';
import { getUserAvatarUrl } from '../../services/api';
import RatingBadge from '../RatingBadge';

// Utility function for formatting time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

const PostHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AuthorAvatar = styled.div<{ $hasImage?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => $hasImage ? 'transparent' : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: bold;
  font-size: 0.9rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  display: block;
  margin-bottom: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const PostMeta = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface PostCardHeaderProps {
  post: Post;
}

const PostCardHeader: React.FC<PostCardHeaderProps> = ({ post }) => {
  // Get author avatar - getUserAvatarUrl always returns a URL (real or fallback)
  const authorAvatarUrl = post.author ? getUserAvatarUrl(post.author) : '';

  return (
    <PostHeader>
      <AuthorAvatar $hasImage={Boolean(authorAvatarUrl)}>
        {authorAvatarUrl ? (
          <img src={authorAvatarUrl} alt={`${post.author?.first_name} ${post.author?.last_name}`} />
        ) : (
          post.author ? `${post.author.first_name[0]}${post.author.last_name[0]}` : 'U'
        )}
      </AuthorAvatar>

      <AuthorInfo>
        <AuthorName to={`/user/${post.author?.id || post.user_id}`}>
          {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Unknown User'}
        </AuthorName>
        <PostMeta>
          <span>@{post.author?.username || 'unknown'}</span>
          <span>•</span>
          <RatingBadge
            score={post.author?.reputation_score || 0}
            size="tiny"
            inline
            showScore={false}
          />
          <span>•</span>
          <span>{formatTimeAgo(post.created_at)}</span>
          {post.privacy_level !== 'public' && (
            <>
              <span>•</span>
              <span>{post.privacy_level}</span>
            </>
          )}
        </PostMeta>
      </AuthorInfo>
    </PostHeader>
  );
};

export default PostCardHeader;
