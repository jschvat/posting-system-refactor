/**
 * Edit Profile Page - Allow users to update their profile information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, mediaApi } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileImageUpload from '../components/profile/ProfileImageUpload';
import ProfileBasicInfoForm from '../components/profile/ProfileBasicInfoForm';
import ProfileSocialLinksForm from '../components/profile/ProfileSocialLinksForm';
import ProfileInterestsForm from '../components/profile/ProfileInterestsForm';

interface ProfileData {
  first_name: string;
  last_name: string;
  bio: string;
  website: string;
  twitter_handle: string;
  linkedin_url: string;
  github_username: string;
  job_title: string;
  company: string;
  tagline: string;
  location_city: string;
  location_state: string;
  location_country: string;
  hobbies: string[];
  skills: string[];
  favorite_pets: string[];
  expertise: string[];
}

const EditProfilePage: React.FC = () => {
  const { state, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');

  const [formData, setFormData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    bio: '',
    website: '',
    twitter_handle: '',
    linkedin_url: '',
    github_username: '',
    job_title: '',
    company: '',
    tagline: '',
    location_city: '',
    location_state: '',
    location_country: '',
    hobbies: [],
    skills: [],
    favorite_pets: [],
    expertise: []
  });

  useEffect(() => {
    if (!state.user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [state.user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUser(state.user!.id);
      if (response.success && response.data) {
        const user = response.data;
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          bio: user.bio || '',
          website: user.website || '',
          twitter_handle: user.twitter_handle || '',
          linkedin_url: user.linkedin_url || '',
          github_username: user.github_username || '',
          job_title: user.job_title || '',
          company: user.company || '',
          tagline: user.tagline || '',
          location_city: user.location_city || '',
          location_state: user.location_state || '',
          location_country: user.location_country || '',
          hobbies: user.hobbies || [],
          skills: user.skills || [],
          favorite_pets: user.favorite_pets || [],
          expertise: user.expertise || []
        });
        setAvatarPreview(user.avatar_url || '');
        setBannerPreview(user.banner_url || '');
      }
    } catch (err: any) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (file: File | null, preview: string) => {
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  const handleBannerChange = (file: File | null, preview: string) => {
    setBannerFile(file);
    setBannerPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Upload avatar if changed
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const response = await mediaApi.uploadFiles({ files: [avatarFile] });
        if (response.success && response.data && response.data[0] && response.data[0].file_url) {
          avatarUrl = response.data[0].file_url;
        }
      }

      // Upload banner if changed
      let bannerUrl = bannerPreview;
      if (bannerFile) {
        const response = await mediaApi.uploadFiles({ files: [bannerFile] });
        if (response.success && response.data && response.data[0] && response.data[0].file_url) {
          bannerUrl = response.data[0].file_url;
        }
      }

      // Update profile
      const updateData = {
        ...formData,
        avatar_url: avatarUrl,
        banner_url: bannerUrl
      };

      const response = await usersApi.updateUser(state.user!.id, updateData);

      if (response.success) {
        showSuccess('Profile updated successfully');
        // Update auth state with new user data
        if (response.data) {
          updateUser(response.data);
        }
        navigate(`/user/${state.user!.id}`);
      }
    } catch (err: any) {
      showError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Edit Profile</Title>
        <Subtitle>Customize your profile information</Subtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        <ProfileImageUpload
          avatarPreview={avatarPreview}
          bannerPreview={bannerPreview}
          onAvatarChange={handleAvatarChange}
          onBannerChange={handleBannerChange}
          userInitials={`${state.user?.first_name?.[0]}${state.user?.last_name?.[0]}`}
          onError={showError}
        />

        <ProfileBasicInfoForm
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ProfileSocialLinksForm
          formData={formData}
          onInputChange={handleInputChange}
        />

        <ProfileInterestsForm
          formData={formData}
          onInputChange={handleInputChange}
        />

        <Actions>
          <CancelButton type="button" onClick={() => navigate(`/user/${state.user!.id}`)}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </SaveButton>
        </Actions>
      </Form>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.lg};
`;

const CancelButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const SaveButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default EditProfilePage;
