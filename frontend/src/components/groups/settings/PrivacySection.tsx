import React from 'react';
import styled from 'styled-components';

interface PrivacySectionProps {
  visibility: 'public' | 'private' | 'invite_only';
  postApprovalRequired: boolean;
  onVisibilityChange: (visibility: 'public' | 'private' | 'invite_only') => void;
  onPostApprovalRequiredChange: (required: boolean) => void;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  visibility,
  postApprovalRequired,
  onVisibilityChange,
  onPostApprovalRequiredChange,
}) => {
  return (
    <FormSection>
      <SectionTitle>Privacy & Permissions</SectionTitle>

      <FormGroup>
        <Label htmlFor="visibility">Visibility *</Label>
        <Select
          id="visibility"
          value={visibility}
          onChange={(e) => onVisibilityChange(e.target.value as any)}
        >
          <option value="public">Public - Anyone can see and join</option>
          <option value="private">Private - Only members can see content</option>
          <option value="invite_only">Invite Only - Requires invitation to join</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={postApprovalRequired}
            onChange={(e) => onPostApprovalRequiredChange(e.target.checked)}
          />
          Require post approval before publishing
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

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
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
