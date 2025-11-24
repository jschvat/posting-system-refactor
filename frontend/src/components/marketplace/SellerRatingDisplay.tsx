/**
 * Seller Rating Display Component
 * Shows seller rating badge, stars, and tier information
 */

import React from 'react';
import styled from 'styled-components';

interface SellerStats {
  user_id?: number;
  seller_id?: number;
  total_reviews?: number;
  total_ratings?: number;
  average_rating: string | number;
  seller_level?: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
  seller_tier?: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'top_rated';
  rating_distribution?: { [key: string]: number };
  five_star_count?: number;
  four_star_count?: number;
  three_star_count?: number;
  two_star_count?: number;
  one_star_count?: number;
}

interface SellerRatingDisplayProps {
  stats: SellerStats | null;
  size?: 'small' | 'medium' | 'large';
  showTier?: boolean;
  showBreakdown?: boolean;
  onClick?: () => void;
}

const Container = styled.div<{ $clickable: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  &:hover {
    opacity: ${props => props.$clickable ? 0.8 : 1};
  }
`;

const Stars = styled.div<{ $size: string }>`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'large': return '20px';
      default: return '16px';
    }
  }};
`;

const Star = styled.span<{ $filled: boolean; $partial?: number }>`
  color: ${props => props.$filled ? '#FFD700' : '#ddd'};
  position: relative;

  ${props => props.$partial && `
    &::before {
      content: '\u2605';
      position: absolute;
      left: 0;
      width: ${props.$partial}%;
      overflow: hidden;
      color: #FFD700;
    }
  `}
`;

const RatingText = styled.span<{ $size: string }>`
  font-weight: 600;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  }};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReviewCount = styled.span<{ $size: string }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '11px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const TierBadge = styled.span<{ $tier: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;

  ${props => {
    switch (props.$tier) {
      case 'top_rated':
        return `
          background: linear-gradient(135deg, #FF6B6B, #FFE66D);
          color: #333;
        `;
      case 'platinum':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        `;
      case 'gold':
        return `
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #333;
        `;
      case 'silver':
        return `
          background: linear-gradient(135deg, #C0C0C0, #E8E8E8);
          color: #333;
        `;
      case 'bronze':
        return `
          background: linear-gradient(135deg, #CD7F32, #B87333);
          color: white;
        `;
      default:
        return `
          background: ${props.theme.colors.background};
          color: ${props.theme.colors.text.muted};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

const BreakdownContainer = styled.div`
  margin-top: 12px;
`;

const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const BreakdownLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  width: 50px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: #FFD700;
  border-radius: 4px;
`;

const BreakdownCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  width: 30px;
  text-align: right;
`;

const getTierLabel = (tier: string): string => {
  switch (tier) {
    case 'top_rated': return 'Top Rated';
    case 'platinum': return 'Platinum';
    case 'gold': return 'Gold';
    case 'silver': return 'Silver';
    case 'bronze': return 'Bronze';
    default: return 'New Seller';
  }
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const partial = (rating - fullStars) * 100;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} $filled={true}>{'\u2605'}</Star>);
    } else if (i === fullStars + 1 && partial > 0) {
      stars.push(<Star key={i} $filled={false} $partial={partial}>{'\u2606'}</Star>);
    } else {
      stars.push(<Star key={i} $filled={false}>{'\u2606'}</Star>);
    }
  }

  return stars;
};

export const SellerRatingDisplay: React.FC<SellerRatingDisplayProps> = ({
  stats,
  size = 'medium',
  showTier = false,
  showBreakdown = false,
  onClick
}) => {
  // Support both field names (total_reviews from new schema, total_ratings from old)
  const totalCount = stats?.total_reviews ?? stats?.total_ratings ?? 0;
  const tier = stats?.seller_level ?? stats?.seller_tier ?? 'new';

  if (!stats || totalCount === 0) {
    return (
      <Container $clickable={!!onClick} onClick={onClick}>
        <ReviewCount $size={size}>No ratings yet</ReviewCount>
        {showTier && stats && <TierBadge $tier="new">New Seller</TierBadge>}
      </Container>
    );
  }

  const avgRating = typeof stats.average_rating === 'string'
    ? parseFloat(stats.average_rating)
    : stats.average_rating;

  // Get star counts from either rating_distribution (new) or individual fields (old)
  const getStarCount = (stars: number): number => {
    if (stats.rating_distribution) {
      return stats.rating_distribution[String(stars)] || 0;
    }
    const fieldName = `${['one', 'two', 'three', 'four', 'five'][stars - 1]}_star_count` as keyof SellerStats;
    return (stats[fieldName] as number) || 0;
  };

  return (
    <div>
      <Container $clickable={!!onClick} onClick={onClick}>
        <Stars $size={size}>
          {renderStars(avgRating)}
        </Stars>
        <RatingText $size={size}>{avgRating.toFixed(1)}</RatingText>
        <ReviewCount $size={size}>({totalCount} {totalCount === 1 ? 'review' : 'reviews'})</ReviewCount>
        {showTier && <TierBadge $tier={tier}>{getTierLabel(tier)}</TierBadge>}
      </Container>

      {showBreakdown && totalCount > 0 && (
        <BreakdownContainer>
          {[5, 4, 3, 2, 1].map(stars => {
            const count = getStarCount(stars);
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;

            return (
              <BreakdownRow key={stars}>
                <BreakdownLabel>{stars} star</BreakdownLabel>
                <ProgressBar>
                  <ProgressFill $percentage={percentage} />
                </ProgressBar>
                <BreakdownCount>{count}</BreakdownCount>
              </BreakdownRow>
            );
          })}
        </BreakdownContainer>
      )}
    </div>
  );
};

export default SellerRatingDisplay;
