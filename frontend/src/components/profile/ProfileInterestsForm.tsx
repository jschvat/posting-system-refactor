/**
 * Profile Interests Form Component
 * Handles user interests, skills, pets, and expertise
 */

import React from 'react';
import styled from 'styled-components';
import TagInput from '../TagInput';
import { HOBBIES, SKILLS, FAVORITE_PETS, EXPERTISE } from '../../constants/profile';

interface ProfileInterestsFormProps {
  formData: {
    hobbies: string[];
    skills: string[];
    favorite_pets: string[];
    expertise: string[];
  };
  onChange: (field: string, value: string[]) => void;
}

const ProfileInterestsForm: React.FC<ProfileInterestsFormProps> = ({ formData, onChange }) => {
  return (
    <Section>
      <SectionTitle>Interests & Skills</SectionTitle>

      <FormGroup>
        <Label>Hobbies</Label>
        <Description>Select your hobbies and interests</Description>
        <TagInput
          value={formData.hobbies}
          onChange={(hobbies) => onChange('hobbies', hobbies)}
          suggestions={HOBBIES}
          placeholder="Type to search hobbies..."
        />
      </FormGroup>

      <FormGroup>
        <Label>Skills</Label>
        <Description>Select your professional skills</Description>
        <TagInput
          value={formData.skills}
          onChange={(skills) => onChange('skills', skills)}
          suggestions={SKILLS}
          placeholder="Type to search skills..."
        />
      </FormGroup>

      <FormGroup>
        <Label>Favorite Pets</Label>
        <Description>What are your favorite types of pets?</Description>
        <TagInput
          value={formData.favorite_pets}
          onChange={(favorite_pets) => onChange('favorite_pets', favorite_pets)}
          suggestions={FAVORITE_PETS}
          placeholder="Type to search pets..."
        />
      </FormGroup>

      <FormGroup>
        <Label>Expertise</Label>
        <Description>Areas where you have deep knowledge or experience</Description>
        <TagInput
          value={formData.expertise}
          onChange={(expertise) => onChange('expertise', expertise)}
          suggestions={EXPERTISE}
          placeholder="Type to search expertise areas..."
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

export default ProfileInterestsForm;
