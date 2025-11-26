import React from 'react';
import styled from 'styled-components';
import { MarketplaceListing } from '../../services/marketplaceApi';
// Using Unicode symbols instead of react-icons for compatibility
const HeartIcon = ({ filled }: { filled?: boolean }) => <span>{filled ? '❤️' : '🤍'}</span>;
const LocationIcon = () => <span>📍</span>;

interface ListingCardProps {
  listing: MarketplaceListing;
  onSave?: (id: number) => void;
  onClick?: (id: number) => void;
  onViewReviews?: (sellerId: number, sellerName: string) => void;
}

const Card = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px ${props => props.theme.colors.overlayLight};
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px ${props => props.theme.colors.overlayLight};
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  background: ${props => props.theme.colors.borderLight};
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: ${props => props.theme.colors.white};
  font-size: 48px;
  font-weight: bold;
`;

const SaveButton = styled.button<{ isSaved?: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px ${props => props.theme.colors.overlayLight};
  z-index: 2;
  transition: all 0.2s ease;

  svg {
    color: ${props => props.isSaved ? props.theme.colors.error : props.theme.colors.text.muted};
    font-size: 18px;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px ${props => props.theme.colors.overlayLight};
  }
`;

const ConditionBadge = styled.span<{ condition: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.condition) {
      case 'new': return props.theme.colors.success;
      case 'like_new': return props.theme.colors.info;
      case 'good': return props.theme.colors.warning;
      case 'fair': return props.theme.colors.veteran;
      default: return props.theme.colors.text.muted;
    }
  }};
  color: ${props => props.theme.colors.white};
  z-index: 2;
`;

const Content = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Category = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
`;

const Price = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.muted};
  text-decoration: line-through;
`;

const Footer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    color: ${props => props.theme.colors.error};
  }
`;

const Distance = styled.span`
  color: ${props => props.theme.colors.info};
  font-weight: 600;
`;

const SellerRating = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  margin-top: 8px;
  ${({ $clickable }) => $clickable && `
    cursor: pointer;
    padding: 4px 8px;
    margin: 4px -8px 0;
    border-radius: 6px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  `}
`;

const Stars = styled.span`
  color: #FFD700;
  font-size: 12px;
`;

const RatingValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ReviewCount = styled.span`
  color: ${props => props.theme.colors.text.muted};
`;

const NewSellerBadge = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.text.muted};
`;

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSave, onClick, onViewReviews }) => {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(listing.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(listing.id);
    }
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewReviews && listing.user_id) {
      onViewReviews(listing.user_id, listing.seller_username || 'Seller');
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
  };

  const formatCondition = (condition: string | null | undefined) => {
    if (!condition) return 'N/A';
    return condition.replace('_', ' ');
  };

  // Get seller rating from various possible field names
  const sellerRating = listing.seller_average_rating || listing.seller_rating;
  const sellerReviews = listing.seller_total_reviews ?? listing.seller_review_count ?? 0;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    let stars = '\u2605'.repeat(fullStars);
    if (halfStar && fullStars < 5) stars += '\u00BD';
    return stars || '\u2606';
  };

  return (
    <Card onClick={handleCardClick}>
      <ImageContainer>
        {listing.primary_image ? (
          <Image src={listing.primary_image} alt={listing.title} />
        ) : (
          <PlaceholderImage>
            {listing.title.charAt(0).toUpperCase()}
          </PlaceholderImage>
        )}
        {listing.condition && (
          <ConditionBadge condition={listing.condition}>
            {formatCondition(listing.condition)}
          </ConditionBadge>
        )}
        <SaveButton isSaved={listing.is_saved} onClick={handleSaveClick}>
          {listing.is_saved ? <HeartIcon filled /> : <HeartIcon />}
        </SaveButton>
      </ImageContainer>

      <Content>
        <Category>{listing.category_name || 'Uncategorized'}</Category>
        <Title>{listing.title}</Title>

        <PriceRow>
          <Price>{formatPrice(listing.price)}</Price>
          {listing.original_price && parseFloat(listing.original_price) > parseFloat(listing.price) && (
            <OriginalPrice>{formatPrice(listing.original_price)}</OriginalPrice>
          )}
        </PriceRow>

        {/* Seller Rating */}
        {sellerRating && sellerReviews > 0 ? (
          <SellerRating $clickable={!!onViewReviews} onClick={handleRatingClick}>
            <Stars>{renderStars(parseFloat(sellerRating))}</Stars>
            <RatingValue>{parseFloat(sellerRating).toFixed(1)}</RatingValue>
            <ReviewCount>({sellerReviews} reviews)</ReviewCount>
          </SellerRating>
        ) : (
          <SellerRating>
            <NewSellerBadge>New seller</NewSellerBadge>
          </SellerRating>
        )}
      </Content>

      <Footer>
        <Location>
          <LocationIcon />
          {listing.location_city}, {listing.location_state}
        </Location>
        {listing.distance_miles && (
          <Distance>{parseFloat(listing.distance_miles).toFixed(1)} mi</Distance>
        )}
      </Footer>
    </Card>
  );
};
