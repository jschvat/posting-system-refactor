import React from 'react';
import styled from 'styled-components';

interface ModeratorPermissionsSectionProps {
  moderatorCanRemovePosts: boolean;
  onModeratorCanRemovePostsChange: (value: boolean) => void;
  moderatorCanRemoveComments: boolean;
  onModeratorCanRemoveCommentsChange: (value: boolean) => void;
  moderatorCanBanMembers: boolean;
  onModeratorCanBanMembersChange: (value: boolean) => void;
  moderatorCanApprovePosts: boolean;
  onModeratorCanApprovePostsChange: (value: boolean) => void;
  moderatorCanApproveMembers: boolean;
  onModeratorCanApproveMembersChange: (value: boolean) => void;
  moderatorCanPinPosts: boolean;
  onModeratorCanPinPostsChange: (value: boolean) => void;
  moderatorCanLockPosts: boolean;
  onModeratorCanLockPostsChange: (value: boolean) => void;
}

export const ModeratorPermissionsSection: React.FC<ModeratorPermissionsSectionProps> = ({
  moderatorCanRemovePosts,
  onModeratorCanRemovePostsChange,
  moderatorCanRemoveComments,
  onModeratorCanRemoveCommentsChange,
  moderatorCanBanMembers,
  onModeratorCanBanMembersChange,
  moderatorCanApprovePosts,
  onModeratorCanApprovePostsChange,
  moderatorCanApproveMembers,
  onModeratorCanApproveMembersChange,
  moderatorCanPinPosts,
  onModeratorCanPinPostsChange,
  moderatorCanLockPosts,
  onModeratorCanLockPostsChange,
}) => {
  return (
    <FormSection>
      <SectionTitle>Moderator Permissions</SectionTitle>
      <Help>Control what actions moderators can perform (admins can always perform all actions)</Help>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanRemovePosts}
            onChange={(e) => onModeratorCanRemovePostsChange(e.target.checked)}
          />
          <strong>Remove Posts</strong> - Allow moderators to remove posts with a reason
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanRemoveComments}
            onChange={(e) => onModeratorCanRemoveCommentsChange(e.target.checked)}
          />
          <strong>Remove Comments</strong> - Allow moderators to remove comments with a reason
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanBanMembers}
            onChange={(e) => onModeratorCanBanMembersChange(e.target.checked)}
          />
          <strong>Ban Members</strong> - Allow moderators to ban and unban members
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanApprovePosts}
            onChange={(e) => onModeratorCanApprovePostsChange(e.target.checked)}
          />
          <strong>Approve Posts</strong> - Allow moderators to approve pending posts
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanApproveMembers}
            onChange={(e) => onModeratorCanApproveMembersChange(e.target.checked)}
          />
          <strong>Approve Members</strong> - Allow moderators to approve membership requests
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanPinPosts}
            onChange={(e) => onModeratorCanPinPostsChange(e.target.checked)}
          />
          <strong>Pin Posts</strong> - Allow moderators to pin/unpin posts
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={moderatorCanLockPosts}
            onChange={(e) => onModeratorCanLockPostsChange(e.target.checked)}
          />
          <strong>Lock Posts</strong> - Allow moderators to lock/unlock posts (prevents comments)
        </CheckboxLabel>
      </FormGroup>
    </FormSection>
  );
};

// Styled Components
const FormSection = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Help = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 16px;
`;
