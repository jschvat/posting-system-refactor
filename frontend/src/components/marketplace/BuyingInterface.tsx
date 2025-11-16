import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import marketplaceApi, { MarketplaceListing } from '../../services/marketplaceApi';
import { messagesApi } from '../../services/api/messagesApi';
import { useAuth } from '../../contexts/AuthContext';
import { MakeOfferModal } from './MakeOfferModal';
import { CheckoutModal } from './CheckoutModal';

const PriceCard = styled.div`
  background: ${props.theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  position: sticky;
  top: 20px;
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props.theme.colors.text.primary};
  margin-bottom: 20px;
`;

const OriginalPrice = styled.span`
  font-size: 18px;
  color: ${props.theme.colors.text.muted};
  text-decoration: line-through;
  margin-left: 12px;
  font-weight: 400;
`;

const Badge = styled.div<{ type?: 'auction' | 'raffle' }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  background: ${props => props.type === 'auction' ? '${props.theme.colors.info}' : props.type === 'raffle' ? '${props.theme.colors.contributor}' : '${props.theme.colors.success}'};
  color: ${props.theme.colors.white};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props.theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 12px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props.theme.colors.info};
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: ${props => props.variant === 'secondary' ? '${props.theme.colors.border}' : '${props.theme.colors.info}'};
  color: ${props => props.variant === 'secondary' ? '${props.theme.colors.text.primary}' : '${props.theme.colors.white}'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const AuctionInfo = styled.div`
  padding: 16px;
  background: ${props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;

  div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: ${props.theme.colors.text.primary};
    }

    span {
      color: ${props.theme.colors.text.secondary};
    }
  }
`;

const BidHistory = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-top: 16px;
  padding: 12px;
  background: ${props.theme.colors.hover};
  border-radius: 8px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: ${props.theme.colors.text.primary};
  }
`;

const BidItem = styled.div<{ isWinning?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: ${props => props.isWinning ? '${props.theme.colors.statusAcceptedBg}' : '${props.theme.colors.white}'};
  font-size: 13px;

  strong {
    color: ${props.theme.colors.text.primary};
  }

  span {
    color: ${props.theme.colors.text.secondary};
  }
`;

const RaffleInfo = styled.div`
  padding: 16px;
  background: ${props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 16px;

  div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: ${props.theme.colors.text.primary};
    }

    span {
      color: ${props.theme.colors.text.secondary};
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props.theme.colors.border};
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, ${props.theme.colors.contributor}, #8e44ad);
  transition: width 0.3s;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: ${props.theme.colors.statusRejectedBg};
  color: ${props.theme.colors.error};
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  padding: 12px;
  background: ${props.theme.colors.statusAcceptedBg};
  color: ${props.theme.colors.success};
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SaveButton = styled.button<{ isSaved?: boolean }>`
  width: 100%;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid ${props => props.isSaved ? '${props.theme.colors.error}' : '${props.theme.colors.border}'};
  background: ${props.theme.colors.white};
  color: ${props => props.isSaved ? '${props.theme.colors.error}' : '${props.theme.colors.text.secondary}'};
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${props.theme.colors.error};
    color: ${props.theme.colors.error};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface BuyingInterfaceProps {
  listing: MarketplaceListing;
  onUpdate: () => void;
}

export const BuyingInterface: React.FC<BuyingInterfaceProps> = ({ listing, onUpdate }) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [ticketCount, setTicketCount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [contactingseller, setContactingseller] = useState(false);

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
  };

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (listing.is_saved) {
        await marketplaceApi.unsaveListing(listing.id);
        setSuccess('Removed from saved');
      } else {
        await marketplaceApi.saveListing(listing.id);
        setSuccess('Saved to favorites');
      }
      onUpdate();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const handlePlaceBid = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid bid amount');
        return;
      }

      if (listing.auction && amount < parseFloat(listing.auction.current_bid) + parseFloat(listing.auction.bid_increment)) {
        setError(`Minimum bid is ${formatPrice(parseFloat(listing.auction.current_bid) + parseFloat(listing.auction.bid_increment))}`);
        return;
      }

      await marketplaceApi.placeBid(listing.id, amount);
      setSuccess('Bid placed successfully!');
      setBidAmount('');
      setTimeout(() => {
        onUpdate();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const count = parseInt(ticketCount);
      if (isNaN(count) || count <= 0) {
        setError('Please enter a valid ticket count');
        return;
      }

      if (listing.raffle) {
        const remaining = listing.raffle.total_tickets - listing.raffle.tickets_sold;
        if (count > remaining) {
          setError(`Only ${remaining} tickets remaining`);
          return;
        }

        if (listing.raffle.max_tickets_per_user && count > listing.raffle.max_tickets_per_user) {
          setError(`Maximum ${listing.raffle.max_tickets_per_user} tickets per user`);
          return;
        }
      }

      await marketplaceApi.buyRaffleTickets(listing.id, count);
      setSuccess(`Successfully purchased ${count} ticket${count > 1 ? 's' : ''}!`);
      setTicketCount('1');
      setTimeout(() => {
        onUpdate();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to buy tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    setShowCheckoutModal(true);
  };

  const handleContactSeller = async () => {
    if (!authState.user || !listing.user_id) {
      setError('Unable to contact seller. Please try again.');
      return;
    }

    // Prevent contacting yourself
    if (authState.user.id === listing.user_id) {
      setError('You cannot message yourself');
      return;
    }

    setContactingseller(true);
    setError('');

    try {
      // Check if a conversation already exists with this seller
      const conversationsResponse = await messagesApi.getConversations();

      if (conversationsResponse.success && conversationsResponse.data) {
        // Look for existing direct conversation with this seller
        const existingConversation = conversationsResponse.data.find(conv =>
          conv.type === 'direct' &&
          conv.other_participants?.some(p => p.id === listing.user_id)
        );

        if (existingConversation) {
          // Navigate to existing conversation
          navigate(`/messages?conversation=${existingConversation.id}`);
          return;
        }
      }

      // Create new conversation if one doesn't exist
      const createResponse = await messagesApi.createConversation({
        type: 'direct',
        participant_ids: [listing.user_id]
      });

      if (createResponse.success && createResponse.data) {
        // Navigate to the new conversation
        navigate(`/messages?conversation=${createResponse.data.id}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (err: any) {
      console.error('Error contacting seller:', err);
      setError(err.response?.data?.error?.message || 'Failed to contact seller. Please try again.');
    } finally {
      setContactingseller(false);
    }
  };

  // Regular Sale Interface
  if (listing.listing_type === 'sale') {
    return (
      <PriceCard>
        <Badge>For Sale</Badge>
        <Price>
          {formatPrice(listing.price)}
          {listing.original_price && parseFloat(listing.original_price) > parseFloat(listing.price) && (
            <OriginalPrice>{formatPrice(listing.original_price)}</OriginalPrice>
          )}
        </Price>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Button variant="primary" style={{ marginBottom: '12px' }} onClick={handleBuyNow}>
          Buy Now
        </Button>
        <Button variant="secondary" onClick={handleContactSeller} disabled={contactingseller}>
          {contactingseller ? 'Opening Chat...' : 'Contact Seller'}
        </Button>

        {listing.allow_offers && (
          <Button
            variant="secondary"
            style={{ marginTop: '12px' }}
            onClick={() => setShowOfferModal(true)}
          >
            Make an Offer
          </Button>
        )}

        <SaveButton
          isSaved={listing.is_saved}
          onClick={handleSave}
          disabled={saving}
        >
          <span>{listing.is_saved ? '❤️' : '🤍'}</span>
          <span>{listing.is_saved ? 'Saved' : 'Save'}</span>
        </SaveButton>

        {showOfferModal && (
          <MakeOfferModal
            listing={listing}
            onClose={() => setShowOfferModal(false)}
            onSuccess={() => {
              onUpdate();
              setSuccess('Offer submitted successfully!');
              setTimeout(() => setSuccess(''), 3000);
            }}
          />
        )}

        {showCheckoutModal && (
          <CheckoutModal
            listing={listing}
            onClose={() => setShowCheckoutModal(false)}
            onSuccess={() => {
              onUpdate();
              setSuccess('Purchase completed successfully!');
              setTimeout(() => setSuccess(''), 3000);
            }}
          />
        )}
      </PriceCard>
    );
  }

  // Auction Interface
  if (listing.listing_type === 'auction' && listing.auction) {
    const minBid = parseFloat(listing.auction.current_bid) + parseFloat(listing.auction.bid_increment);

    return (
      <PriceCard>
        <Badge type="auction">Auction</Badge>
        <Price>
          {formatPrice(listing.auction.current_bid)}
          <div style={{ fontSize: '14px', color: '${props.theme.colors.text.secondary}', marginTop: '8px' }}>
            Current Bid
          </div>
        </Price>

        <AuctionInfo>
          <div>
            <strong>Bids:</strong>
            <span>{listing.auction.total_bids}</span>
          </div>
          <div>
            <strong>Time Remaining:</strong>
            <span>{formatTimeRemaining(listing.auction.end_time)}</span>
          </div>
          <div>
            <strong>Minimum Bid:</strong>
            <span>{formatPrice(minBid)}</span>
          </div>
        </AuctionInfo>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Input
          type="number"
          placeholder={`Enter bid amount (min ${formatPrice(minBid)})`}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          step="0.01"
          min={minBid}
        />

        <Button variant="primary" onClick={handlePlaceBid} disabled={loading}>
          {loading ? 'Placing Bid...' : 'Place Bid'}
        </Button>

        <SaveButton
          isSaved={listing.is_saved}
          onClick={handleSave}
          disabled={saving}
        >
          <span>{listing.is_saved ? '❤️' : '🤍'}</span>
          <span>{listing.is_saved ? 'Saved' : 'Save'}</span>
        </SaveButton>

        {listing.auction.bids && listing.auction.bids.length > 0 && (
          <BidHistory>
            <h4>Bid History ({listing.auction.bids.length})</h4>
            {listing.auction.bids.slice(0, 5).map((bid, index) => (
              <BidItem key={bid.id} isWinning={index === 0}>
                <strong>{bid.username}</strong>
                <span>{formatPrice(bid.bid_amount)}</span>
              </BidItem>
            ))}
          </BidHistory>
        )}
      </PriceCard>
    );
  }

  // Raffle Interface
  if (listing.listing_type === 'raffle' && listing.raffle) {
    const soldPercentage = (listing.raffle.tickets_sold / listing.raffle.total_tickets) * 100;
    const remaining = listing.raffle.total_tickets - listing.raffle.tickets_sold;
    const ticketPrice = parseFloat(listing.raffle.ticket_price);
    const totalPrice = ticketPrice * parseInt(ticketCount || '0');

    return (
      <PriceCard>
        <Badge type="raffle">Raffle</Badge>
        <Price>
          {formatPrice(listing.raffle.ticket_price)}
          <div style={{ fontSize: '14px', color: '${props.theme.colors.text.secondary}', marginTop: '8px' }}>
            per ticket
          </div>
        </Price>

        <ProgressBar>
          <ProgressFill percentage={soldPercentage} />
        </ProgressBar>

        <RaffleInfo>
          <div>
            <strong>Tickets Sold:</strong>
            <span>{listing.raffle.tickets_sold} / {listing.raffle.total_tickets}</span>
          </div>
          <div>
            <strong>Remaining:</strong>
            <span>{remaining} tickets</span>
          </div>
          <div>
            <strong>Drawing:</strong>
            <span>{formatTimeRemaining(listing.raffle.end_time)}</span>
          </div>
          {listing.raffle.max_tickets_per_user && (
            <div>
              <strong>Max per User:</strong>
              <span>{listing.raffle.max_tickets_per_user} tickets</span>
            </div>
          )}
          {listing.raffle.user_ticket_count !== undefined && listing.raffle.user_ticket_count > 0 && (
            <div>
              <strong>Your Tickets:</strong>
              <span>{listing.raffle.user_ticket_count}</span>
            </div>
          )}
        </RaffleInfo>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Input
          type="number"
          placeholder="Number of tickets"
          value={ticketCount}
          onChange={(e) => setTicketCount(e.target.value)}
          min="1"
          max={listing.raffle.max_tickets_per_user || remaining}
        />

        <div style={{ marginBottom: '12px', textAlign: 'center', fontSize: '14px', color: '${props.theme.colors.text.secondary}' }}>
          Total: {formatPrice(totalPrice)}
        </div>

        <Button variant="primary" onClick={handleBuyTickets} disabled={loading || remaining === 0}>
          {loading ? 'Purchasing...' : remaining === 0 ? 'Sold Out' : 'Buy Tickets'}
        </Button>

        <SaveButton
          isSaved={listing.is_saved}
          onClick={handleSave}
          disabled={saving}
        >
          <span>{listing.is_saved ? '❤️' : '🤍'}</span>
          <span>{listing.is_saved ? 'Saved' : 'Save'}</span>
        </SaveButton>
      </PriceCard>
    );
  }

  return null;
};
