/**
 * Profile Social Links Form Component
 * Handles website, Twitter, LinkedIn, and GitHub profile links
 */

import React from 'react';
import styled from 'styled-components';

interface ProfileSocialLinksFormProps {
  formData: {
    website: string;
    twitter_handle: string;
    linkedin_url: string;
    github_username: string;
  };
  onChange: (field: string, value: string) => void;
}

const ProfileSocialLinksForm: React.FC<ProfileSocialLinksFormProps> = ({
  formData,
  onChange
}) => {
  return (
    <Section>
      <SectionTitle>Links</SectionTitle>

      <FormGroup>
        <Label>Website</Label>
        <Input
          type="url"
          placeholder="https://yourwebsite.com"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <Label>Twitter Handle</Label>
        <InputWithPrefix>
          <Prefix>@</Prefix>
          <InputNoPadding
            type="text"
            placeholder="username"
            value={formData.twitter_handle}
            onChange={(e) => onChange('twitter_handle', e.target.value)}
          />
        </InputWithPrefix>
      </FormGroup>

      <FormGroup>
        <Label>GitHub Username</Label>
        <InputWithPrefix>
          <Prefix>github.com/</Prefix>
          <InputNoPadding
            type="text"
            placeholder="username"
            value={formData.github_username}
            onChange={(e) => onChange('github_username', e.target.value)}
          />
        </InputWithPrefix>
      </FormGroup>

      <FormGroup>
        <Label>LinkedIn Profile</Label>
        <Input
          type="url"
          placeholder="https://linkedin.com/in/username"
          value={formData.linkedin_url}
          onChange={(e) => onChange('linkedin_url', e.target.value)}
        />
      </FormGroup>
    </Section>
  );
};

// Styled Components
const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
  margin: -${props => props.theme.spacing.xs} 0 ${props => props.theme.spacing.xs} 0;
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

const InputWithPrefix = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Prefix = styled.span`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1rem;
  border-right: 1px solid ${props => props.theme.colors.border};
`;

const InputNoPadding = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: none;
  font-size: 1rem;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

export default ProfileSocialLinksForm;
