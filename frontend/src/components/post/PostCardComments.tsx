/**
 * PostCardComments Component - displays comments section for PostCard
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { Comment } from '../../types';
import { commentsApi, getUserAvatarUrl } from '../../services/api';
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

// Styled Components
const CommentsSection = styled.div<{ $isOpen: boolean; $isLoading?: boolean }>`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  max-height: 300px;
  overflow-y: auto;
  position: relative;

  ${({ $isLoading }) => $isLoading && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 1;
      pointer-events: none;
    }
  `}
`;

const CommentsList = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const CommentItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentAvatar = styled.div<{ $hasImage?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => $hasImage ? 'transparent' : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: bold;
  font-size: 0.7rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
`;

const CommentText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
  margin: 2px 0;
  line-height: 1.4;
`;

const CommentTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ReplyItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.lg};
  padding-left: ${({ theme }) => theme.spacing.md};
  border-left: 2px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReplyAvatar = styled.div<{ $hasImage?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => $hasImage ? 'transparent' : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: bold;
  font-size: 0.6rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  flex-shrink: 0;
`;

const ReplyContent = styled.div`
  flex: 1;
`;

const ReplyAuthor = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.8rem;
`;

const ReplyText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.8rem;
  margin: 2px 0;
  line-height: 1.4;
`;

const ReplyTime = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LoadMoreComments = styled.button<{ disabled?: boolean }>`
  color: ${({ theme, disabled }) => disabled ? theme.colors.text.muted : theme.colors.primary};
  background: none;
  border: none;
  font-size: 0.85rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
  }
`;

// Component Interfaces
interface PostCardCommentsProps {
  postId: number;
  isOpen: boolean;
  initialCommentCount: number;
}

// Recursive comment rendering component
const CommentRenderer: React.FC<{ comment: Comment; depth?: number }> = ({ comment, depth = 0 }) => {
  const commentAvatarUrl = comment.author ? getUserAvatarUrl(comment.author) : '';
  const isReply = depth > 0;
  const maxDepth = 5; // Maximum nesting depth for visual indentation

  const Avatar = isReply ? ReplyAvatar : CommentAvatar;
  const Content = isReply ? ReplyContent : CommentContent;
  const Author = isReply ? ReplyAuthor : CommentAuthor;
  const Text = isReply ? ReplyText : CommentText;
  const Time = isReply ? ReplyTime : CommentTime;
  const Item = isReply ? ReplyItem : CommentItem;

  const indentLevel = Math.min(depth, maxDepth);
  const marginLeft = indentLevel * 20; // 20px per level of nesting

  return (
    <div style={{ marginLeft: `${marginLeft}px` }}>
      <Item>
        <Avatar $hasImage={Boolean(commentAvatarUrl)}>
          {commentAvatarUrl ? (
            <img src={commentAvatarUrl} alt={`${comment.author?.first_name} ${comment.author?.last_name}`} />
          ) : (
            comment.author ? `${comment.author.first_name[0]}${comment.author.last_name[0]}` : 'U'
          )}
        </Avatar>
        <Content>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Author>
              {comment.author ? `${comment.author.first_name} ${comment.author.last_name}` : 'Unknown User'}
            </Author>
            <RatingBadge
              score={comment.author?.reputation_score || 0}
              size="tiny"
              inline
              showScore={false}
            />
          </div>
          <Text>{comment.content}</Text>
          <Time>{formatTimeAgo(comment.created_at)}</Time>
        </Content>
      </Item>

      {/* Recursively render all nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentRenderer key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const PostCardComments: React.FC<PostCardCommentsProps> = ({ postId, isOpen, initialCommentCount }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll position tracking
  const commentsListRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef<{
    isLocked: boolean;
    savedScrollTop: number;
    savedScrollHeight: number;
  }>({ isLocked: false, savedScrollTop: 0, savedScrollHeight: 0 });

  // Fetch initial comments when shown
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', 'post', postId, 'page', currentPage],
    queryFn: () => commentsApi.getPostComments(postId, { limit: 5, page: currentPage }),
    enabled: isOpen,
  });

  // Update comments when data changes
  React.useEffect(() => {
    if (commentsData?.data) {
      if (currentPage === 1) {
        setAllComments(commentsData.data.comments);
      } else {
        setAllComments(prev => [...prev, ...commentsData.data.comments]);
      }
      setHasMoreComments(commentsData.data.pagination.has_next_page);
      setIsLoadingMore(false);
    }
  }, [commentsData, currentPage]);

  // Reset when opening/closing
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setAllComments([]);
      setHasMoreComments(false);
    } else {
      setAllComments([]);
    }
  }, [isOpen]);

  // Synchronous scroll position restoration (runs before browser paint)
  useLayoutEffect(() => {
    if (scrollLockRef.current.isLocked && commentsListRef.current && !isLoadingMore) {
      const container = commentsListRef.current;
      const currentScrollHeight = container.scrollHeight;
      const heightDifference = currentScrollHeight - scrollLockRef.current.savedScrollHeight;

      // Immediately adjust scroll position before browser can paint
      container.scrollTop = scrollLockRef.current.savedScrollTop + heightDifference;

      // Clean up aggressive locks and restore interaction
      if ((container as any)._scrollCleanup) {
        (container as any)._scrollCleanup();
        delete (container as any)._scrollCleanup;
      }

      // Reset lock state
      scrollLockRef.current.isLocked = false;
    }
  });

  // Fallback: Handle any scroll events during loading to maintain position
  useEffect(() => {
    const container = commentsListRef.current;
    if (!container || !scrollLockRef.current.isLocked) return;

    const handleScroll = (e: Event) => {
      // Prevent scroll events during loading to eliminate jumps
      e.preventDefault();
      container.scrollTop = scrollLockRef.current.savedScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: false });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore]);

  // Load more comments function
  const loadMoreComments = () => {
    if (!hasMoreComments || isLoadingMore) return;

    const container = commentsListRef.current;
    if (!container) return;

    // Immediately lock all interaction to prevent any movement
    container.style.overflow = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.scrollBehavior = 'auto';

    // Capture exact scroll state
    scrollLockRef.current = {
      isLocked: true,
      savedScrollTop: container.scrollTop,
      savedScrollHeight: container.scrollHeight
    };

    // Create aggressive scroll lock handler
    const aggressiveLock = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (container && scrollLockRef.current.isLocked) {
        container.scrollTop = scrollLockRef.current.savedScrollTop;
      }
    };

    // Block all possible scroll events
    const events = ['scroll', 'wheel', 'touchmove', 'DOMMouseScroll', 'mousewheel'];
    events.forEach(event => {
      container.addEventListener(event, aggressiveLock, { passive: false, capture: true });
    });

    // Store cleanup function
    const cleanup = () => {
      events.forEach(event => {
        container.removeEventListener(event, aggressiveLock, { capture: true });
      });
      container.style.overflow = 'auto';
      container.style.pointerEvents = '';
    };

    // Store cleanup for later use
    (container as any)._scrollCleanup = cleanup;

    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  };

  return (
    <CommentsSection $isOpen={isOpen} $isLoading={isLoadingMore} ref={commentsListRef}>
      {commentsLoading ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#65676b' }}>
          Loading comments...
        </div>
      ) : (
        <>
          <CommentsList>
            {allComments.map((comment) => (
              <CommentRenderer key={comment.id} comment={comment} depth={0} />
            ))}

            {allComments.length === 0 && !commentsLoading && (
              <div style={{ textAlign: 'center', color: '#65676b', padding: '16px' }}>
                No comments yet. Be the first to comment!
              </div>
            )}

            {hasMoreComments && (
              <LoadMoreComments
                onClick={loadMoreComments}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load more comments'}
              </LoadMoreComments>
            )}
          </CommentsList>
        </>
      )}
    </CommentsSection>
  );
};

export default PostCardComments;
