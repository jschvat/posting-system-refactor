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
  color: ${props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props.theme.colors.text.secondary};
  margin: 0;
`;

const TabsContainer = styled.div`
  border-bottom: 2px solid ${props.theme.colors.border};
  margin-bottom: 24px;
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '${props.theme.colors.info}' : 'transparent'};
  color: ${props => props.active ? '${props.theme.colors.info}' : '${props.theme.colors.text.secondary}'};
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: ${props.theme.colors.info};
    background: ${props.theme.colors.hover};
  }
`;

const OffersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OfferCard = styled.div`
  background: ${props.theme.colors.white};
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
  background: ${props.theme.colors.border};
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
  color: ${props.theme.colors.text.primary};
  margin: 0 0 8px 0;
  cursor: pointer;

  &:hover {
    color: ${props.theme.colors.info};
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
  color: ${props.theme.colors.info};
`;

const ListingPrice = styled.div`
  font-size: 16px;
  color: ${props.theme.colors.text.secondary};
  text-decoration: line-through;
`;

const SavingsTag = styled.div`
  padding: 4px 12px;
  background: ${props.theme.colors.statusAcceptedBg};
  color: ${props.theme.colors.success};
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props.theme.colors.text.secondary};
  font-size: 14px;
`;

const TimeInfo = styled.div`
  color: ${props.theme.colors.text.muted};
  font-size: 13px;
`;

const Message = styled.div`
  padding: 12px;
  background: ${props.theme.colors.hover};
  border-radius: 6px;
  margin: 12px 0;
  font-size: 14px;
  color: ${props.theme.colors.text.primary};
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
      case 'pending': return '${props.theme.colors.statusPendingBg}';
      case 'accepted': return '${props.theme.colors.statusAcceptedBg}';
      case 'rejected': return '${props.theme.colors.statusRejectedBg}';
      case 'countered': return '${props.theme.colors.statusInfoBg}';
      case 'expired': return '${props.theme.colors.borderLight}';
      case 'withdrawn': return '${props.theme.colors.borderLight}';
      default: return '${props.theme.colors.hover}';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '${props.theme.colors.statusPending}';
      case 'accepted': return '${props.theme.colors.success}';
      case 'rejected': return '${props.theme.colors.errorDark}';
      case 'countered': return '${props.theme.colors.info}';
      case 'expired': return '${props.theme.colors.text.secondary}';
      case 'withdrawn': return '${props.theme.colors.text.secondary}';
      default: return '${props.theme.colors.text.primary}';
    }
  }};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'accept' | 'reject' | 'withdraw' | 'secondary' }>`
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
          background: ${props.theme.colors.success};
          color: ${props.theme.colors.white};
          &:hover { background: ${props => props.theme.colors.success}; }
        `;
      case 'reject':
        return `
          background: ${props.theme.colors.error};
          color: ${props.theme.colors.white};
          &:hover { background: ${props.theme.colors.errorDark}; }
        `;
      case 'withdraw':
        return `
          background: ${props.theme.colors.text.muted};
          color: ${props.theme.colors.white};
          &:hover { background: ${props.theme.colors.text.secondary}; }
        `;
      default:
        return `
          background: ${props.theme.colors.border};
          color: ${props.theme.colors.text.primary};
          &:hover { background: ${props => props.theme.colors.border}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: ${props.theme.colors.white};
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
  color: ${props.theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${props.theme.colors.text.secondary};
  margin: 0 0 24px 0;
`;

const BrowseButton = styled.button`
  padding: 12px 32px;
  background: ${props.theme.colors.info};
  color: ${props.theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props.theme.colors.infoDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: ${props.theme.colors.text.secondary};
`;

const CounterOfferSection = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: ${props.theme.colors.statusInfoBg};
  border-radius: 8px;
  border-left: 4px solid ${props.theme.colors.info};
`;

const CounterTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const CounterPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props.theme.colors.info};
  margin-bottom: 8px;
`;

const CounterMessage = styled.div`
  font-size: 14px;
  color: ${props.theme.colors.text.secondary};
  font-style: italic;
  margin-top: 8px;
`;

interface Offer {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_price: string;
  listing_image: string;
  seller_id: number;
  seller_username: string;
  offer_amount: string;
  message: string;
  counter_amount: string;
  counter_message: string;
  status: string;
  created_at: string;
  responded_at: string;
}

export const SentOffers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
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

      const response = await marketplaceApi.getSentOffers(params);
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (offerId: number) => {
    if (!window.confirm('Are you sure you want to withdraw this offer?')) {
      return;
    }

    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.withdrawOffer(offerId);
      if (response.success) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error withdrawing offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptCounter = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.acceptCounterOffer(offerId);
      if (response.success) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error accepting counter offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCounter = async (offerId: number) => {
    setActionLoading(offerId);
    try {
      const response = await marketplaceApi.rejectCounterOffer(offerId);
      if (response.success) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error rejecting counter offer:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: string) => `$${parseFloat(price).toFixed(2)}`;

  const calculateSavings = (offerAmount: string, listingPrice: string) => {
    const savings = parseFloat(listingPrice) - parseFloat(offerAmount);
    return `Save ${formatPrice(savings.toString())}`;
  };

  const getFilteredOffers = () => {
    if (activeTab === 'all') return offers;
    return offers.filter(o => o.status === activeTab);
  };

  const filteredOffers = getFilteredOffers();

  if (loading && offers.length === 0) {
    return (
      <Container>
        <LoadingState>Loading your offers...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Sent Offers</Title>
        <Subtitle>Track offers you've made on listings</Subtitle>
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
        <Tab active={activeTab === 'withdrawn'} onClick={() => setActiveTab('withdrawn')}>
          Withdrawn
        </Tab>
      </TabsContainer>

      {filteredOffers.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📤</EmptyIcon>
          <EmptyTitle>No offers sent yet</EmptyTitle>
          <EmptyText>
            Browse the marketplace and make offers on items you're interested in
          </EmptyText>
          <BrowseButton onClick={() => navigate('/marketplace')}>
            Browse Marketplace
          </BrowseButton>
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
                    <SavingsTag>
                      {calculateSavings(offer.offer_amount, offer.listing_price)}
                    </SavingsTag>
                    <StatusBadge status={offer.status}>{offer.status}</StatusBadge>
                  </OfferInfo>
                  <SellerInfo>
                    <span>👤 {offer.seller_username}</span>
                    <span>•</span>
                    <TimeInfo>{formatTimeAgo(offer.created_at)}</TimeInfo>
                  </SellerInfo>
                  {offer.message && <Message>"{offer.message}"</Message>}

                  {offer.status === 'pending' && (
                    <Actions>
                      <Button
                        variant="withdraw"
                        onClick={() => handleWithdraw(offer.id)}
                        disabled={actionLoading === offer.id}
                      >
                        Withdraw Offer
                      </Button>
                    </Actions>
                  )}

                  {offer.status === 'countered' && offer.counter_amount && (
                    <CounterOfferSection>
                      <CounterTitle>🔄 Seller's Counter Offer</CounterTitle>
                      <CounterPrice>{formatPrice(offer.counter_amount)}</CounterPrice>
                      {offer.counter_message && (
                        <CounterMessage>"{offer.counter_message}"</CounterMessage>
                      )}
                      <Actions>
                        <Button
                          variant="accept"
                          onClick={() => handleAcceptCounter(offer.id)}
                          disabled={actionLoading === offer.id}
                        >
                          ✓ Accept Counter
                        </Button>
                        <Button
                          variant="reject"
                          onClick={() => handleRejectCounter(offer.id)}
                          disabled={actionLoading === offer.id}
                        >
                          ✗ Decline Counter
                        </Button>
                      </Actions>
                    </CounterOfferSection>
                  )}

                  {offer.status === 'accepted' && (
                    <Actions>
                      <Button onClick={() => navigate(`/marketplace/${offer.listing_id}`)}>
                        View Listing
                      </Button>
                    </Actions>
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

export default SentOffers;
