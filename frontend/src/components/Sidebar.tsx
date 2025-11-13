/**
 * Sidebar component - left navigation panel
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Styled components
const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.text.primary
  };
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.primary}15` : 'transparent'
  };
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '400'};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? `${theme.colors.primary}15` : theme.colors.background
    };
    text-decoration: none;
  }
`;

const IconPlaceholder = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const DropdownTrigger = styled.div<{ $isActive?: boolean; $isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.text.primary
  };
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.primary}15` : 'transparent'
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '400'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? `${theme.colors.primary}15` : theme.colors.background
    };
  }
`;

const DropdownContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
`;

const ChevronIcon = styled.span<{ $isOpen?: boolean }>`
  font-size: 0.8rem;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s;
`;

const SubNavList = styled.ul<{ $isOpen?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding-left: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const SubNavLink = styled(Link)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.text.secondary
  };
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.primary}10` : 'transparent'
  };
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ $isActive }) => $isActive ? '600' : '400'};
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? `${theme.colors.primary}10` : theme.colors.background
    };
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuickStats = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  font-size: 0.9rem;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

/**
 * Sidebar Component
 */
const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  // Mock user data
  const mockUser = {
    id: 1,
    username: 'demouser'
  };

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isMarketplaceActive = isActive('/marketplace');

  const toggleMarketplace = () => {
    setIsMarketplaceOpen(!isMarketplaceOpen);
  };

  return (
    <SidebarContent>
      {/* Main Navigation */}
      <Section>
        <SectionTitle>Navigation</SectionTitle>
        <NavList>
          <NavItem>
            <NavLink to="/" $isActive={isActive('/')}>
              <IconPlaceholder>🏠</IconPlaceholder>
              Home Feed
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/create" $isActive={isActive('/create')}>
              <IconPlaceholder>✏️</IconPlaceholder>
              Create Post
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/messages" $isActive={isActive('/messages')}>
              <IconPlaceholder>💬</IconPlaceholder>
              Messages
            </NavLink>
          </NavItem>

          {/* Marketplace Dropdown */}
          <NavItem>
            <DropdownTrigger
              onClick={toggleMarketplace}
              $isActive={isMarketplaceActive}
              $isOpen={isMarketplaceOpen}
            >
              <DropdownContent>
                <IconPlaceholder>🛍️</IconPlaceholder>
                Marketplace
              </DropdownContent>
              <ChevronIcon $isOpen={isMarketplaceOpen}>▶</ChevronIcon>
            </DropdownTrigger>

            <SubNavList $isOpen={isMarketplaceOpen}>
              <li>
                <SubNavLink to="/marketplace" $isActive={location.pathname === '/marketplace'}>
                  Browse Marketplace
                </SubNavLink>
              </li>
              <li>
                <SubNavLink to="/marketplace/create" $isActive={isActive('/marketplace/create')}>
                  Create Listing
                </SubNavLink>
              </li>
              <li>
                <SubNavLink to="/marketplace/my-listings" $isActive={isActive('/marketplace/my-listings')}>
                  My Listings
                </SubNavLink>
              </li>
              <li>
                <SubNavLink to="/marketplace/saved" $isActive={isActive('/marketplace/saved')}>
                  Saved Listings
                </SubNavLink>
              </li>
              <li>
                <SubNavLink to="/marketplace/offers/received" $isActive={isActive('/marketplace/offers/received')}>
                  <IconPlaceholder style={{ width: '16px', height: '16px', fontSize: '1rem' }}>📥</IconPlaceholder>
                  Received Offers
                </SubNavLink>
              </li>
              <li>
                <SubNavLink to="/marketplace/offers/sent" $isActive={isActive('/marketplace/offers/sent')}>
                  <IconPlaceholder style={{ width: '16px', height: '16px', fontSize: '1rem' }}>📤</IconPlaceholder>
                  Sent Offers
                </SubNavLink>
              </li>
            </SubNavList>
          </NavItem>

          <NavItem>
            <NavLink
              to={`/user/${mockUser.id}`}
              $isActive={isActive(`/user/${mockUser.id}`)}
            >
              <IconPlaceholder>👤</IconPlaceholder>
              My Profile
            </NavLink>
          </NavItem>
        </NavList>
      </Section>

      {/* Quick Stats */}
      <Section>
        <SectionTitle>Quick Stats</SectionTitle>
        <QuickStats>
          <StatItem>
            <StatLabel>Total Posts</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Comments</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Reactions</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
        </QuickStats>
      </Section>

      {/* Popular Emojis */}
      <Section>
        <SectionTitle>Popular Reactions</SectionTitle>
        <QuickStats>
          <StatItem>
            <StatLabel>👍 Like</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>❤️ Love</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>😂 Laugh</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>🔥 Fire</StatLabel>
            <StatValue>-</StatValue>
          </StatItem>
        </QuickStats>
      </Section>

      {/* Footer Info */}
      <Section style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#8a8d91' }}>
        <p>
          Built with React, TypeScript, and Node.js
        </p>
      </Section>
    </SidebarContent>
  );
};

export default Sidebar;