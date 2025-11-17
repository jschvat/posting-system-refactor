/**
 * Profile Header Component - Displays user profile header section
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getUserAvatarUrl } from '../../services/api';
import FollowButton from '../FollowButton';
import RatingButton from '../RatingButton';
import RatingDisplay from '../RatingDisplay';
import ReputationBadge from '../ReputationBadge';

// Styled Components
const Banner = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 200px;
  background: ${({ theme, $imageUrl }) =>
    $imageUrl
      ? `url(${$imageUrl})`
      : `linear-gradient(135deg, ${theme.colors.primary}40 0%, ${theme.colors.secondary}40 100%)`
  };
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  margin-bottom: -60px;
  position: relative;
`;

const ProfileHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  padding-top: 80px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Avatar = styled.div<{ $hasImage?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => $hasImage ? 'transparent' : theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  font-weight: bold;
  font-size: 2rem;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100px;
    height: 100px;
    font-size: 1.5rem;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 1.75rem;
  font-weight: 700;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const Username = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LocationInfo = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &::before {
    content: '📍';
  }
`;

const Bio = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 1rem;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatItem = styled.div<{ $clickable?: boolean }>`
  flex: 1;
  min-width: 100px;
  text-align: center;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  padding: ${({ theme, $clickable }) => $clickable ? theme.spacing.sm : '0'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme, $clickable }) => $clickable ? theme.colors.background : 'transparent'};
  }
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.border
  };
  background: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.surface
  };
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.white : theme.colors.text.primary
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primary + 'dd' : theme.colors.background
    };
  }
`;

const InterestsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InterestGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InterestLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Tag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${({ theme }) => theme.colors.primary15};
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

// Helper function to format tags
const formatTag = (tag: string): string => {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format location
const formatLocation = (user: any): string | null => {
  if (!user.location_sharing || user.location_sharing === 'off') return null;

  if (user.location_sharing === 'city' && user.location_city) {
    // Show city, state format
    const parts = [user.location_city, user.location_state].filter(Boolean);
    return parts.join(', ');
  }

  if (user.location_sharing === 'exact') {
    // Show full address when available
    if (user.address) {
      // Full address format: "123 Main St, City, State ZIP, Country"
      const parts = [
        user.address,
        user.location_city,
        user.location_state && user.location_zip ? `${user.location_state} ${user.location_zip}` : user.location_state,
        user.location_country
      ].filter(Boolean);
      return parts.join(', ');
    }
    // Fallback to city/state/country if no street address
    if (user.location_city || user.location_state) {
      const parts = [
        user.location_city,
        user.location_state && user.location_zip ? `${user.location_state} ${user.location_zip}` : user.location_state,
        user.location_country
      ].filter(Boolean);
      return parts.join(', ');
    }
    // Last resort: show coordinates
    if (user.location_latitude != null && user.location_longitude != null) {
      return `${user.location_latitude.toFixed(4)}, ${user.location_longitude.toFixed(4)}`;
    }
  }

  return null;
};

// Types
interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  stats: {
    postsCount: number;
    followingCount: number;
    followersCount: number;
  };
  reputation?: {
    reputation_level: string;
    reputation_score: number;
  };
  ratings?: {
    averageRating: number;
    totalRatings: number;
  };
  onEditProfile: () => void;
  onSendMessage: () => void;
  onReputationRefetch: () => void;
  onRatingsRefetch: () => void;
  onStatClick: (tab: 'posts' | 'following' | 'followers') => void;
}

const ProfileHeaderComponent: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  stats,
  reputation,
  ratings,
  onEditProfile,
  onSendMessage,
  onReputationRefetch,
  onRatingsRefetch,
  onStatClick,
}) => {
  const avatarUrl = getUserAvatarUrl(user);
  const hasAvatar = Boolean(user.avatar_url) && user.avatar_url !== avatarUrl;
  const formattedLocation = formatLocation(user);

  return (
    <>
      <Banner $imageUrl={user.banner_url} />
      <ProfileHeader>
        <ProfileInfo>
          <div>
            <Avatar $hasImage={hasAvatar}>
              {hasAvatar ? (
                <img src={avatarUrl} alt={`${user.first_name} ${user.last_name}`} />
              ) : (
                `${user.first_name[0]}${user.last_name[0]}`
              )}
            </Avatar>

            {/* Reputation and Rating Section - under avatar */}
            {reputation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                <ReputationBadge
                  level={reputation.reputation_level}
                  score={reputation.reputation_score}
                  size="medium"
                />
                {ratings && ratings.totalRatings > 0 && (
                  <RatingDisplay
                    rating={ratings.averageRating}
                    totalRatings={ratings.totalRatings}
                    size="small"
                  />
                )}
              </div>
            )}
          </div>

          <UserDetails>
            <UserName>{user.first_name} {user.last_name}</UserName>
            <Username>@{user.username}</Username>

            {formattedLocation && <LocationInfo>{formattedLocation}</LocationInfo>}

            {user.bio && <Bio>{user.bio}</Bio>}

            {/* Interests & Skills */}
            {(user.hobbies?.length || user.skills?.length || user.favorite_pets?.length || user.expertise?.length) ? (
              <InterestsSection>
                {user.hobbies && user.hobbies.length > 0 && (
                  <InterestGroup>
                    <InterestLabel>Hobbies</InterestLabel>
                    <TagsContainer>
                      {user.hobbies.slice(0, 5).map((hobby: string) => (
                        <Tag key={hobby}>{formatTag(hobby)}</Tag>
                      ))}
                      {user.hobbies.length > 5 && <Tag>+{user.hobbies.length - 5} more</Tag>}
                    </TagsContainer>
                  </InterestGroup>
                )}
                {user.skills && user.skills.length > 0 && (
                  <InterestGroup>
                    <InterestLabel>Skills</InterestLabel>
                    <TagsContainer>
                      {user.skills.slice(0, 5).map((skill: string) => (
                        <Tag key={skill}>{formatTag(skill)}</Tag>
                      ))}
                      {user.skills.length > 5 && <Tag>+{user.skills.length - 5} more</Tag>}
                    </TagsContainer>
                  </InterestGroup>
                )}
                {user.favorite_pets && user.favorite_pets.length > 0 && (
                  <InterestGroup>
                    <InterestLabel>Favorite Pets</InterestLabel>
                    <TagsContainer>
                      {user.favorite_pets.slice(0, 5).map((pet: string) => (
                        <Tag key={pet}>{formatTag(pet)}</Tag>
                      ))}
                      {user.favorite_pets.length > 5 && <Tag>+{user.favorite_pets.length - 5} more</Tag>}
                    </TagsContainer>
                  </InterestGroup>
                )}
                {user.expertise && user.expertise.length > 0 && (
                  <InterestGroup>
                    <InterestLabel>Expertise</InterestLabel>
                    <TagsContainer>
                      {user.expertise.slice(0, 5).map((exp: string) => (
                        <Tag key={exp}>{formatTag(exp)}</Tag>
                      ))}
                      {user.expertise.length > 5 && <Tag>+{user.expertise.length - 5} more</Tag>}
                    </TagsContainer>
                  </InterestGroup>
                )}
              </InterestsSection>
            ) : null}

            <StatsContainer>
              <StatItem
                $clickable
                onClick={() => onStatClick('posts')}
                title="Click to see posts"
              >
                <StatNumber>{stats.postsCount}</StatNumber>
                <StatLabel>Posts</StatLabel>
              </StatItem>
              <StatItem
                $clickable
                onClick={() => onStatClick('following')}
                title="Click to see who they're following"
              >
                <StatNumber>{stats.followingCount}</StatNumber>
                <StatLabel>Following</StatLabel>
              </StatItem>
              <StatItem
                $clickable
                onClick={() => onStatClick('followers')}
                title="Click to see their followers"
              >
                <StatNumber>{stats.followersCount}</StatNumber>
                <StatLabel>Followers</StatLabel>
              </StatItem>
            </StatsContainer>

            {isOwnProfile ? (
              <ActionButtons>
                <ActionButton onClick={onEditProfile}>
                  Edit Profile
                </ActionButton>
              </ActionButtons>
            ) : (
              <ActionButtons>
                <FollowButton userId={user.id} size="large" />
                <RatingButton
                  userId={user.id}
                  username={user.username}
                  onRatingSubmitted={() => {
                    onReputationRefetch();
                    onRatingsRefetch();
                  }}
                  variant="outline"
                  size="medium"
                />
                <ActionButton $variant="secondary" onClick={onSendMessage}>Message</ActionButton>
              </ActionButtons>
            )}
          </UserDetails>
        </ProfileInfo>
      </ProfileHeader>
    </>
  );
};

export default ProfileHeaderComponent;
