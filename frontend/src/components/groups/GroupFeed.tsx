import React from 'react';
import styled from 'styled-components';
import GroupPostCard from './GroupPostCard';
import GroupPostComposer from './GroupPostComposer';
import { Group, GroupPost, PostSortType, VoteType, CreatePostData } from '../../types/group';

interface GroupFeedProps {
  posts: GroupPost[];
  sortBy: PostSortType;
  onSortChange: (sort: PostSortType) => void;
  showComposer: boolean;
  onToggleComposer: () => void;
  isMember: boolean;
  group: Group;
  userRole: string | null;
  onCreatePost: (data: CreatePostData) => Promise<void>;
  onVote: (postId: number, voteType: VoteType) => void;
  canModerate: boolean;
  onPin: (postId: number) => void;
  onLock: (postId: number) => void;
  onRemove: (postId: number) => void;
  groupSlug: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  user: any;
}

const GroupFeed: React.FC<GroupFeedProps> = ({
  posts,
  sortBy,
  onSortChange,
  showComposer,
  onToggleComposer,
  isMember,
  group,
  userRole,
  onCreatePost,
  onVote,
  canModerate,
  onPin,
  onLock,
  onRemove,
  groupSlug,
  page,
  totalPages,
  onPageChange,
  user
}) => {
  return (
    <>
      <FeedHeader>
        <SortButtons>
          <SortButton
            $active={sortBy === 'hot'}
            onClick={() => onSortChange('hot')}
          >
            Hot
          </SortButton>
          <SortButton
            $active={sortBy === 'new'}
            onClick={() => onSortChange('new')}
          >
            New
          </SortButton>
          <SortButton
            $active={sortBy === 'top'}
            onClick={() => onSortChange('top')}
          >
            Top
          </SortButton>
        </SortButtons>
        {isMember && (
          <CreatePostButton onClick={onToggleComposer}>
            {showComposer ? 'Cancel' : 'Create Post'}
          </CreatePostButton>
        )}
      </FeedHeader>

      {showComposer && (
        <GroupPostComposer
          onSubmit={onCreatePost}
          allowedTypes={{
            text: group.allow_text_posts,
            link: group.allow_link_posts,
            image: group.allow_image_posts,
            video: group.allow_video_posts,
            poll: group.allow_poll_posts
          }}
          requiresApproval={group.post_approval_required && userRole === 'member'}
        />
      )}

      {posts.length === 0 ? (
        <EmptyMessage>
          No posts yet. {isMember ? 'Be the first to post!' : 'Join to start posting!'}
        </EmptyMessage>
      ) : (
        <>
          <PostList>
            {posts.map(post => (
              <GroupPostCard
                key={post.id}
                post={post}
                groupSlug={groupSlug}
                onVote={user ? onVote : undefined}
                canModerate={canModerate}
                onPin={canModerate ? onPin : undefined}
                onLock={canModerate ? onLock : undefined}
                onRemove={canModerate ? onRemove : undefined}
              />
            ))}
          </PostList>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </PageButton>
              <PageInfo>Page {page} of {totalPages}</PageInfo>
              <PageButton
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </>
  );
};

// Styled Components
const FeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SortButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SortButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CreatePostButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
`;

const PageButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

export default GroupFeed;
