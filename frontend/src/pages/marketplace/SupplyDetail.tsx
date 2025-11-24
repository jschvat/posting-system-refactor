/**
 * Bird Supply Product Detail Page - Amazon Style
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import marketplaceApi from '../../services/marketplaceApi';

interface Review {
  id: number;
  rating: number;
  review_title: string;
  review_text: string;
  buyer_username: string;
  buyer_first_name: string;
  buyer_avatar: string;
  created_at: string;
  listing_title?: string;
  is_verified_purchase: boolean;
}

interface SupplyProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  brand?: string;
  category_name?: string;
  category_slug?: string;
  primary_image: string;
  seller_username: string;
  seller_first_name: string;
  seller_avatar?: string;
  seller_rating?: string;
  seller_total_ratings?: number;
  location_city?: string;
  location_state?: string;
  is_wholesale?: boolean;
  minimum_order_quantity?: number;
  warranty_months?: number;
  images?: Array<{ file_url: string; is_primary: boolean }>;
  user_id?: number;
}

const Container = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #007185;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;

  &:hover {
    color: #c7511f;
    text-decoration: underline;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 480px 1fr 300px;
  gap: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 300px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Image Section
const ImageSection = styled.div``;

const MainImageContainer = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MainImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
`;

const Thumbnail = styled.img<{ $active: boolean }>`
  width: 100%;
  height: 60px;
  object-fit: contain;
  background: #f7f7f7;
  border: 2px solid ${props => props.$active ? '#e77600' : props.theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    border-color: #e77600;
  }
`;

// Product Info
const ProductInfo = styled.div``;

const Badge = styled.span<{ $type: 'bestseller' | 'choice' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 8px;
  margin-right: 8px;

  ${props => props.$type === 'bestseller' && 'background: #232f3e; color: #ffd814;'}
  ${props => props.$type === 'choice' && 'background: #067d62; color: white;'}
`;

const ProductTitle = styled.h1`
  font-size: 24px;
  font-weight: 400;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const BrandLink = styled.a`
  color: #007185;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    color: #c7511f;
    text-decoration: underline;
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Stars = styled.span`
  color: #de7921;
  font-size: 16px;
  letter-spacing: 2px;
`;

const RatingText = styled.span`
  color: #007185;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #c7511f;
  }
`;

const PriceSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
`;

const PriceLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Price = styled.span`
  font-size: 28px;
  color: #B12704;
  font-weight: 400;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: line-through;
`;

const SaveAmount = styled.span`
  font-size: 14px;
  color: #cc0c39;
  font-weight: 600;
`;

const PrimeText = styled.div`
  color: #007185;
  font-size: 14px;
  margin-top: 8px;
`;

const FreeReturns = styled.div`
  color: #067d62;
  font-size: 14px;
  font-weight: 600;
`;

const DetailsList = styled.div`
  margin: 16px 0;
`;

const DetailItem = styled.div`
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  min-width: 140px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AboutSection = styled.div`
  margin: 24px 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Buy Box
const BuyBox = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 20px;
`;

const BuyBoxPrice = styled.div`
  font-size: 28px;
  color: #B12704;
  margin-bottom: 8px;
`;

const DeliveryInfo = styled.div`
  font-size: 14px;
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DeliveryDate = styled.div`
  color: #067d62;
  font-weight: 600;
  margin-bottom: 4px;
`;

const LocationText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 8px;
`;

const StockStatus = styled.div<{ $inStock: boolean }>`
  color: ${props => props.$inStock ? '#067d62' : '#cc0c39'};
  font-size: 18px;
  font-weight: 600;
  margin: 12px 0;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
`;

const QuantityLabel = styled.span`
  font-size: 14px;
`;

const QuantitySelect = styled.select`
  padding: 8px 24px 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;
`;

const AddToCartButton = styled.button`
  width: 100%;
  background: #ffd814;
  border: 1px solid #fcd200;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    background: #f7ca00;
  }
`;

const BuyNowButton = styled.button`
  width: 100%;
  background: #ffa41c;
  border: 1px solid #ff8f00;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #fa8900;
  }
`;

const SecureTransaction = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
  margin-top: 12px;
`;

const SellerInfo = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 16px;
  font-size: 14px;
`;

const SellerRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SellerLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SellerLink = styled.a`
  color: #007185;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #c7511f;
    text-decoration: underline;
  }
`;

// Reviews Section
const ReviewsSection = styled.div`
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReviewsHeader = styled.div`
  margin-bottom: 24px;
`;

const ReviewsSummary = styled.div`
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
`;

const RatingSummary = styled.div``;

const AverageRating = styled.div`
  font-size: 48px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RatingBars = styled.div`
  flex: 1;
`;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const BarLabel = styled.span`
  width: 60px;
  color: #007185;
`;

const Bar = styled.div`
  flex: 1;
  height: 20px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: #ffa41c;
`;

const BarPercent = styled.span`
  width: 40px;
  text-align: right;
  color: #007185;
`;

const ReviewsList = styled.div``;

const ReviewCard = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const ReviewerAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #232f3e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const ReviewStars = styled.div`
  color: #de7921;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ReviewTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ReviewMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 8px;
`;

const VerifiedBadge = styled.span`
  color: #067d62;
  font-weight: 600;
  margin-left: 8px;
`;

const ReviewText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// Related Products Section
const RelatedSection = styled.div`
  margin-top: 48px;
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const RelatedCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ theme }) => theme.colors.surface};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RelatedImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: contain;
  background: #f7f7f7;
  border-radius: 4px;
  margin-bottom: 12px;
`;

const RelatedTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RelatedPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #B12704;
  margin-bottom: 4px;
`;

const RelatedRating = styled.div`
  color: #de7921;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const renderStars = (rating: number) => '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

const getRatingDistribution = (reviews: Review[]) => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => dist[r.rating as keyof typeof dist]++);
  const total = reviews.length || 1;
  return Object.entries(dist).reverse().map(([star, count]) => ({
    star: parseInt(star),
    count,
    percent: Math.round((count / total) * 100)
  }));
};

export const SupplyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<SupplyProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    // TODO: Implement actual cart storage (localStorage or API)
    console.log(`Adding ${quantity}x of product ${product?.id} to cart`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    // TODO: Navigate to checkout with this item
    console.log(`Buying now: ${quantity}x of product ${product?.id}`);
    alert('Buy Now functionality coming soon!');
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Fetch product details
      const res = await marketplaceApi.getBirdSupplyListing(parseInt(id!));
      if (res.success) {
        setProduct(res.data);

        // Fetch reviews for the seller
        if (res.data.user_id) {
          const reviewsRes = await marketplaceApi.getSellerRatings(res.data.user_id, { limit: 20 });
          if (reviewsRes.success && reviewsRes.data) {
            setReviews(reviewsRes.data.ratings || []);
          }
        }

        // Fetch related products in same category
        if (res.data.category_slug) {
          const relatedRes = await marketplaceApi.getBirdSupplies({
            category: res.data.category_slug,
            limit: 6
          });
          if (relatedRes.success && relatedRes.data) {
            // Exclude current product
            setRelatedProducts(relatedRes.data.filter((p: any) => p.id !== parseInt(id!)));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching product:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingMsg>Loading product...</LoadingMsg>;
  }

  if (!product) {
    return <LoadingMsg>Product not found</LoadingMsg>;
  }

  const images = product.images || (product.primary_image ? [{ file_url: product.primary_image, is_primary: true }] : []);
  const avgRating = product.seller_rating ? parseFloat(product.seller_rating) : 0;
  const ratingDist = getRatingDistribution(reviews);

  return (
    <Container>
      <BackButton onClick={() => navigate('/marketplace/birds/supplies')}>
        ← Back to results
      </BackButton>

      <MainLayout>
        {/* Image Section */}
        <ImageSection>
          <MainImageContainer>
            {images.length > 0 ? (
              <MainImage src={images[currentImageIndex]?.file_url} alt={product.title} />
            ) : (
              <div>No image available</div>
            )}
          </MainImageContainer>
          {images.length > 1 && (
            <ThumbnailGrid>
              {images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  src={img.file_url}
                  $active={idx === currentImageIndex}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </ThumbnailGrid>
          )}
        </ImageSection>

        {/* Product Info */}
        <ProductInfo>
          {product.brand && <BrandLink>Visit the {product.brand} Store</BrandLink>}

          <ProductTitle>{product.title}</ProductTitle>

          <RatingSection>
            <Stars>{renderStars(avgRating)}</Stars>
            <RatingText>{avgRating.toFixed(1)} out of 5</RatingText>
            <RatingText>{product.seller_total_ratings || 0} ratings</RatingText>
          </RatingSection>

          <PriceSection>
            <PriceRow>
              <PriceLabel>Price:</PriceLabel>
              <Price>${parseFloat(product.price).toFixed(2)}</Price>
            </PriceRow>
            <PrimeText>FREE delivery on orders over $35</PrimeText>
            <FreeReturns>FREE Returns</FreeReturns>
          </PriceSection>

          <AboutSection>
            <SectionTitle>About this item</SectionTitle>
            <Description>{product.description}</Description>
          </AboutSection>

          <DetailsList>
            {product.brand && (
              <DetailItem>
                <DetailLabel>Brand</DetailLabel>
                <DetailValue>{product.brand}</DetailValue>
              </DetailItem>
            )}
            {product.category_name && (
              <DetailItem>
                <DetailLabel>Category</DetailLabel>
                <DetailValue>{product.category_name}</DetailValue>
              </DetailItem>
            )}
            {product.warranty_months && (
              <DetailItem>
                <DetailLabel>Warranty</DetailLabel>
                <DetailValue>{product.warranty_months} months</DetailValue>
              </DetailItem>
            )}
            {product.is_wholesale && (
              <DetailItem>
                <DetailLabel>Minimum Order</DetailLabel>
                <DetailValue>{product.minimum_order_quantity} units</DetailValue>
              </DetailItem>
            )}
          </DetailsList>
        </ProductInfo>

        {/* Buy Box */}
        <BuyBox>
          <BuyBoxPrice>${parseFloat(product.price).toFixed(2)}</BuyBoxPrice>

          <DeliveryInfo>
            <DeliveryDate>FREE delivery Wednesday, Nov 27</DeliveryDate>
            <div>Order within 5 hrs 23 mins</div>
            <LocationText>
              📍 Delivering to {product.location_city}, {product.location_state}
            </LocationText>
          </DeliveryInfo>

          <StockStatus $inStock={true}>In Stock</StockStatus>

          <QuantitySelector>
            <QuantityLabel>Qty:</QuantityLabel>
            <QuantitySelect value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </QuantitySelect>
          </QuantitySelector>

          <AddToCartButton onClick={handleAddToCart}>
            {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
          </AddToCartButton>
          <BuyNowButton onClick={handleBuyNow}>Buy Now</BuyNowButton>

          <SecureTransaction>🔒 Secure transaction</SecureTransaction>

          <SellerInfo>
            <SellerRow>
              <SellerLabel>Ships from</SellerLabel>
              <span>{product.seller_username}</span>
            </SellerRow>
            <SellerRow>
              <SellerLabel>Sold by</SellerLabel>
              <SellerLink>{product.seller_username}</SellerLink>
            </SellerRow>
            <SellerRow>
              <SellerLabel>Returns</SellerLabel>
              <SellerLink>30-day return policy</SellerLink>
            </SellerRow>
          </SellerInfo>
        </BuyBox>
      </MainLayout>

      {/* Reviews Section */}
      <ReviewsSection>
        <ReviewsHeader>
          <SectionTitle>Customer reviews</SectionTitle>
        </ReviewsHeader>

        <ReviewsSummary>
          <RatingSummary>
            <AverageRating>{avgRating.toFixed(1)}</AverageRating>
            <Stars>{renderStars(avgRating)}</Stars>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {product.seller_total_ratings || 0} global ratings
            </div>
          </RatingSummary>

          <RatingBars>
            {ratingDist.map(({ star, count, percent }) => (
              <RatingBar key={star}>
                <BarLabel>{star} star</BarLabel>
                <Bar>
                  <BarFill $percent={percent} />
                </Bar>
                <BarPercent>{percent}%</BarPercent>
              </RatingBar>
            ))}
          </RatingBars>
        </ReviewsSummary>

        <ReviewsList>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No reviews yet
            </div>
          ) : (
            reviews.map(review => (
              <ReviewCard key={review.id}>
                <ReviewHeader>
                  <ReviewerAvatar>
                    {review.buyer_first_name?.[0]?.toUpperCase() || 'U'}
                  </ReviewerAvatar>
                  <ReviewerName>{review.buyer_first_name || review.buyer_username}</ReviewerName>
                </ReviewHeader>
                <ReviewStars>{renderStars(review.rating)}</ReviewStars>
                <ReviewTitle>{review.review_title}</ReviewTitle>
                <ReviewMeta>
                  Reviewed on {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {review.is_verified_purchase && (
                    <VerifiedBadge>✓ Verified Purchase</VerifiedBadge>
                  )}
                </ReviewMeta>
                <ReviewText>{review.review_text}</ReviewText>
              </ReviewCard>
            ))
          )}
        </ReviewsList>
      </ReviewsSection>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <RelatedSection>
          <SectionTitle>Customers who bought this also bought</SectionTitle>
          <RelatedGrid>
            {relatedProducts.slice(0, 5).map(item => (
              <RelatedCard key={item.id} onClick={() => navigate(`/marketplace/supplies/${item.id}`)}>
                <RelatedImage src={item.primary_image || '/placeholder.png'} alt={item.title} />
                <RelatedTitle>{item.title}</RelatedTitle>
                <RelatedRating>
                  {renderStars(parseFloat(item.seller_rating || '0'))}
                  <span>({item.seller_total_ratings || 0})</span>
                </RelatedRating>
                <RelatedPrice>${parseFloat(item.price).toFixed(2)}</RelatedPrice>
              </RelatedCard>
            ))}
          </RelatedGrid>
        </RelatedSection>
      )}
    </Container>
  );
};

export default SupplyDetail;
