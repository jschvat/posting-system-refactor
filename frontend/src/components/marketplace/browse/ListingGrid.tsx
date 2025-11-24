import React from 'react';
import styled from 'styled-components';
import { MarketplaceListing } from '../../../services/marketplaceApi';
import { ListingCard } from '../ListingCard';

export interface ListingGridProps {
  listings: MarketplaceListing[];
  loading: boolean;
  onListingClick: (id: number) => void;
  onSaveListing?: (id: number) => void;
  onViewReviews?: (sellerId: number, sellerName: string) => void;
}

const GridContainer = styled.div`
  margin-bottom: 40px;
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (min-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 2200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 18px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};

  h3 {
    font-size: 24px;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  loading,
  onListingClick,
  onSaveListing,
  onViewReviews
}) => {
  if (loading) {
    return <LoadingMessage>Loading listings...</LoadingMessage>;
  }

  if (listings.length === 0) {
    return (
      <EmptyState>
        <h3>No items found</h3>
        <p>Try adjusting your search or filters</p>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      <ListingsGrid>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSave={onSaveListing || (() => {})}
            onClick={onListingClick}
            onViewReviews={onViewReviews}
          />
        ))}
      </ListingsGrid>
    </GridContainer>
  );
};
