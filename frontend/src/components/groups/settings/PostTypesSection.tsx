import React from 'react';
import styled from 'styled-components';

interface PostTypesSectionProps {
  allowTextPosts: boolean;
  onAllowTextPostsChange: (checked: boolean) => void;
  allowLinkPosts: boolean;
  onAllowLinkPostsChange: (checked: boolean) => void;
  allowImagePosts: boolean;
  onAllowImagePostsChange: (checked: boolean) => void;
  allowVideoPosts: boolean;
  onAllowVideoPostsChange: (checked: boolean) => void;
  allowPollPosts: boolean;
  onAllowPollPostsChange: (checked: boolean) => void;
}

export const PostTypesSection: React.FC<PostTypesSectionProps> = ({
  allowTextPosts,
  onAllowTextPostsChange,
  allowLinkPosts,
  onAllowLinkPostsChange,
  allowImagePosts,
  onAllowImagePostsChange,
  allowVideoPosts,
  onAllowVideoPostsChange,
  allowPollPosts,
  onAllowPollPostsChange
}) => {
  return (
    <FormSection>
      <SectionTitle>Allowed Post Types</SectionTitle>
      <Help>Control what types of content members can post in your group</Help>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={allowTextPosts}
            onChange={(e) => onAllowTextPostsChange(e.target.checked)}
          />
          <strong>Text Posts</strong> - Allow members to post text-only content
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={allowLinkPosts}
            onChange={(e) => onAllowLinkPostsChange(e.target.checked)}
          />
          <strong>Link Posts</strong> - Allow members to share URLs and links
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={allowImagePosts}
            onChange={(e) => onAllowImagePostsChange(e.target.checked)}
          />
          <strong>Image Posts</strong> - Allow members to upload images (JPG, PNG, GIF, WebP)
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={allowVideoPosts}
            onChange={(e) => onAllowVideoPostsChange(e.target.checked)}
          />
          <strong>Video Posts</strong> - Allow members to upload videos (MP4, WebM, OGG)
        </CheckboxLabel>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={allowPollPosts}
            onChange={(e) => onAllowPollPostsChange(e.target.checked)}
          />
          <strong>Poll Posts</strong> - Allow members to create polls (coming soon)
        </CheckboxLabel>
      </FormGroup>
    </FormSection>
  );
};

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
