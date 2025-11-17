import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../services/marketplaceApi';
import { formatTimeAgo } from '../../utils/dateTime';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TabsContainer = styled.div`
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.info : 'transparent'};
  color: ${props => props.active ? props.theme.colors.info : props.theme.colors.text.secondary};
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.info};
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const OffersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OfferCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OfferHeader = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const ListingImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const ListingImagePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const OfferContent = styled.div`
  flex: 1;
`;

const ListingTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.info};
  }
`;

const OfferInfo = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 12px;
`;

const PriceCompare = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const OfferPrice = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warning};
`;

const ListingPrice = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: line-through;
`;

const BuyerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const TimeInfo = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
`;

const Message = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.hover};
  border-radius: 6px;
  margin: 12px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-style: italic;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'pending': return ${({ theme }) => theme.colors.statusPendingBg};
      case 'accepted': return ${({ theme }) => theme.colors.statusAcceptedBg};
      case 'rejected': return ${({ theme }) => theme.colors.statusRejectedBg};
      case 'countered': return ${({ theme }) => theme.colors.statusInfoBg};
      case 'expired': return ${({ theme }) => theme.colors.borderLight};
      default: return ${({ theme }) => theme.colors.hover};
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return ${({ theme }) => theme.colors.statusPending};
      case 'accepted': return ${({ theme }) => theme.colors.success};
      case 'rejected': return ${({ theme }) => theme.colors.errorDark};
      case 'countered': return ${({ theme }) => theme.colors.info};
      case 'expired': return ${({ theme }) => theme.colors.text.secondary};
      default: return ${({ theme }) => theme.colors.text.primary};
    }
  }};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'accept' | 'reject' | 'counter' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => {
    switch (props.variant) {
      case 'accept':
        return `
          background: ${({ theme }) => theme.colors.success};
          color: ${({ theme }) => theme.colors.white};
          &:hover { background: ${props => props.theme.colors.success}; }
        `;
      case 'reject':
        return `
          background: ${({ theme }) => theme.colors.error};
          color: ${({ theme }) => theme.colors.white};
          &:hover { background: ${({ theme }) => theme.colors.errorDark}; }
        `;
      case 'counter':
        return `
          background: ${({ theme }) => theme.colors.info};
          color: ${({ theme }) => theme.colors.white};
          &:hover { background: ${({ theme }) => theme.colors.infoDark}; }
        `;
      default:
        return `
          background: ${({ theme }) => theme.colors.border};
          color: ${({ theme }) => theme.colors.text.primary};
          &:hover { background: ${props => props.theme.colors.border}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CounterOfferInput = styled.input`
  padding: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  width: 150px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.info};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface Offer {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_price: string;
  listing_image: string;
  buyer_id: number;
  buyer_username: string;
  offer_amount: string;
  message: string;
  counter_amount: string;
  counter_message: string;
  status: string;
  created_at: string;
  responded_at: string;
}

export const ReceivedOffers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [counterAmount, setCounterAmount] = useState<{ [key: number]: string }>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadOffers();
  }, [activeTab]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await marketplaceApi.getReceivedOffers(params);
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.acceptOffer(offerId);
      if (response.success) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.rejectOffer(offerId);
      if (response.success) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCounter = async (offerId: number) => {
    const amount = counterAmount[offerId];
    if (!amount) return;

    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.counterOffer(offerId, parseFloat(amount));
      if (response.success) {
        setCounterAmount({ ...counterAmount, [offerId]: '' });
        loadOffers();
      }
    } catch (error) {
      console.error('Error countering offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: string) => `$${parseFloat(price).toFixed(2)}`;

  const getFilteredOffers = () => {
    if (activeTab === 'all') return offers;
    return offers.filter(o => o.status === activeTab);
  };

  const filteredOffers = getFilteredOffers();

  if (loading && offers.length === 0) {
    return (
      <Container>
        <LoadingState>Loading offers...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Received Offers</Title>
        <Subtitle>Manage offers from buyers on your listings</Subtitle>
      </Header>

      <TabsContainer>
        <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All ({offers.length})
        </Tab>
        <Tab active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
          Pending
        </Tab>
        <Tab active={activeTab === 'accepted'} onClick={() => setActiveTab('accepted')}>
          Accepted
        </Tab>
        <Tab active={activeTab === 'countered'} onClick={() => setActiveTab('countered')}>
          Countered
        </Tab>
        <Tab active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
          Rejected
        </Tab>
      </TabsContainer>

      {filteredOffers.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📬</EmptyIcon>
          <EmptyTitle>No offers yet</EmptyTitle>
          <EmptyText>
            When buyers make offers on your listings, they'll appear here
          </EmptyText>
        </EmptyState>
      ) : (
        <OffersList>
          {filteredOffers.map(offer => (
            <OfferCard key={offer.id}>
              <OfferHeader>
                {offer.listing_image ? (
                  <ListingImage src={offer.listing_image} alt={offer.listing_title} />
                ) : (
                  <ListingImagePlaceholder>📦</ListingImagePlaceholder>
                )}
                <OfferContent>
                  <ListingTitle onClick={() => navigate(`/marketplace/${offer.listing_id}`)}>
                    {offer.listing_title}
                  </ListingTitle>
                  <OfferInfo>
                    <PriceCompare>
                      <OfferPrice>{formatPrice(offer.offer_amount)}</OfferPrice>
                      <ListingPrice>{formatPrice(offer.listing_price)}</ListingPrice>
                    </PriceCompare>
                    <StatusBadge status={offer.status}>{offer.status}</StatusBadge>
                  </OfferInfo>
                  <BuyerInfo>
                    <span>👤 {offer.buyer_username}</span>
                    <span>•</span>
                    <TimeInfo>{formatTimeAgo(offer.created_at)}</TimeInfo>
                  </BuyerInfo>
                  {offer.message && <Message>"{offer.message}"</Message>}

                  {offer.status === 'pending' && (
                    <Actions>
                      <Button
                        variant="accept"
                        onClick={() => handleAccept(offer.id)}
                        disabled={actionLoading === offer.id}
                      >
                        ✓ Accept
                      </Button>
                      <CounterOfferInput
                        type="number"
                        step="0.01"
                        placeholder="Counter amount"
                        value={counterAmount[offer.id] || ''}
                        onChange={(e) => setCounterAmount({ ...counterAmount, [offer.id]: e.target.value })}
                      />
                      <Button
                        variant="counter"
                        onClick={() => handleCounter(offer.id)}
                        disabled={actionLoading === offer.id || !counterAmount[offer.id]}
                      >
                        ↔ Counter
                      </Button>
                      <Button
                        variant="reject"
                        onClick={() => handleReject(offer.id)}
                        disabled={actionLoading === offer.id}
                      >
                        ✗ Reject
                      </Button>
                    </Actions>
                  )}

                  {offer.status === 'countered' && offer.counter_amount && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>Your counter offer: {formatPrice(offer.counter_amount)}</strong>
                      {offer.counter_message && <Message>"{offer.counter_message}"</Message>}
                    </div>
                  )}
                </OfferContent>
              </OfferHeader>
            </OfferCard>
          ))}
        </OffersList>
      )}
    </Container>
  );
};

export default ReceivedOffers;
