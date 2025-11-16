import React from 'react';
import styled from 'styled-components';
import { Media } from '../../../types';

interface ComposerMediaUploadProps {
  uploadedMedia: Media[];
  uploading: boolean;
  selectedFiles: File[];
  showAttachMenu: boolean;
  allowedTypes: {
    text: boolean;
    link: boolean;
    image: boolean;
    video: boolean;
    poll: boolean;
  };
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveUploadedMedia: (mediaId: number) => void;
  onToggleAttachMenu: (show: boolean) => void;
  onMenuItemClick: (fileType: string, accept: string) => void;
  onLinkClick?: () => void;
  onPollClick?: () => void;
}

export const ComposerMediaUpload: React.FC<ComposerMediaUploadProps> = ({
  uploadedMedia,
  uploading,
  selectedFiles,
  showAttachMenu,
  allowedTypes,
  fileInputRef,
  onFileSelect,
  onRemoveUploadedMedia,
  onToggleAttachMenu,
  onMenuItemClick,
  onLinkClick,
  onPollClick
}) => {
  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />

      {/* Uploaded Media Preview Grid */}
      {uploadedMedia.length > 0 && (
        <FormGroup>
          <UploadedMediaList>
            {uploadedMedia.map((media) => (
              <UploadedMediaItem key={media.id}>
                {media.media_type === 'image' && media.file_url && (
                  <MediaThumbnail src={media.file_url} alt={media.alt_text || 'Uploaded image'} />
                )}
                {media.media_type === 'video' && (
                  <VideoThumbnail>
                    <VideoIcon>🎥</VideoIcon>
                    <VideoName>{media.filename}</VideoName>
                  </VideoThumbnail>
                )}
                <RemoveMediaButton onClick={() => onRemoveUploadedMedia(media.id)}>×</RemoveMediaButton>
              </UploadedMediaItem>
            ))}
          </UploadedMediaList>
        </FormGroup>
      )}

      {/* Uploading Status */}
      {selectedFiles.length > 0 && uploading && (
        <FormGroup>
          <UploadingText>Uploading {selectedFiles.length} file(s)...</UploadingText>
        </FormGroup>
      )}

      {/* Attach Menu */}
      <AttachmentSection>
        <AttachMenuContainer data-attach-menu>
          <AttachButton
            type="button"
            onClick={() => onToggleAttachMenu(!showAttachMenu)}
            title="Add attachment"
          >
            <PlusIcon>+</PlusIcon>
          </AttachButton>

          {showAttachMenu && (
            <AttachMenu>
              {allowedTypes.image && (
                <>
                  <MenuItem onClick={() => onMenuItemClick('photo', 'image/*')}>
                    <MenuIcon>📷</MenuIcon>
                    <MenuText>Photo</MenuText>
                  </MenuItem>
                  <MenuItem onClick={() => onMenuItemClick('video', 'video/*')}>
                    <MenuIcon>🎥</MenuIcon>
                    <MenuText>Video</MenuText>
                  </MenuItem>
                </>
              )}
              {allowedTypes.link && (
                <MenuItem onClick={onLinkClick}>
                  <MenuIcon>🔗</MenuIcon>
                  <MenuText>Link</MenuText>
                </MenuItem>
              )}
              <MenuItem onClick={() => onMenuItemClick('pdf', '.pdf')}>
                <MenuIcon>📄</MenuIcon>
                <MenuText>PDF</MenuText>
              </MenuItem>
              <MenuItem onClick={() => onMenuItemClick('office', '.doc,.docx,.xls,.xlsx,.ppt,.pptx')}>
                <MenuIcon>📊</MenuIcon>
                <MenuText>Office Document</MenuText>
              </MenuItem>
              <MenuItem onClick={() => onMenuItemClick('3d-model', '.skp,.dae,.3ds,.obj,.fbx,.stl')}>
                <MenuIcon>🏗️</MenuIcon>
                <MenuText>3D Model</MenuText>
              </MenuItem>
              <MenuItem onClick={() => onMenuItemClick('archive', '.zip,.rar,.7z,.tar,.gz')}>
                <MenuIcon>📦</MenuIcon>
                <MenuText>Archive</MenuText>
              </MenuItem>
              {allowedTypes.poll && (
                <MenuItem onClick={onPollClick}>
                  <MenuIcon>📊</MenuIcon>
                  <MenuText>Poll</MenuText>
                </MenuItem>
              )}
            </AttachMenu>
          )}
        </AttachMenuContainer>
      </AttachmentSection>
    </>
  );
};

// Styled Components

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const UploadingText = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
`;

const UploadedMediaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`;

const UploadedMediaItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
`;

const MediaThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoThumbnail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  padding: 8px;
`;

const VideoIcon = styled.div`
  font-size: 32px;
  margin-bottom: 4px;
`;

const VideoName = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const RemoveMediaButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(244, 67, 54, 0.9);
  color: ${props.theme.colors.white};
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props.theme.colors.error};
  }
`;

const AttachmentSection = styled.div`
  flex: 1;
`;

const AttachMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const AttachButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.primary};
  color: ${props.theme.colors.white};
  font-size: 24px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
`;

const PlusIcon = styled.span`
  line-height: 1;
  margin-top: -2px;
`;

const AttachMenu = styled.div`
  position: absolute;
  bottom: 48px;
  left: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px;
  z-index: 1000;
  animation: slideUp 0.2s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text};
  font-size: 15px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MenuIcon = styled.span`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
`;

const MenuText = styled.span`
  flex: 1;
  font-weight: 500;
`;
