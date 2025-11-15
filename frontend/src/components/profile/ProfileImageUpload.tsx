/**
 * Profile Image Upload Component - Handles banner and avatar upload UI
 */

import React, { useRef } from 'react';
import styled from 'styled-components';
import { useToast } from '../Toast';

interface ProfileImageUploadProps {
  avatarPreview: string;
  bannerPreview: string;
  onAvatarChange: (file: File, preview: string) => void;
  onBannerChange: (file: File, preview: string) => void;
  avatarInitials?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  avatarPreview,
  bannerPreview,
  onAvatarChange,
  onBannerChange,
  avatarInitials = 'AB'
}) => {
  const { showError } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be less than 5MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    onAvatarChange(file, preview);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Image must be less than 10MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    onBannerChange(file, preview);
  };

  return (
    <>
      {/* Banner Upload */}
      <Section>
        <SectionTitle>Banner Image</SectionTitle>
        <BannerUploadArea onClick={() => bannerInputRef.current?.click()}>
          {bannerPreview ? (
            <BannerPreview src={bannerPreview} alt="Banner" />
          ) : (
            <UploadPlaceholder>
              <UploadIcon>🖼️</UploadIcon>
              <UploadText>Click to upload banner image</UploadText>
              <UploadHint>Recommended size: 1500x500px</UploadHint>
            </UploadPlaceholder>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            style={{ display: 'none' }}
          />
        </BannerUploadArea>
      </Section>

      {/* Avatar Upload */}
      <Section>
        <SectionTitle>Profile Picture</SectionTitle>
        <AvatarUploadArea onClick={() => avatarInputRef.current?.click()}>
          {avatarPreview ? (
            <AvatarPreview src={avatarPreview} alt="Avatar" />
          ) : (
            <AvatarPlaceholder>{avatarInitials}</AvatarPlaceholder>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            style={{ display: 'none' }}
          />
          <AvatarOverlay>
            <span>📷</span>
            <span>Change</span>
          </AvatarOverlay>
        </AvatarUploadArea>
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

const BannerUploadArea = styled.div`
  width: 100%;
  height: 200px;
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BannerPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UploadText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const UploadHint = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const AvatarUploadArea = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 3px solid ${props => props.theme.colors.border};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const AvatarPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: bold;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: ${props => props.theme.spacing.sm};
  text-align: center;
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${AvatarUploadArea}:hover & {
    opacity: 1;
  }
`;

export default ProfileImageUpload;
