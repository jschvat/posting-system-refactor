/**
 * PostCardActions Component - displays action buttons for posts (reactions, comments, share)
 */

import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Post } from '../../types';
import { reactionsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ReactionPicker from '../ReactionPicker';
import ReactionsPopup from '../ReactionsPopup';
import ShareButton from '../ShareButton';
import CommentForm from '../CommentForm';

const PostActions = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.text.secondary};
  font-size: 0.9rem;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
  }

  .emoji {
    font-size: 1.1em;
  }
`;

interface PostCardActionsProps {
  post: Post;
  onReactionToggle: (emoji: string) => void;
  onToggleComments: () => void;
  showingComments: boolean;
  onUpdate?: () => void;
}

const PostCardActions: React.FC<PostCardActionsProps> = ({
  post,
  onReactionToggle,
  onToggleComments,
  showingComments,
  onUpdate
}) => {
  const { state } = useAuth();
  const queryClient = useQueryClient();

  // Fetch post reactions with user details
  const { data: reactionsData } = useQuery({
    queryKey: ['reactions', 'post', post.id],
    queryFn: () => reactionsApi.getPostReactions(post.id, { include_users: true }),
  });

  // React to post mutation - optimized with optimistic updates
  const reactMutation = useMutation({
    mutationFn: (emojiName: string) => {
      return reactionsApi.togglePostReaction(post.id, { emoji_name: emojiName });
    },
    onMutate: async (emojiName: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reactions', 'post', post.id] });

      // Snapshot previous value
      const previousReactions = queryClient.getQueryData(['reactions', 'post', post.id]);

      // Optimistically update to new value
      queryClient.setQueryData(['reactions', 'post', post.id], (old: any) => {
        if (!old) return old;

        const userId = state.user?.id;
        if (!userId) return old;

        const detailedReactions = old.data?.detailed_reactions || [];
        const existingReaction = detailedReactions.find((r: any) => r.user_id === userId);

        // Clone the data
        const newData = { ...old };
        const newDetailedReactions = [...detailedReactions];
        const reactionCounts = [...(old.data?.reaction_counts || [])];

        if (existingReaction) {
          // Remove existing reaction
          const index = newDetailedReactions.findIndex((r: any) => r.user_id === userId);
          if (index > -1) newDetailedReactions.splice(index, 1);

          // Update count
          const countIndex = reactionCounts.findIndex((r: any) => r.emoji_name === existingReaction.emoji_name);
          if (countIndex > -1) {
            reactionCounts[countIndex] = {
              ...reactionCounts[countIndex],
              count: Math.max(0, reactionCounts[countIndex].count - 1)
            };
            // Remove if count is 0
            if (reactionCounts[countIndex].count === 0) {
              reactionCounts.splice(countIndex, 1);
            }
          }

          // If clicking same emoji, just remove it
          if (existingReaction.emoji_name === emojiName) {
            newData.data = {
              ...newData.data,
              detailed_reactions: newDetailedReactions,
              reaction_counts: reactionCounts
            };
            return newData;
          }
        }

        // Add new reaction
        newDetailedReactions.push({
          user_id: userId,
          emoji_name: emojiName,
          created_at: new Date().toISOString()
        });

        // Update count for new reaction
        const countIndex = reactionCounts.findIndex((r: any) => r.emoji_name === emojiName);
        if (countIndex > -1) {
          reactionCounts[countIndex] = {
            ...reactionCounts[countIndex],
            count: reactionCounts[countIndex].count + 1
          };
        } else {
          reactionCounts.push({ emoji_name: emojiName, count: 1 });
        }

        newData.data = {
          ...newData.data,
          detailed_reactions: newDetailedReactions,
          reaction_counts: reactionCounts
        };

        return newData;
      });

      return { previousReactions };
    },
    onError: (err, emojiName, context: any) => {
      // Revert on error
      if (context?.previousReactions) {
        queryClient.setQueryData(['reactions', 'post', post.id], context.previousReactions);
      }
    },
    onSettled: () => {
      // Refetch in background to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['reactions', 'post', post.id] });
    },
  });

  const reactions = reactionsData?.data?.reaction_counts || [];
  const detailedReactions = reactionsData?.data?.detailed_reactions || [];

  // Memoize expensive computations
  const totalReactions = useMemo(() =>
    reactions.reduce((sum, r) => sum + r.count, 0),
    [reactions]
  );

  // Find current user's reaction
  const currentUserReaction = useMemo(() =>
    state.user ? detailedReactions.find(reaction => reaction.user_id === state.user?.id) : null,
    [state.user, detailedReactions]
  );

  const handleReaction = useCallback((emojiName: string) => {
    if (state.isAuthenticated) {
      reactMutation.mutate(emojiName);
      onReactionToggle(emojiName);
    }
  }, [state.isAuthenticated, reactMutation, onReactionToggle]);

  const handleRemoveReaction = useCallback(() => {
    if (state.isAuthenticated && currentUserReaction) {
      reactMutation.mutate(currentUserReaction.emoji_name);
      onReactionToggle(currentUserReaction.emoji_name);
    }
  }, [state.isAuthenticated, currentUserReaction, reactMutation, onReactionToggle]);

  return (
    <>
      {/* Post Actions */}
      <PostActions>
        <ReactionPicker
          currentReaction={currentUserReaction?.emoji_name || null}
          totalReactions={totalReactions}
          reactionCounts={reactions}
          onReactionSelect={handleReaction}
          onReactionRemove={handleRemoveReaction}
        />

        <ActionButton onClick={onToggleComments}>
          <span>💬</span>
          <span>{post.comment_count || 0} Comment{(post.comment_count || 0) === 1 ? '' : 's'}</span>
        </ActionButton>

        <ShareButton postId={post.id} postAuthorId={post.user_id} initialShareCount={post.share_count || 0} />

        {totalReactions > 0 && (
          <ReactionsPopup
            reactionCounts={reactions}
            totalReactions={totalReactions}
          >
            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '${props.theme.colors.text.secondary}' }}>
              {totalReactions} reaction{totalReactions === 1 ? '' : 's'}
            </div>
          </ReactionsPopup>
        )}
      </PostActions>

      {/* Comment Form - shown when comments section is open */}
      {showingComments && (
        <CommentForm
          postId={post.id}
          onSuccess={() => {
            // Refresh comments after successful creation
            queryClient.invalidateQueries({ queryKey: ['comments', 'post', post.id] });
            // Also invalidate posts cache to update comment counts in feed
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            // Call the parent onUpdate callback if provided
            onUpdate?.();
          }}
        />
      )}
    </>
  );
};

export default PostCardActions;
