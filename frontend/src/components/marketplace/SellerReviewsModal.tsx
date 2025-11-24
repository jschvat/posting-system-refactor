import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: number;
  seller_id: number;
  buyer_id: number;
  rating: number;
  review_title?: string;
  review_text?: string;
  communication_rating?: number;
  shipping_speed_rating?: number;
  item_as_described_rating?: number;
  is_verified_purchase: boolean;
  is_flagged?: boolean;
  is_hidden?: boolean;
  seller_response?: string;
  seller_responded_at?: string;
  buyer_username: string;
  buyer_first_name?: string;
  buyer_avatar?: string;
  listing_title?: string;
  created_at: string;
}

interface SellerStats {
  user_id: number;
  username?: string;
  total_reviews: number;
  average_rating: string;
  seller_level: string;
  rating_distribution: { [key: string]: number };
}

interface SellerReviewsModalProps {
  sellerId: number;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
  onAddReview?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const StatsSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 500px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const OverallRating = styled.div`
  text-align: center;
  min-width: 120px;
`;

const BigRating = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Stars = styled.div`
  color: #FFD700;
  font-size: 20px;
  margin: 4px 0;
`;

const ReviewCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SellerTier = styled.span<{ tier: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 8px;
  background: ${({ tier, theme }) => {
    switch (tier) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return theme.colors.borderLight;
    }
  }};
  color: ${({ tier }) => tier === 'gold' ? '#000' : '#333'};
`;

const RatingBars = styled.div`
  flex: 1;
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const RatingLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 60px;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: #FFD700;
  border-radius: 4px;
`;

const BarCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  width: 30px;
  text-align: right;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ReviewCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const ReviewerDetails = styled.div``;

const ReviewerName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerifiedBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  border-radius: 4px;
`;

const ReviewDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ReviewRating = styled.div`
  color: #FFD700;
  font-size: 16px;
`;

const ReviewTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReviewText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const SubRatings = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const SubRating = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};

  span {
    color: #FFD700;
  }
`;

const SellerResponse = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
`;

const ResponseLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const ResponseText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'warning' }>`
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: ${({ variant, theme }) =>
    variant === 'danger' ? theme.colors.error :
    variant === 'warning' ? theme.colors.warning :
    theme.colors.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddReviewButton = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.borderLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ListingTag = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`;

export const SellerReviewsModal: React.FC<SellerReviewsModalProps> = ({
  sellerId,
  sellerName,
  isOpen,
  onClose,
  onAddReview
}) => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingReview, setEditingReview] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/seller/${sellerId}?page=${page}&limit=10`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data.stats);
        setReviews(data.data.ratings);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, sellerId, page]);

  const renderStars = (rating: number) => {
    return '\u2605'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '\u00BD' : '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/${reviewId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleFlagReview = async (reviewId: number) => {
    const reason = window.prompt('Please provide a reason for flagging this review:');
    if (!reason) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/${reviewId}/flag`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        }
      );
      if (response.ok) {
        alert('Review has been flagged for review');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const handleAdminHide = async (reviewId: number, hide: boolean) => {
    const reason = hide ? window.prompt('Reason for hiding this review:') : null;
    if (hide && !reason) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/${reviewId}/admin/hide`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ is_hidden: hide, hide_reason: reason })
        }
      );
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error hiding/unhiding review:', error);
    }
  };

  const handleAdminDelete = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this review? This cannot be undone.')) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/${reviewId}/admin`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review (admin):', error);
    }
  };

  if (!isOpen) return null;

  const distribution = stats?.rating_distribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  const totalReviews = stats?.total_reviews || 0;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Reviews for {sellerName}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Content>
          {loading ? (
            <Loading>Loading reviews...</Loading>
          ) : (
            <>
              <StatsSection>
                <OverallRating>
                  <BigRating>{parseFloat(stats?.average_rating || '0').toFixed(1)}</BigRating>
                  <Stars>{renderStars(parseFloat(stats?.average_rating || '0'))}</Stars>
                  <ReviewCount>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</ReviewCount>
                  {stats?.seller_level && (
                    <SellerTier tier={stats.seller_level}>{stats.seller_level}</SellerTier>
                  )}
                </OverallRating>

                <RatingBars>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = distribution[String(star)] || 0;
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <RatingBar key={star}>
                        <RatingLabel>{star} star{star !== 1 ? 's' : ''}</RatingLabel>
                        <BarContainer>
                          <BarFill percent={percent} />
                        </BarContainer>
                        <BarCount>{count}</BarCount>
                      </RatingBar>
                    );
                  })}
                </RatingBars>
              </StatsSection>

              {reviews.length === 0 ? (
                <EmptyState>No reviews yet. Be the first to leave a review!</EmptyState>
              ) : (
                <ReviewsList>
                  {reviews.map(review => (
                    <ReviewCard key={review.id}>
                      <ReviewHeader>
                        <ReviewerInfo>
                          <Avatar>
                            {review.buyer_first_name?.[0] || review.buyer_username[0].toUpperCase()}
                          </Avatar>
                          <ReviewerDetails>
                            <ReviewerName>
                              {review.buyer_first_name || review.buyer_username}
                              {review.is_verified_purchase && (
                                <VerifiedBadge>Verified Purchase</VerifiedBadge>
                              )}
                            </ReviewerName>
                            <ReviewDate>{formatDate(review.created_at)}</ReviewDate>
                            {review.listing_title && (
                              <ListingTag>Purchased: {review.listing_title}</ListingTag>
                            )}
                          </ReviewerDetails>
                        </ReviewerInfo>
                        <ReviewRating>{renderStars(review.rating)}</ReviewRating>
                      </ReviewHeader>

                      {review.review_title && <ReviewTitle>{review.review_title}</ReviewTitle>}
                      {review.review_text && <ReviewText>{review.review_text}</ReviewText>}

                      {(review.communication_rating || review.shipping_speed_rating || review.item_as_described_rating) && (
                        <SubRatings>
                          {review.communication_rating && (
                            <SubRating>Communication: <span>{renderStars(review.communication_rating)}</span></SubRating>
                          )}
                          {review.shipping_speed_rating && (
                            <SubRating>Shipping: <span>{renderStars(review.shipping_speed_rating)}</span></SubRating>
                          )}
                          {review.item_as_described_rating && (
                            <SubRating>As Described: <span>{renderStars(review.item_as_described_rating)}</span></SubRating>
                          )}
                        </SubRatings>
                      )}

                      {review.seller_response && (
                        <SellerResponse>
                          <ResponseLabel>Seller Response</ResponseLabel>
                          <ResponseText>{review.seller_response}</ResponseText>
                        </SellerResponse>
                      )}

                      {user && (
                        <ReviewActions>
                          {review.buyer_id === user.id && (
                            <>
                              <ActionButton onClick={() => onAddReview && onAddReview()}>
                                Edit
                              </ActionButton>
                              <ActionButton variant="danger" onClick={() => handleDeleteReview(review.id)}>
                                Delete
                              </ActionButton>
                            </>
                          )}
                          {review.buyer_id !== user.id && (
                            <ActionButton variant="warning" onClick={() => handleFlagReview(review.id)}>
                              Flag
                            </ActionButton>
                          )}
                          {user.role === 'admin' && (
                            <>
                              <ActionButton
                                variant="warning"
                                onClick={() => handleAdminHide(review.id, !review.is_hidden)}
                              >
                                {review.is_hidden ? 'Unhide' : 'Hide'}
                              </ActionButton>
                              <ActionButton variant="danger" onClick={() => handleAdminDelete(review.id)}>
                                Admin Delete
                              </ActionButton>
                            </>
                          )}
                        </ReviewActions>
                      )}
                    </ReviewCard>
                  ))}
                </ReviewsList>
              )}
            </>
          )}
        </Content>

        <Footer>
          <div>
            {user && user.id !== sellerId && (
              <AddReviewButton onClick={onAddReview}>
                Write a Review
              </AddReviewButton>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </PageButton>
              <span>Page {page} of {totalPages}</span>
              <PageButton
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default SellerReviewsModal;
