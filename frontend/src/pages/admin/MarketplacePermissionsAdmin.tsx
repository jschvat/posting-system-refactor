/**
 * Admin UI for managing marketplace permissions
 * Allows admins to view, grant, and revoke marketplace access for users
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { FaSearch, FaUserPlus, FaTimes, FaStore, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import {
  getAllPermissions,
  getMarketplaceTypes,
  searchUsers,
  grantPermission,
  revokePermission,
  MarketplaceType,
  UserWithPermission,
  SearchUser
} from '../../services/marketplacePermissionsApi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ControlsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const PermissionsTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 100px;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 100px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Email = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MarketplaceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
`;

const DateCell = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RevokeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.error}10;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  border-radius: 6px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const UserSearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const UserSearchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const SelectedUser = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  margin-top: 8px;
`;

const MarketplaceCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;

  @media (max-width: 768px) {
    display: inline;
  }
`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MarketplacePermissionsAdmin: React.FC = () => {
  const { state } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Grant modal state
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check if user is admin
  const isAdmin = state.user?.id === 1;

  // Fetch all permissions
  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ['admin-permissions', page, searchQuery, marketplaceFilter],
    queryFn: () => getAllPermissions({
      page,
      limit: 20,
      search: searchQuery || undefined,
      marketplace: marketplaceFilter || undefined
    }),
    enabled: isAdmin
  });

  // Fetch marketplace types
  const { data: marketplaceTypes } = useQuery({
    queryKey: ['marketplace-types'],
    queryFn: getMarketplaceTypes,
    enabled: isAdmin
  });

  // Grant permission mutation
  const grantMutation = useMutation({
    mutationFn: async (params: { userId: number; marketplaceSlug: string }) => {
      await grantPermission({
        user_id: params.userId,
        marketplace_slug: params.marketplaceSlug
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
    }
  });

  // Revoke permission mutation
  const revokeMutation = useMutation({
    mutationFn: async (params: { userId: number; marketplaceSlug: string }) => {
      await revokePermission({
        user_id: params.userId,
        marketplace_slug: params.marketplaceSlug
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      showSuccess('Permission revoked successfully');
    },
    onError: () => {
      showError('Failed to revoke permission');
    }
  });

  // Search users debounce
  useEffect(() => {
    if (!userSearch || userSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(userSearch, 10);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleGrantPermissions = async () => {
    if (!selectedUser || selectedMarketplaces.length === 0) return;

    try {
      for (const slug of selectedMarketplaces) {
        await grantMutation.mutateAsync({
          userId: selectedUser.id,
          marketplaceSlug: slug
        });
      }
      showSuccess(`Permissions granted to ${selectedUser.username}`);
      setShowGrantModal(false);
      setSelectedUser(null);
      setSelectedMarketplaces([]);
      setUserSearch('');
    } catch (error) {
      showError('Failed to grant permissions');
    }
  };

  const handleRevoke = useCallback(async (permission: UserWithPermission) => {
    if (!window.confirm(`Revoke ${permission.marketplace_name} access from ${permission.username}?`)) {
      return;
    }

    revokeMutation.mutate({
      userId: permission.user_id,
      marketplaceSlug: permission.marketplace_slug
    });
  }, [revokeMutation]);

  if (!isAdmin) {
    return (
      <PageContainer>
        <EmptyState>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  const permissions = permissionsData?.permissions || [];
  const pagination = permissionsData?.pagination;
  const restrictedMarketplaces = marketplaceTypes?.filter(m => m.requires_permission) || [];

  return (
    <PageContainer>
      <Header>
        <Title>
          <FaStore />
          Marketplace Permissions
        </Title>
      </Header>

      <ControlsRow>
        <SearchBox>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </SearchBox>

        <FilterSelect
          value={marketplaceFilter}
          onChange={(e) => {
            setMarketplaceFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Marketplaces</option>
          {restrictedMarketplaces.map(m => (
            <option key={m.slug} value={m.slug}>
              {m.icon} {m.name}
            </option>
          ))}
        </FilterSelect>

        <AddButton onClick={() => setShowGrantModal(true)}>
          <FaUserPlus />
          Grant Permission
        </AddButton>
      </ControlsRow>

      <PermissionsTable>
        <TableHeader>
          <span>User</span>
          <span>Marketplace</span>
          <span>Granted</span>
          <span>Granted By</span>
          <span>Actions</span>
        </TableHeader>

        {loadingPermissions ? (
          <LoadingState>
            <FaSpinner className="spin" />
            Loading permissions...
          </LoadingState>
        ) : permissions.length === 0 ? (
          <EmptyState>
            <p>No permissions found</p>
            {searchQuery && <p>Try adjusting your search</p>}
          </EmptyState>
        ) : (
          permissions.map((permission) => (
            <TableRow key={permission.permission_id}>
              <UserCell>
                {permission.avatar_url ? (
                  <Avatar src={permission.avatar_url} alt={permission.username} />
                ) : (
                  <AvatarPlaceholder>
                    {permission.username.charAt(0).toUpperCase()}
                  </AvatarPlaceholder>
                )}
                <UserInfo>
                  <Username>{permission.display_name || permission.username}</Username>
                  <Email>@{permission.username}</Email>
                </UserInfo>
              </UserCell>

              <div>
                <MobileLabel>Marketplace: </MobileLabel>
                <MarketplaceBadge>
                  {permission.marketplace_icon} {permission.marketplace_name}
                </MarketplaceBadge>
              </div>

              <DateCell>
                <MobileLabel>Granted: </MobileLabel>
                {formatDate(permission.granted_at)}
              </DateCell>

              <DateCell>
                <MobileLabel>By: </MobileLabel>
                {permission.granted_by_username || 'System'}
              </DateCell>

              <div>
                <RevokeButton
                  onClick={() => handleRevoke(permission)}
                  disabled={revokeMutation.isPending}
                >
                  <FaTimes />
                  Revoke
                </RevokeButton>
              </div>
            </TableRow>
          ))
        )}
      </PermissionsTable>

      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </PageButton>

          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <PageButton
                key={pageNum}
                $active={page === pageNum}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </PageButton>
            );
          })}

          <PageButton
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      )}

      {/* Grant Permission Modal */}
      {showGrantModal && (
        <ModalOverlay onClick={() => setShowGrantModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Grant Marketplace Permission</ModalTitle>
              <CloseButton onClick={() => setShowGrantModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Search User</Label>
              <SearchBox style={{ maxWidth: '100%' }}>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search by username or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);
                  }}
                />
                {searchResults.length > 0 && !selectedUser && (
                  <UserSearchResults>
                    {searchResults.map(user => (
                      <UserSearchItem
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchResults([]);
                        }}
                      >
                        {user.avatar_url ? (
                          <Avatar src={user.avatar_url} alt={user.username} />
                        ) : (
                          <AvatarPlaceholder>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarPlaceholder>
                        )}
                        <UserInfo>
                          <Username>{user.display_name || user.username}</Username>
                          <Email>@{user.username}</Email>
                        </UserInfo>
                      </UserSearchItem>
                    ))}
                  </UserSearchResults>
                )}
              </SearchBox>

              {selectedUser && (
                <SelectedUser>
                  {selectedUser.avatar_url ? (
                    <Avatar src={selectedUser.avatar_url} alt={selectedUser.username} />
                  ) : (
                    <AvatarPlaceholder>
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </AvatarPlaceholder>
                  )}
                  <UserInfo>
                    <Username>{selectedUser.display_name || selectedUser.username}</Username>
                    <Email>@{selectedUser.username}</Email>
                  </UserInfo>
                  <FaCheck color="green" />
                </SelectedUser>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Select Marketplaces</Label>
              {restrictedMarketplaces.map(marketplace => (
                <MarketplaceCheckbox key={marketplace.slug}>
                  <input
                    type="checkbox"
                    checked={selectedMarketplaces.includes(marketplace.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMarketplaces([...selectedMarketplaces, marketplace.slug]);
                      } else {
                        setSelectedMarketplaces(selectedMarketplaces.filter(s => s !== marketplace.slug));
                      }
                    }}
                  />
                  <span>{marketplace.icon} {marketplace.name}</span>
                </MarketplaceCheckbox>
              ))}
            </FormGroup>

            <SubmitButton
              onClick={handleGrantPermissions}
              disabled={!selectedUser || selectedMarketplaces.length === 0 || grantMutation.isPending}
            >
              {grantMutation.isPending ? (
                <>
                  <FaSpinner className="spin" />
                  Granting...
                </>
              ) : (
                <>
                  <FaCheck />
                  Grant Permissions
                </>
              )}
            </SubmitButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default MarketplacePermissionsAdmin;
