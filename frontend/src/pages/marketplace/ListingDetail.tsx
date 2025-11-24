import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import marketplaceApi, { MarketplaceListing } from '../../services/marketplaceApi';
import { BuyingInterface } from '../../components/marketplace/BuyingInterface';
import { ImageModal } from '../../components/marketplace/ImageModal';
import { SellerRatingDisplay } from '../../components/marketplace/SellerRatingDisplay';
import { SellerReviewsModal } from '../../components/marketplace/SellerReviewsModal';
import { AddReviewModal } from '../../components/marketplace/AddReviewModal';
// Using Unicode symbols instead of react-icons for compatibility
const LocationIcon = () => <span>📍</span>;
const ArrowLeftIcon = () => <span>←</span>;
const UserIcon = () => <span>👤</span>;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.info};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;

  &:hover {
    color: ${({ theme }) => theme.colors.infoDark};
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div``;

const ImageGallery = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
`;

const MainImage = styled.div`
  width: 100%;
  padding-top: 75%;
  background: ${({ theme }) => theme.colors.borderLight};
  position: relative;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.black};
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
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
  color: ${({ theme }) => theme.colors.white};
  font-size: 120px;
  font-weight: bold;
`;

const NavigationButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.direction}: 16px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.white};
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: ${({ theme }) => theme.colors.white};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
`;

const ThumbnailStrip = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.borderLight};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
`;

const Thumbnail = styled.div<{ active: boolean }>`
  min-width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.active ? props.theme.colors.info : 'transparent'};
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.info};
    opacity: 0.8;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DetailsCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
  line-height: 1.3;
`;

const Category = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const ConditionBadge = styled.span<{ condition: string }>`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 8px;
  background: ${props => {
    switch (props.condition) {
      case 'new': return props.theme.colors.success;
      case 'like_new': return props.theme.colors.info;
      case 'good': return props.theme.colors.warning;
      default: return props.theme.colors.text.muted;
    }
  }};
  color: ${({ theme }) => theme.colors.white};
`;

const Description = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.8;
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  h4 {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  p {
    font-size: 15px;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    font-weight: 600;
  }
`;

const BirdAttributesSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

const BirdBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const BirdBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.statusAcceptedBg};
  color: ${({ theme }) => theme.colors.success};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
`;

const RightColumn = styled.div``;

const SellerCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
`;

const SellerTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SellerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
`;

const SellerDetails = styled.div`
  flex: 1;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 15px;

  svg {
    color: ${({ theme }) => theme.colors.error};
    font-size: 18px;
  }
`;

const RatingSection = styled.div`
  padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin: 16px -24px 0;
  padding: 16px 24px;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReviewButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant, theme }) => variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover {
      opacity: 0.9;
    }
  ` : `
    background: white;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background: ${theme.colors.hover};
    }
  `}
`;

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadListing(parseInt(id));
    }
  }, [id]);

  const loadListing = async (listingId: number) => {
    setLoading(true);
    try {
      const response = await marketplaceApi.getListing(listingId);
      if (response.success) {
        setListing(response.data);
        // Load seller ratings
        if (response.data.user_id) {
          loadSellerRatings(response.data.user_id);
        }
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerRatings = async (sellerId: number) => {
    try {
      const response = await marketplaceApi.getSellerRatings(sellerId);
      if (response.success) {
        setSellerStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading seller ratings:', error);
    }
  };

  const handleSave = async () => {
    if (!listing) return;

    try {
      if (listing.is_saved) {
        await marketplaceApi.unsaveListing(listing.id);
      } else {
        await marketplaceApi.saveListing(listing.id);
      }
      loadListing(listing.id);
    } catch (error) {
      console.error('Error saving listing:', error);
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

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#65676b' }}>
          Loading...
        </div>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Listing not found</h2>
          <BackButton onClick={() => navigate('/marketplace')}>
            <ArrowLeftIcon /> Back to Marketplace
          </BackButton>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate('/marketplace')}>
        <ArrowLeftIcon /> Back to Marketplace
      </BackButton>

      <Content>
        <LeftColumn>
          <ImageGallery>
            <MainImage>
              {listing.media && listing.media.length > 0 ? (
                <>
                  <Image
                    src={listing.media[currentImageIndex].file_url}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    onClick={() => setIsModalOpen(true)}
                  />
                  {listing.media.length > 1 && (
                    <>
                      <NavigationButton
                        direction="left"
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? listing.media!.length - 1 : prev - 1)}
                        disabled={listing.media.length <= 1}
                      >
                        ‹
                      </NavigationButton>
                      <NavigationButton
                        direction="right"
                        onClick={() => setCurrentImageIndex(prev => prev === listing.media!.length - 1 ? 0 : prev + 1)}
                        disabled={listing.media.length <= 1}
                      >
                        ›
                      </NavigationButton>
                      <ImageCounter>
                        {currentImageIndex + 1} / {listing.media.length}
                      </ImageCounter>
                    </>
                  )}
                </>
              ) : listing.primary_image ? (
                <Image src={listing.primary_image} alt={listing.title} />
              ) : (
                <PlaceholderImage>
                  {listing.title.charAt(0).toUpperCase()}
                </PlaceholderImage>
              )}
            </MainImage>
            {listing.media && listing.media.length > 1 && (
              <ThumbnailStrip>
                {listing.media.map((image, index) => (
                  <Thumbnail
                    key={image.id}
                    active={index === currentImageIndex}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image.file_url} alt={`Thumbnail ${index + 1}`} />
                  </Thumbnail>
                ))}
              </ThumbnailStrip>
            )}
          </ImageGallery>

          <DetailsCard>
            <Title>{listing.title}</Title>
            <div>
              <Category>{listing.category_name || 'Uncategorized'}</Category>
              {listing.condition && (
                <ConditionBadge condition={listing.condition}>
                  {formatCondition(listing.condition)}
                </ConditionBadge>
              )}
            </div>

            <InfoGrid>
              <InfoItem>
                <h4>Price</h4>
                <p>{formatPrice(listing.price)}</p>
              </InfoItem>
              {listing.condition && (
                <InfoItem>
                  <h4>Condition</h4>
                  <p>{formatCondition(listing.condition)}</p>
                </InfoItem>
              )}
              <InfoItem>
                <h4>Shipping</h4>
                <p>{listing.shipping_available ? `$${listing.shipping_cost}` : 'Pickup only'}</p>
              </InfoItem>
              <InfoItem>
                <h4>Quantity</h4>
                <p>{listing.quantity || 1} available</p>
              </InfoItem>
            </InfoGrid>

            <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '18px' }}>Description</h3>
            <Description>{listing.description}</Description>

            {/* Display bird-specific attributes if this is a bird listing */}
            {(listing as any).bird_species && (
              <BirdAttributesSection>
                <SectionTitle>Bird Details</SectionTitle>

                <BirdBadges>
                  {(listing as any).is_hand_fed && <BirdBadge>✋ Hand-Fed</BirdBadge>}
                  {(listing as any).is_hand_tamed && <BirdBadge>🤝 Hand-Tamed</BirdBadge>}
                  {(listing as any).dna_sexed && <BirdBadge>🧬 DNA Sexed</BirdBadge>}
                  {(listing as any).health_certificate_available && <BirdBadge>📋 Health Certificate</BirdBadge>}
                  {(listing as any).can_talk && <BirdBadge>🗣️ Can Talk</BirdBadge>}
                  {(listing as any).proven_breeder && <BirdBadge>🏆 Proven Breeder</BirdBadge>}
                  {(listing as any).includes_health_guarantee && <BirdBadge>💚 Health Guarantee</BirdBadge>}
                </BirdBadges>

                <InfoGrid>
                  <InfoItem>
                    <h4>Species</h4>
                    <p>{(listing as any).bird_species}</p>
                  </InfoItem>
                  {(listing as any).bird_subspecies && (
                    <InfoItem>
                      <h4>Subspecies</h4>
                      <p>{(listing as any).bird_subspecies}</p>
                    </InfoItem>
                  )}
                  {(listing as any).sex && (
                    <InfoItem>
                      <h4>Sex</h4>
                      <p style={{ textTransform: 'capitalize' }}>{(listing as any).sex}</p>
                    </InfoItem>
                  )}
                  {((listing as any).age_years || (listing as any).age_months) && (
                    <InfoItem>
                      <h4>Age</h4>
                      <p>
                        {(listing as any).age_years ? `${(listing as any).age_years} year${(listing as any).age_years > 1 ? 's' : ''}` : ''}
                        {(listing as any).age_years && (listing as any).age_months ? ' ' : ''}
                        {(listing as any).age_months ? `${(listing as any).age_months} month${(listing as any).age_months > 1 ? 's' : ''}` : ''}
                      </p>
                    </InfoItem>
                  )}
                  {(listing as any).color_mutation && (
                    <InfoItem>
                      <h4>Color Mutation</h4>
                      <p>{(listing as any).color_mutation}</p>
                    </InfoItem>
                  )}
                  {(listing as any).temperament && (
                    <InfoItem>
                      <h4>Temperament</h4>
                      <p style={{ textTransform: 'capitalize' }}>{(listing as any).temperament}</p>
                    </InfoItem>
                  )}
                  {(listing as any).health_status && (
                    <InfoItem>
                      <h4>Health Status</h4>
                      <p style={{ textTransform: 'capitalize' }}>{(listing as any).health_status}</p>
                    </InfoItem>
                  )}
                  {(listing as any).talks_vocabulary && (
                    <InfoItem>
                      <h4>Vocabulary</h4>
                      <p>{(listing as any).talks_vocabulary}</p>
                    </InfoItem>
                  )}
                </InfoGrid>

                {(listing as any).color_description && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#65676b', marginBottom: '8px' }}>Color Description</h4>
                    <p style={{ fontSize: '15px', marginBottom: '16px' }}>{(listing as any).color_description}</p>
                  </div>
                )}

                {(listing as any).breeding_history && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#65676b', marginBottom: '8px' }}>Breeding History</h4>
                    <p style={{ fontSize: '15px', marginBottom: '16px' }}>{(listing as any).breeding_history}</p>
                  </div>
                )}

                {(listing as any).breeder_certification && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#65676b', marginBottom: '8px' }}>Breeder Certification</h4>
                    <p style={{ fontSize: '15px', marginBottom: '16px' }}>{(listing as any).breeder_certification}</p>
                  </div>
                )}

                {(listing as any).shipping_methods && (
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#65676b', marginBottom: '8px' }}>Shipping Methods</h4>
                    <p style={{ fontSize: '15px', marginBottom: '16px' }}>{(listing as any).shipping_methods}</p>
                  </div>
                )}
              </BirdAttributesSection>
            )}
          </DetailsCard>
        </LeftColumn>

        <RightColumn>
          <BuyingInterface listing={listing} onUpdate={() => loadListing(listing.id)} />

          <SellerCard>
            <SellerTitle>Seller Information</SellerTitle>
            <SellerInfo>
              <SellerAvatar>
                {listing.seller_username ? listing.seller_username.charAt(0).toUpperCase() : <UserIcon />}
              </SellerAvatar>
              <SellerDetails>
                <h4>{listing.seller_username || 'Anonymous'}</h4>
                <p>Member since {new Date(listing.created_at).getFullYear()}</p>
              </SellerDetails>
            </SellerInfo>

            {sellerStats && (
              <RatingSection onClick={() => setReviewsModalOpen(true)}>
                <SellerRatingDisplay
                  stats={sellerStats}
                  size="medium"
                  showTier={true}
                />
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#1877f2' }}>
                  Click to view all reviews
                </div>
              </RatingSection>
            )}

            <ReviewActions>
              <ReviewButton onClick={() => setReviewsModalOpen(true)}>
                View Reviews
              </ReviewButton>
              <ReviewButton variant="primary" onClick={() => setAddReviewModalOpen(true)}>
                Write Review
              </ReviewButton>
            </ReviewActions>

            <Location>
              <LocationIcon />
              {listing.location_city}, {listing.location_state}
              {listing.distance_miles && ` (${parseFloat(listing.distance_miles).toFixed(1)} mi away)`}
            </Location>
          </SellerCard>
        </RightColumn>
      </Content>

      {isModalOpen && listing.media && listing.media.length > 0 && (
        <ImageModal
          images={listing.media}
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onNavigate={(index) => setCurrentImageIndex(index)}
        />
      )}

      {/* Seller Reviews Modal */}
      {listing.user_id && (
        <SellerReviewsModal
          sellerId={listing.user_id}
          sellerName={listing.seller_username || 'Seller'}
          isOpen={reviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
        />
      )}

      {/* Add Review Modal */}
      {listing.user_id && (
        <AddReviewModal
          sellerId={listing.user_id}
          sellerName={listing.seller_username || 'Seller'}
          listingId={listing.id}
          listingTitle={listing.title}
          isOpen={addReviewModalOpen}
          onClose={() => setAddReviewModalOpen(false)}
          onSuccess={() => {
            loadSellerRatings(listing.user_id);
          }}
        />
      )}
    </Container>
  );
};
