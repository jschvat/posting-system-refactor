import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

interface AddReviewModalProps {
  sellerId: number;
  sellerName: string;
  listingId?: number;
  listingTitle?: string;
  transactionId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editReview?: {
    id: number;
    rating: number;
    review_title?: string;
    review_text?: string;
    communication_rating?: number;
    shipping_speed_rating?: number;
    item_as_described_rating?: number;
  };
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
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  padding: 24px;
`;

const SellerInfo = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SellerName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ListingInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 8px;
  font-size: 36px;
`;

const Star = styled.button<{ active: boolean; hovered: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ active, hovered }) => (active || hovered) ? '#FFD700' : '#e0e0e0'};
  padding: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.15);
  }
`;

const SubRatingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
`;

const SubRatingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubRatingLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SubStars = styled.div`
  display: flex;
  gap: 4px;
  font-size: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant, theme }) => variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  ` : `
    background: white;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      background: ${theme.colors.borderLight};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  sellerId,
  sellerName,
  listingId,
  listingTitle,
  transactionId,
  isOpen,
  onClose,
  onSuccess,
  editReview
}) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(editReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState(editReview?.review_title || '');
  const [reviewText, setReviewText] = useState(editReview?.review_text || '');
  const [communicationRating, setCommunicationRating] = useState(editReview?.communication_rating || 0);
  const [shippingRating, setShippingRating] = useState(editReview?.shipping_speed_rating || 0);
  const [asDescribedRating, setAsDescribedRating] = useState(editReview?.item_as_described_rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [hoveredComm, setHoveredComm] = useState(0);
  const [hoveredShip, setHoveredShip] = useState(0);
  const [hoveredDesc, setHoveredDesc] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = editReview
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings/${editReview.id}`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/marketplace/ratings`;

      const response = await fetch(url, {
        method: editReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          seller_id: sellerId,
          listing_id: listingId,
          transaction_id: transactionId,
          rating,
          review_title: reviewTitle || null,
          review_text: reviewText || null,
          communication_rating: communicationRating || null,
          shipping_speed_rating: shippingRating || null,
          item_as_described_rating: asDescribedRating || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (
    value: number,
    setValue: (n: number) => void,
    hovered: number,
    setHovered: (n: number) => void,
    size: 'large' | 'small' = 'large'
  ) => {
    const Container = size === 'large' ? StarRating : SubStars;
    return (
      <Container>
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            type="button"
            active={star <= value}
            hovered={star <= hovered}
            onClick={() => setValue(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            {star <= (hovered || value) ? '\u2605' : '\u2606'}
          </Star>
        ))}
      </Container>
    );
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={e => e.stopPropagation()}>
          <Content>
            <SuccessMessage>
              {editReview ? 'Review updated successfully!' : 'Thank you for your review!'}
            </SuccessMessage>
          </Content>
        </Modal>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{editReview ? 'Edit Review' : 'Write a Review'}</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Content>
          <SellerInfo>
            <SellerName>{sellerName}</SellerName>
            {listingTitle && <ListingInfo>For: {listingTitle}</ListingInfo>}
          </SellerInfo>

          <FormGroup>
            <Label>Overall Rating *</Label>
            {renderStars(rating, setRating, hoveredRating, setHoveredRating, 'large')}
          </FormGroup>

          <FormGroup>
            <Label>Review Title (optional)</Label>
            <Input
              type="text"
              placeholder="Summarize your experience"
              value={reviewTitle}
              onChange={e => setReviewTitle(e.target.value)}
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label>Your Review (optional)</Label>
            <TextArea
              placeholder="Tell others about your experience with this seller..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              maxLength={2000}
            />
          </FormGroup>

          <FormGroup>
            <Label>Detailed Ratings (optional)</Label>
            <SubRatingsContainer>
              <SubRatingRow>
                <SubRatingLabel>Communication</SubRatingLabel>
                {renderStars(communicationRating, setCommunicationRating, hoveredComm, setHoveredComm, 'small')}
              </SubRatingRow>
              <SubRatingRow>
                <SubRatingLabel>Shipping Speed</SubRatingLabel>
                {renderStars(shippingRating, setShippingRating, hoveredShip, setHoveredShip, 'small')}
              </SubRatingRow>
              <SubRatingRow>
                <SubRatingLabel>Item as Described</SubRatingLabel>
                {renderStars(asDescribedRating, setAsDescribedRating, hoveredDesc, setHoveredDesc, 'small')}
              </SubRatingRow>
            </SubRatingsContainer>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Content>

        <Footer>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? 'Submitting...' : editReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default AddReviewModal;
