import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import marketplaceApi, { MarketplaceListing, MarketplaceCategory } from '../../services/marketplaceApi';
import { FilterSidebar, FilterState } from '../../components/marketplace/FilterSidebar';
import { SearchBar } from '../../components/marketplace/browse/SearchBar';
import { ListingGrid } from '../../components/marketplace/browse/ListingGrid';
import { useDebounce } from '../../hooks/useDebounce';

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;

  @media (min-width: 1920px) {
    max-width: 1800px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
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

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
  order: 1;
`;

const FilterSidebarWrapper = styled.div`
  width: 280px;
  order: 2;

  @media (max-width: 1200px) {
    display: none;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.info};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.infoDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;


const FilterButton = styled.button<{ active?: boolean }>`
  padding: 14px 24px;
  background: ${props => props.active ? props.theme.colors.info : props.theme.colors.white};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text.primary};
  border: 2px solid ${props => props.active ? props.theme.colors.info : props.theme.colors.border};
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? props.theme.colors.infoDark : props.theme.colors.hover};
    border-color: ${props => props.active ? props.theme.colors.infoDark : props.theme.colors.info};
  }
`;

const FiltersPanel = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'block' : 'none'};
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Select = styled.select`
  padding: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.info};
  }
`;

const Input = styled.input`
  padding: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.info};
  }
`;

const CategoryTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const CategoryTag = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.active ? props.theme.colors.info : props.theme.colors.white};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text.primary};
  border: 2px solid ${props => props.active ? props.theme.colors.info : props.theme.colors.border};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? props.theme.colors.infoDark : props.theme.colors.hover};
    border-color: ${props => props.active ? props.theme.colors.infoDark : props.theme.colors.info};
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultsCount = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SortSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.info};
  }
`;


const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 40px 0;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 10px 16px;
  background: ${props => props.active ? props.theme.colors.info : props.theme.colors.white};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.text.primary};
  border: 2px solid ${props => props.active ? props.theme.colors.info : props.theme.colors.border};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active ? props.theme.colors.infoDark : props.theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.info};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MarketplaceBrowse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'relevant'
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    hasMore: false
  });

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadListings();
  }, [debouncedSearchQuery, selectedCategory, filters, page]);

  const loadCategories = async () => {
    try {
      const response = await marketplaceApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      // Build params from filters (using debounced search query)
      const params: any = {
        query: debouncedSearchQuery || undefined,
        category_id: selectedCategory,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.distance,
        page,
        limit: 20
      };

      // Handle condition array
      if (filters.condition && filters.condition.length > 0) {
        params.condition = filters.condition[0]; // API expects single condition for now
      }

      // Handle listing type array
      if (filters.listingType && filters.listingType.length > 0) {
        params.listing_type = filters.listingType[0]; // API expects single type for now
      }

      // Handle sort
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_low':
            params.sort_by = 'price';
            params.sort_order = 'ASC';
            break;
          case 'price_high':
            params.sort_by = 'price';
            params.sort_order = 'DESC';
            break;
          case 'date_new':
            params.sort_by = 'created_at';
            params.sort_order = 'DESC';
            break;
          case 'distance':
            if (filters.latitude && filters.longitude) {
              params.sort_by = 'distance';
              params.sort_order = 'ASC';
            }
            break;
          default:
            params.sort_by = 'created_at';
            params.sort_order = 'DESC';
        }
      } else {
        params.sort_by = 'created_at';
        params.sort_order = 'DESC';
      }

      const response = await marketplaceApi.getListings(params);

      if (response.success) {
        setListings(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadListings();
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId);
    setPage(1);
  };

  const handleSaveListing = async (id: number) => {
    try {
      const listing = listings.find(l => l.id === id);
      if (listing?.is_saved) {
        await marketplaceApi.unsaveListing(id);
      } else {
        await marketplaceApi.saveListing(id);
      }
      // Reload listings to update saved state
      loadListings();
    } catch (error) {
      console.error('Error saving/unsaving listing:', error);
    }
  };

  const handleListingClick = (id: number) => {
    navigate(`/marketplace/${id}`);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Container>
      <Header>
        <Title>Marketplace</Title>
        <CreateButton onClick={() => navigate('/marketplace/create')}>
          + Create Listing
        </CreateButton>
      </Header>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={loadListings}
      />

      {categories.length > 0 && (
        <CategoryTags>
          <CategoryTag
            active={!selectedCategory}
            onClick={() => handleCategoryClick(0)}
          >
            All Categories
          </CategoryTag>
          {categories.slice(0, 8).map((cat) => (
            <CategoryTag
              key={cat.id}
              active={selectedCategory === cat.id}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.name}
            </CategoryTag>
          ))}
        </CategoryTags>
      )}

      <MainLayout>
        <ContentArea>

          <ResultsHeader>
            <ResultsCount>
              {pagination.total} {pagination.total === 1 ? 'item' : 'items'} found
            </ResultsCount>
          </ResultsHeader>

          <ListingGrid
            listings={listings}
            loading={loading}
            onListingClick={handleListingClick}
            onSaveListing={handleSaveListing}
          />

          {!loading && pagination.pages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </PageButton>

              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PageButton
                    key={pageNum}
                    active={page === pageNum}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}

              <PageButton
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </ContentArea>

        <FilterSidebarWrapper>
          <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
        </FilterSidebarWrapper>
      </MainLayout>
    </Container>
  );
};
