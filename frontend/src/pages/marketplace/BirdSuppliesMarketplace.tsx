/**
 * Bird Supplies Marketplace Page - Complete Amazon-style Experience
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import marketplaceApi from '../../services/marketplaceApi';

interface SupplyFilters {
  query: string;
  category: string;
  brand: string;
  priceRange: string;
  minRating: number;
  isWholesale: boolean;
  radius: string;
}

interface SupplyCategory {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
  description: string;
}

interface SupplyListing {
  id: number;
  title: string;
  description: string;
  price: string;
  original_price?: string;
  discount_percent?: number;
  primary_image: string;
  brand?: string;
  category_name?: string;
  seller_username: string;
  seller_rating?: string;
  seller_total_ratings?: number;
  is_wholesale?: boolean;
  is_best_seller?: boolean;
  is_top_rated?: boolean;
  distance_miles?: number;
  location_city?: string;
  location_state?: string;
  ships_in_days?: number;
  review_count?: number;
  created_at?: string;
}

type SortOption = 'featured' | 'price_low' | 'price_high' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

const Container = styled.div`
  max-width: 100%;
  padding: 20px;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #232f3e 0%, #37475a 100%);
  color: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.p`
  opacity: 0.85;
  font-size: 14px;
  margin: 0 0 16px 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: #ffd814;
  color: #0f1111;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #f7ca00;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.5);
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: rgba(255,255,255,0.1);
    border-color: white;
  }
`;

// Featured Carousel
const FeaturedSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const FeaturedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FeaturedTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  margin: 0;
`;

const SponsoredTag = styled.span`
  font-size: 9px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
`;

const CarouselContainer = styled.div`
  position: relative;
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.border};
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const CarouselCard = styled.div`
  min-width: 140px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 90px;
  object-fit: contain;
  background: #f7f7f7;
  border-radius: 4px;
`;

const CarouselTitle = styled.div`
  font-size: 12px;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CarouselPrice = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #B12704;
  margin-top: 3px;
`;

const CarouselNav = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction}: -12px;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  font-size: 18px;
  z-index: 10;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const ResultsCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
  background: ${({ theme }) => theme.colors.surface};
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const ViewBtn = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: none;
  background: ${props => props.$active ? '#232f3e' : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: ${props => props.$active ? '#232f3e' : props.theme.colors.background};
  }
`;

const MainLayout = styled.div`
  display: flex;
  gap: 24px;
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const FilterSidebarWrapper = styled.div`
  width: 240px;
  flex-shrink: 0;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const FilterCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  position: sticky;
  top: 20px;
`;

const FilterTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const FilterSection = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
`;

const CategoryFilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CategoryFilterItem = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  color: ${props => props.theme.colors.text.primary};
  border: none;
  border-left: 3px solid ${props => props.$active ? '#007185' : 'transparent'};
  font-size: 13px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#e3f2fd' : props.theme.colors.hover};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
`;

const RatingFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RatingOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;

  input {
    accent-color: #e77600;
  }
`;

const ProductGrid = styled.div<{ $viewMode: ViewMode }>`
  display: ${props => props.$viewMode === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  flex-direction: column;
  gap: 16px;
`;

const ProductCard = styled.div<{ $viewMode: ViewMode }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: ${props => props.$viewMode === 'list' ? 'flex' : 'block'};

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ProductImage = styled.div<{ $viewMode: ViewMode }>`
  width: ${props => props.$viewMode === 'list' ? '160px' : '100%'};
  height: ${props => props.$viewMode === 'list' ? '160px' : '180px'};
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
`;

const ProductImg = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
`;

const BadgeStack = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Badge = styled.span<{ $variant: 'bestseller' | 'toprated' | 'deal' | 'wholesale' }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;

  ${props => {
    switch (props.$variant) {
      case 'bestseller': return 'background: #232f3e; color: #ffd814;';
      case 'toprated': return 'background: #067d62; color: white;';
      case 'deal': return 'background: #cc0c39; color: white;';
      case 'wholesale': return 'background: #ff6b35; color: white;';
    }
  }}
`;

const ProductContent = styled.div`
  padding: 12px;
  flex: 1;
`;

const ProductTitle = styled.h3`
  font-size: 14px;
  font-weight: 400;
  margin: 0 0 6px 0;
  color: #007185;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    color: #c7511f;
  }
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
`;

const Stars = styled.span`
  color: #de7921;
  font-size: 13px;
`;

const ReviewCount = styled.span`
  color: #007185;
  font-size: 12px;
`;

const PriceRow = styled.div`
  margin-bottom: 6px;
`;

const Price = styled.span`
  font-size: 20px;
  font-weight: 400;
  color: #B12704;
`;

const OriginalPrice = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: line-through;
  margin-left: 8px;
`;

const DiscountTag = styled.span`
  color: #cc0c39;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

const DeliveryText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 6px;
`;

const FreeShipping = styled.span`
  color: #067d62;
  font-weight: 600;
`;

const SellerText = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
`;

// Pagination
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 20px;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$active ? '#232f3e' : props.theme.colors.border};
  background: ${props => props.$active ? '#232f3e' : props.theme.colors.surface};
  color: ${props => props.$active ? 'white' : props.theme.colors.text.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#232f3e' : props.theme.colors.background};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingMsg = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const renderStars = (rating: number): string => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

const getDeliveryDate = (days: number = 3): string => {
  const d = new Date();
  d.setDate(d.getDate() + days + 2);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const enrichListing = (listing: SupplyListing, i: number): SupplyListing => {
  const price = parseFloat(listing.price);
  const hasDiscount = i % 3 === 0;
  return {
    ...listing,
    original_price: hasDiscount ? (price * 1.3).toFixed(2) : undefined,
    discount_percent: hasDiscount ? 23 : undefined,
    is_best_seller: i % 5 === 0,
    is_top_rated: i % 7 === 1,
    ships_in_days: Math.floor(Math.random() * 3) + 1,
    review_count: listing.seller_total_ratings || Math.floor(Math.random() * 500) + 10,
    seller_rating: listing.seller_rating || (3.5 + Math.random() * 1.5).toFixed(1)
  };
};

const categoryIcons: Record<string, string> = {
  'cages-enclosures': '🪹',
  'food-nutrition': '🌾',
  'toys-enrichment': '🧸',
  'health-wellness': '⚕️',
  'perches-stands': '🪵',
  'bedding-liners': '🛏️',
  'feeding-supplies': '🍽️',
  'travel-carriers': '👜',
  'grooming': '✂️',
  'books-resources': '📚',
  'breeding-supplies': '🥚'
};

export const BirdSuppliesMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<SupplyFilters>({
    query: '',
    category: '',
    brand: '',
    priceRange: '',
    minRating: 0,
    isWholesale: false,
    radius: '100'
  });
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [listings, setListings] = useState<SupplyListing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<SupplyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCategories();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [filters, userLocation, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await marketplaceApi.getBirdSupplyCategories();
      if (res.success) setCategories(res.data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const [minPrice, maxPrice] = filters.priceRange ? filters.priceRange.split('-').map(Number) : [undefined, undefined];
      const res = await marketplaceApi.getBirdSupplies({
        query: filters.query || undefined,
        category: filters.category || undefined,
        brand: filters.brand || undefined,
        min_price: minPrice,
        max_price: maxPrice,
        is_wholesale: filters.isWholesale || undefined,
        user_latitude: userLocation?.lat,
        user_longitude: userLocation?.lng,
        radius: filters.radius ? parseInt(filters.radius) : undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      if (res.success) {
        let items = res.data.map((l: SupplyListing, i: number) => enrichListing(l, i));

        // Client-side filter by rating
        if (filters.minRating > 0) {
          items = items.filter(item => parseFloat(item.seller_rating || '0') >= filters.minRating);
        }

        items = sortListings(items, sortBy);
        setListings(items);

        if (res.pagination) {
          setTotalPages(res.pagination.pages);
        }

        // Set featured (first 8)
        if (currentPage === 1) {
          setFeaturedListings(items.slice(0, 8));
        }
      }
    } catch (e) {
      console.error('Error fetching listings:', e);
    } finally {
      setLoading(false);
    }
  };

  const sortListings = (items: SupplyListing[], sort: SortOption) => {
    const sorted = [...items];
    switch (sort) {
      case 'price_low': return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price_high': return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'rating': return sorted.sort((a, b) => parseFloat(b.seller_rating || '0') - parseFloat(a.seller_rating || '0'));
      case 'newest': return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      default: return sorted;
    }
  };

  const handleFilterChange = (key: keyof SupplyFilters, value: string | boolean | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <PaginationContainer>
        <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          ‹ Previous
        </PageButton>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0 8px' }}>...</span>
          ) : (
            <PageButton
              key={page}
              $active={currentPage === page}
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </PageButton>
          )
        )}
        <PageButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next ›
        </PageButton>
      </PaginationContainer>
    );
  };

  return (
    <Container>
      <HeroSection>
        <Title>Bird Supplies Shop</Title>
        <Subtitle>Everything your feathered friends need — food, toys, cages, health products & more</Subtitle>
        <ButtonRow>
          <PrimaryButton onClick={() => navigate('/marketplace/birds/supplies/create')}>
            + Sell Your Products
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/marketplace/birds')}>
            ← Back to Birds
          </SecondaryButton>
        </ButtonRow>
      </HeroSection>

      <MainLayout>
        <ContentArea>
          {/* Featured Carousel */}
          {currentPage === 1 && featuredListings.length > 0 && (
            <FeaturedSection>
              <FeaturedHeader>
                <FeaturedTitle>Featured Products</FeaturedTitle>
                <SponsoredTag>Sponsored</SponsoredTag>
              </FeaturedHeader>
              <CarouselContainer>
                <CarouselNav $direction="left" onClick={() => scrollCarousel('left')}>‹</CarouselNav>
                <CarouselTrack ref={carouselRef}>
                  {featuredListings.map(listing => (
                    <CarouselCard key={listing.id} onClick={() => navigate(`/marketplace/supplies/${listing.id}`)}>
                      <CarouselImage src={listing.primary_image} alt={listing.title} />
                      <CarouselTitle>{listing.title}</CarouselTitle>
                      <Stars>{renderStars(parseFloat(listing.seller_rating || '4'))}</Stars>
                      <CarouselPrice>${parseFloat(listing.price).toFixed(2)}</CarouselPrice>
                    </CarouselCard>
                  ))}
                </CarouselTrack>
                <CarouselNav $direction="right" onClick={() => scrollCarousel('right')}>›</CarouselNav>
              </CarouselContainer>
            </FeaturedSection>
          )}

          <ControlsBar>
            <ResultsCount>{loading ? 'Loading...' : `${listings.length} results`}</ResultsCount>
            <ControlsRight>
              <SortSelect value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
                <option value="featured">Sort by: Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
                <option value="newest">Newest Arrivals</option>
              </SortSelect>
              <ViewToggle>
                <ViewBtn $active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>Grid</ViewBtn>
                <ViewBtn $active={viewMode === 'list'} onClick={() => setViewMode('list')}>List</ViewBtn>
              </ViewToggle>
            </ControlsRight>
          </ControlsBar>

          {loading ? (
            <LoadingMsg>Loading products...</LoadingMsg>
          ) : listings.length === 0 ? (
            <EmptyMsg>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </EmptyMsg>
          ) : (
            <>
              <ProductGrid $viewMode={viewMode}>
                {listings.map(listing => {
                  const rating = parseFloat(listing.seller_rating || '4');
                  return (
                    <ProductCard
                      key={listing.id}
                      $viewMode={viewMode}
                      onClick={() => navigate(`/marketplace/supplies/${listing.id}`)}
                    >
                      <ProductImage $viewMode={viewMode}>
                        {listing.primary_image ? (
                          <ProductImg src={listing.primary_image} alt={listing.title} />
                        ) : (
                          <span style={{ color: '#999' }}>No Image</span>
                        )}
                        <BadgeStack>
                          {listing.is_best_seller && <Badge $variant="bestseller">Best Seller</Badge>}
                          {listing.is_top_rated && <Badge $variant="toprated">Top Rated</Badge>}
                          {listing.discount_percent && <Badge $variant="deal">-{listing.discount_percent}%</Badge>}
                          {listing.is_wholesale && <Badge $variant="wholesale">Wholesale</Badge>}
                        </BadgeStack>
                      </ProductImage>
                      <ProductContent>
                        <ProductTitle>{listing.title}</ProductTitle>
                        <StarRating>
                          <Stars>{renderStars(rating)}</Stars>
                          <ReviewCount>{listing.review_count?.toLocaleString()}</ReviewCount>
                        </StarRating>
                        <PriceRow>
                          <Price>${parseFloat(listing.price).toFixed(2)}</Price>
                          {listing.original_price && (
                            <>
                              <OriginalPrice>${listing.original_price}</OriginalPrice>
                              <DiscountTag>Save {listing.discount_percent}%</DiscountTag>
                            </>
                          )}
                        </PriceRow>
                        <DeliveryText>
                          <FreeShipping>FREE Delivery</FreeShipping> {getDeliveryDate(listing.ships_in_days)}
                        </DeliveryText>
                        <SellerText>
                          by {listing.seller_username}
                        </SellerText>
                      </ProductContent>
                    </ProductCard>
                  );
                })}
              </ProductGrid>
              {renderPagination()}
            </>
          )}
        </ContentArea>

        <FilterSidebarWrapper>
          <FilterCard>
            <FilterTitle>Filters</FilterTitle>
            <FilterSection>
              <FilterLabel>Category</FilterLabel>
              <CategoryFilterList>
                <CategoryFilterItem $active={!filters.category} onClick={() => handleFilterChange('category', '')}>
                  All Products
                </CategoryFilterItem>
                {categories.map(cat => (
                  <CategoryFilterItem
                    key={cat.id}
                    $active={filters.category === cat.slug}
                    onClick={() => handleFilterChange('category', cat.slug)}
                  >
                    {categoryIcons[cat.slug] || '📦'} {cat.name}
                  </CategoryFilterItem>
                ))}
              </CategoryFilterList>
            </FilterSection>
            <FilterSection>
              <FilterLabel>Search</FilterLabel>
              <Input
                placeholder="Search products..."
                value={filters.query}
                onChange={e => handleFilterChange('query', e.target.value)}
              />
            </FilterSection>
            <FilterSection>
              <FilterLabel>Brand</FilterLabel>
              <Input
                placeholder="e.g., Kaytee"
                value={filters.brand}
                onChange={e => handleFilterChange('brand', e.target.value)}
              />
            </FilterSection>
            <FilterSection>
              <FilterLabel>Customer Reviews</FilterLabel>
              <RatingFilter>
                <RatingOption>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === 4}
                    onChange={() => handleFilterChange('minRating', 4)}
                  />
                  <Stars>★★★★☆</Stars> & Up
                </RatingOption>
                <RatingOption>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === 3}
                    onChange={() => handleFilterChange('minRating', 3)}
                  />
                  <Stars>★★★☆☆</Stars> & Up
                </RatingOption>
                <RatingOption>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === 0}
                    onChange={() => handleFilterChange('minRating', 0)}
                  />
                  All Ratings
                </RatingOption>
              </RatingFilter>
            </FilterSection>
            <FilterSection>
              <FilterLabel>Price</FilterLabel>
              <Select value={filters.priceRange} onChange={e => handleFilterChange('priceRange', e.target.value)}>
                <option value="">Any Price</option>
                <option value="0-25">Under $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-250">$100 - $250</option>
                <option value="250-999999">$250+</option>
              </Select>
            </FilterSection>
            <FilterSection>
              <FilterLabel>Distance</FilterLabel>
              <Select
                value={filters.radius}
                onChange={e => handleFilterChange('radius', e.target.value)}
                disabled={!userLocation}
              >
                <option value="">Any</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </Select>
            </FilterSection>
            <FilterSection>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={filters.isWholesale}
                  onChange={e => handleFilterChange('isWholesale', e.target.checked)}
                />
                Wholesale only
              </Checkbox>
            </FilterSection>
          </FilterCard>
        </FilterSidebarWrapper>
      </MainLayout>
    </Container>
  );
};

export default BirdSuppliesMarketplace;
