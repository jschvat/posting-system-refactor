import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import marketplaceApi, { MarketplaceListing } from '../../services/marketplaceApi';

// Styled Components with Bird Theme
const Container = styled.div`
  max-width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>') no-repeat top center;
    background-size: cover;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px 40px;
  color: white;

  @media (max-width: 768px) {
    padding: 40px 15px 30px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  margin: 0 0 16px 0;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 32px 0;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const FeatureBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
`;

const FeatureBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const MainLayout = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const FilterSidebarWrapper = styled.div`
  width: 300px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;

  @media (max-width: 1200px) {
    width: 100%;
    position: static;
  }
`;

const FilterTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid white;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #999;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px;
  padding: 0 4px;
`;

const ResultsCount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const SortSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    background: white;
    border-color: white;
  }
`;

const ListingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BirdCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
`;

const BirdImage = styled.div<{ src?: string }>`
  width: 100%;
  height: 240px;
  background: ${props => props.src
    ? `url(${props.src}) center/cover`
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  position: relative;
`;

const BirdBadge = styled.div<{ type?: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch(props.type) {
      case 'hand-fed': return '#10b981';
      case 'rare': return '#f59e0b';
      case 'proven': return '#8b5cf6';
      default: return '#6366f1';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const BirdInfo = styled.div`
  padding: 20px;
`;

const BirdTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`;

const BirdDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
  font-size: 13px;
`;

const BirdDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }
`;

const BirdPrice = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #667eea;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const BirdLocation = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
  color: white;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin-top: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

interface BirdFilters {
  species: string;
  sex: string;
  age: string;
  colorMutation: string;
  temperament: string;
  handFed: boolean;
  dnaSexed: boolean;
  healthCertified: boolean;
  priceRange: string;
  location: string;
}

export const BirdBreederMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState<BirdFilters>({
    species: '',
    sex: '',
    age: '',
    colorMutation: '',
    temperament: '',
    handFed: false,
    dnaSexed: false,
    healthCertified: false,
    priceRange: '',
    location: ''
  });

  useEffect(() => {
    fetchListings();
  }, [filters, sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // TODO: Call API with bird-specific filters
      // For now, fetch all listings and filter client-side
      const response = await marketplaceApi.getListings({
        category: 'birds', // Assuming there's a birds category
        sort: sortBy,
        search: searchQuery
      });
      // API returns { success: true, data: [...] }
      setListings(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch bird listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (listingId: number) => {
    navigate(`/marketplace/listing/${listingId}`);
  };

  const handleFilterChange = (key: keyof BirdFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Container>
      <ContentWrapper>
        <HeroSection>
          <HeroTitle>Breeder's Nest</HeroTitle>
          <HeroSubtitle>
            Premium Avian Marketplace - Connect with Certified Breeders
          </HeroSubtitle>

          <FeatureBadges>
            <FeatureBadge>✓ Health Certified</FeatureBadge>
            <FeatureBadge>✓ DNA Sexed Available</FeatureBadge>
            <FeatureBadge>✓ Hand-Fed Birds</FeatureBadge>
            <FeatureBadge>✓ Verified Breeders</FeatureBadge>
          </FeatureBadges>

          <SearchBar
            type="text"
            placeholder="Search for species, color mutations, or breeder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchListings()}
          />
        </HeroSection>

        <MainLayout>
          <FilterSidebarWrapper>
            <FilterTitle>🔍 Find Your Bird</FilterTitle>

            <FilterSection>
              <FilterLabel>Species</FilterLabel>
              <Select
                value={filters.species}
                onChange={(e) => handleFilterChange('species', e.target.value)}
              >
                <option value="">All Species</option>
                <option value="budgerigar">Budgerigar / Parakeet</option>
                <option value="english-budgie">English Budgie</option>
                <option value="cockatiel">Cockatiel</option>
                <option value="lovebird">Lovebird</option>
                <option value="conure">Conure</option>
                <option value="african-grey">African Grey</option>
                <option value="cockatoo">Cockatoo</option>
                <option value="macaw">Macaw</option>
                <option value="finch">Finch</option>
                <option value="canary">Canary</option>
              </Select>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Sex</FilterLabel>
              <Select
                value={filters.sex}
                onChange={(e) => handleFilterChange('sex', e.target.value)}
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="pair">Breeding Pair</option>
                <option value="unknown">Unknown</option>
              </Select>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Age</FilterLabel>
              <Select
                value={filters.age}
                onChange={(e) => handleFilterChange('age', e.target.value)}
              >
                <option value="">Any Age</option>
                <option value="baby">Baby (0-6 months)</option>
                <option value="young">Young (6-12 months)</option>
                <option value="adult">Adult (1-5 years)</option>
                <option value="mature">Mature (5+ years)</option>
              </Select>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Color / Mutation</FilterLabel>
              <Select
                value={filters.colorMutation}
                onChange={(e) => handleFilterChange('colorMutation', e.target.value)}
              >
                <option value="">All Colors</option>
                <option value="lutino">Lutino</option>
                <option value="albino">Albino</option>
                <option value="pied">Pied</option>
                <option value="blue">Blue</option>
                <option value="pearl">Pearl</option>
                <option value="cinnamon">Cinnamon</option>
                <option value="normal">Normal / Wild Type</option>
              </Select>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Special Features</FilterLabel>
              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    checked={filters.handFed}
                    onChange={(e) => handleFilterChange('handFed', e.target.checked)}
                  />
                  Hand-Fed
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox
                    checked={filters.dnaSexed}
                    onChange={(e) => handleFilterChange('dnaSexed', e.target.checked)}
                  />
                  DNA Sexed
                </CheckboxLabel>
                <CheckboxLabel>
                  <Checkbox
                    checked={filters.healthCertified}
                    onChange={(e) => handleFilterChange('healthCertified', e.target.checked)}
                  />
                  Health Certified
                </CheckboxLabel>
              </CheckboxGroup>
            </FilterSection>

            <FilterSection>
              <FilterLabel>Price Range</FilterLabel>
              <Select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="">Any Price</option>
                <option value="0-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-250">$100 - $250</option>
                <option value="250-500">$250 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000+">$1,000+</option>
              </Select>
            </FilterSection>
          </FilterSidebarWrapper>

          <ContentArea>
            <ResultsHeader>
              <ResultsCount>
                {listings.length} {listings.length === 1 ? 'Bird' : 'Birds'} Available
              </ResultsCount>
              <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="age-young">Age: Youngest First</option>
                <option value="distance">Distance: Nearest</option>
              </SortSelect>
            </ResultsHeader>

            {loading ? (
              <LoadingMessage>Finding beautiful birds for you...</LoadingMessage>
            ) : listings.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🐦</EmptyIcon>
                <EmptyTitle>No Birds Found</EmptyTitle>
                <EmptyText>
                  Try adjusting your filters or check back later for new listings
                </EmptyText>
              </EmptyState>
            ) : (
              <ListingGrid>
                {listings.map((listing) => (
                  <BirdCard key={listing.id} onClick={() => handleCardClick(listing.id)}>
                    <BirdImage src={listing.images?.[0]?.file_url}>
                      <BirdBadge type="hand-fed">Hand-Fed</BirdBadge>
                    </BirdImage>
                    <BirdInfo>
                      <BirdTitle>{listing.title}</BirdTitle>
                      <BirdDetails>
                        <BirdDetail>
                          <span>🎨</span> <strong>Blue Pied</strong>
                        </BirdDetail>
                        <BirdDetail>
                          <span>⚥</span> <strong>Male</strong>
                        </BirdDetail>
                        <BirdDetail>
                          <span>📅</span> <strong>6 months</strong>
                        </BirdDetail>
                        <BirdDetail>
                          <span>✓</span> <strong>DNA Sexed</strong>
                        </BirdDetail>
                      </BirdDetails>
                      <BirdPrice>${parseFloat(listing.price || '0').toFixed(2)}</BirdPrice>
                      <BirdLocation>
                        📍 {listing.location_city}, {listing.location_state}
                      </BirdLocation>
                    </BirdInfo>
                  </BirdCard>
                ))}
              </ListingGrid>
            )}
          </ContentArea>
        </MainLayout>
      </ContentWrapper>
    </Container>
  );
};

export default BirdBreederMarketplace;
