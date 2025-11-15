/**
 * Profile Basic Info Form Component
 * Reusable form for editing basic profile information
 */

import React from 'react';
import styled from 'styled-components';

interface ProfileBasicInfoFormProps {
  formData: {
    first_name: string;
    last_name: string;
    tagline: string;
    bio: string;
    job_title: string;
    company: string;
    location_city: string;
    location_state: string;
    location_country: string;
  };
  onChange: (field: string, value: string) => void;
}

const ProfileBasicInfoForm: React.FC<ProfileBasicInfoFormProps> = ({
  formData,
  onChange
}) => {
  return (
    <>
      {/* Basic Info */}
      <Section>
        <SectionTitle>Basic Information</SectionTitle>
        <Row>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => onChange('first_name', e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => onChange('last_name', e.target.value)}
              required
            />
          </FormGroup>
        </Row>

        <FormGroup>
          <Label>Tagline</Label>
          <Input
            type="text"
            placeholder="A short headline about you..."
            value={formData.tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
            maxLength={200}
          />
        </FormGroup>

        <FormGroup>
          <Label>Bio</Label>
          <TextArea
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            rows={4}
          />
        </FormGroup>
      </Section>

      {/* Work Info */}
      <Section>
        <SectionTitle>Work</SectionTitle>
        <Row>
          <FormGroup>
            <Label>Job Title</Label>
            <Input
              type="text"
              placeholder="e.g. Software Engineer"
              value={formData.job_title}
              onChange={(e) => onChange('job_title', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Company</Label>
            <Input
              type="text"
              placeholder="e.g. Acme Corp"
              value={formData.company}
              onChange={(e) => onChange('company', e.target.value)}
            />
          </FormGroup>
        </Row>
      </Section>

      {/* Location */}
      <Section>
        <SectionTitle>Location</SectionTitle>
        <Row>
          <FormGroup>
            <Label>City</Label>
            <Input
              type="text"
              value={formData.location_city}
              onChange={(e) => onChange('location_city', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>State/Province</Label>
            <Input
              type="text"
              value={formData.location_state}
              onChange={(e) => onChange('location_state', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Country</Label>
            <Input
              type="text"
              value={formData.location_country}
              onChange={(e) => onChange('location_country', e.target.value)}
            />
          </FormGroup>
        </Row>
      </Section>
    </>
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

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
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

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-family: inherit;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background};
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

export default ProfileBasicInfoForm;
