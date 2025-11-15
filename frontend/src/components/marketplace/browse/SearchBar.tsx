import React from 'react';
import styled from 'styled-components';

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch?: () => void;
}

const SearchBarContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;

  svg, span {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #95a5a6;
    font-size: 18px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
  }
`;

const SearchIcon = () => <span>🔍</span>;

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearch
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <SearchBarContainer>
      <SearchWrapper>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </SearchWrapper>
    </SearchBarContainer>
  );
};
