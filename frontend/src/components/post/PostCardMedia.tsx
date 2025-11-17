/**
 * PostCardMedia Component - displays media gallery with full-screen modal viewing
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { getApiBaseUrl } from '../../config/app.config';

interface MediaItem {
  id: number;
  url?: string;
  file_url?: string;
  file_path?: string;
  media_type: string;
  mime_type?: string;
  alt_text?: string;
  thumbnail_url?: string;
}

interface PostCardMediaProps {
  media: MediaItem[];
  postId: number;
}

// Styled Components
const MediaGrid = styled.div<{ $count: number }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  grid-template-columns: ${({ $count }) => {
    if ($count === 1) return '1fr';
    if ($count === 2) return 'repeat(2, 1fr)';
    if ($count === 3) return 'repeat(3, 1fr)';
    return 'repeat(2, 1fr)';
  }};
  max-height: 600px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const MediaItem = styled.div<{ $isVideo?: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $isVideo }) => $isVideo ? '16/9' : '1'};
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  &:hover img, &:hover video {
    transform: scale(1.05);
  }
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-size: 24px;
  pointer-events: none;
`;

const MediaCount = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: ${({ theme }) => theme.colors.white};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
`;

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const CloseModalButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const NavigationButton = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => $direction === 'prev' ? 'left: -60px;' : 'right: -60px;'}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PostCardMedia: React.FC<PostCardMediaProps> = ({ media, postId }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Early return if no media
  if (!media || media.length === 0) {
    return null;
  }

  // Filter out only image media for modal viewing
  const imageMedia = media.filter(m => m.media_type === 'image');

  // Image modal handlers
  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (currentImageIndex < imageMedia.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Helper to get media URL
  const getMediaUrl = (mediaItem: MediaItem) => {
    return `${getApiBaseUrl()}${mediaItem.file_url || `/uploads/${mediaItem.file_path}`}`;
  };

  return (
    <>
      {/* Media Gallery */}
      <MediaGrid $count={media.length}>
        {media.slice(0, 4).map((mediaItem, index) => (
          <MediaItem
            key={mediaItem.id}
            $isVideo={mediaItem.media_type === 'video'}
            onClick={() => mediaItem.media_type === 'image' && openImageModal(imageMedia.findIndex(m => m.id === mediaItem.id))}
          >
            {mediaItem.media_type === 'image' && (
              <img
                src={getMediaUrl(mediaItem)}
                alt={mediaItem.alt_text || 'Post image'}
              />
            )}
            {mediaItem.media_type === 'video' && (
              <>
                <video
                  src={getMediaUrl(mediaItem)}
                  poster={mediaItem.thumbnail_url ? `${getApiBaseUrl()}${mediaItem.thumbnail_url}` : undefined}
                />
                <VideoOverlay>▶</VideoOverlay>
              </>
            )}
            {index === 3 && media.length > 4 && (
              <MediaCount>+{media.length - 4} more</MediaCount>
            )}
          </MediaItem>
        ))}
      </MediaGrid>

      {/* Image Modal */}
      {showImageModal && imageMedia.length > 0 && createPortal(
        <ModalOverlay onClick={closeImageModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseModalButton onClick={closeImageModal}>×</CloseModalButton>

            {imageMedia.length > 1 && (
              <>
                <NavigationButton
                  $direction="prev"
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  ‹
                </NavigationButton>
                <NavigationButton
                  $direction="next"
                  onClick={nextImage}
                  disabled={currentImageIndex === imageMedia.length - 1}
                >
                  ›
                </NavigationButton>
              </>
            )}

            <ModalImage
              src={getMediaUrl(imageMedia[currentImageIndex])}
              alt={imageMedia[currentImageIndex].alt_text || 'Post image'}
            />
          </ModalContent>
        </ModalOverlay>,
        document.body
      )}
    </>
  );
};

export default PostCardMedia;
