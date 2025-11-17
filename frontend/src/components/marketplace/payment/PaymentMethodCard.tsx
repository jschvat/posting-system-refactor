import React from 'react';
import styled from 'styled-components';
import * as FaIcons from 'react-icons/fa';

// Extract icons from FaIcons
const FaTrash = (FaIcons as any).FaTrash;
const FaStar = (FaIcons as any).FaStar;
const FaRegStar = (FaIcons as any).FaRegStar;
const FaCreditCard = (FaIcons as any).FaCreditCard;
const FaUniversity = (FaIcons as any).FaUniversity;

// Interfaces
export interface PaymentMethod {
  id: number;
  payment_type: string;
  provider: string;
  display_name: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (methodId: number) => void;
  onSetDefault: (methodId: number) => void;
  onDelete: (methodId: number) => void;
}

// Helper Functions
const getCardIcon = (brand?: string) => {
  switch (brand?.toLowerCase()) {
    case 'visa':
    case 'mastercard':
    case 'amex':
    case 'discover':
      return <FaCreditCard />;
    case 'paypal':
      return <FaCreditCard />;
    case 'bank':
      return <FaUniversity />;
    default:
      return <FaCreditCard />;
  }
};

const isExpired = (expMonth?: number, expYear?: number) => {
  if (!expMonth || !expYear) return false;
  const now = new Date();
  const expDate = new Date(expYear, expMonth - 1);
  return expDate < now;
};

// Component
export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  onSelect,
  onSetDefault,
  onDelete,
}) => {
  const expired = isExpired(method.exp_month, method.exp_year);

  return (
    <MethodCard
      selected={selected}
      expired={expired}
      onClick={() => onSelect(method.id)}
    >
      <MethodIcon>{getCardIcon(method.brand)}</MethodIcon>

      <MethodDetails>
        <MethodName>
          {method.display_name}
          {method.is_default && <DefaultBadge>Default</DefaultBadge>}
          {isExpired(method.exp_month, method.exp_year) && (
            <ExpiredBadge>Expired</ExpiredBadge>
          )}
        </MethodName>
        {method.exp_month && method.exp_year && (
          <MethodInfo>
            Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
          </MethodInfo>
        )}
      </MethodDetails>

      <MethodActions onClick={(e) => e.stopPropagation()}>
        {!method.is_default && (
          <ActionButton
            onClick={() => onSetDefault(method.id)}
            title="Set as default"
          >
            <FaRegStar />
          </ActionButton>
        )}
        {method.is_default && (
          <DefaultStar title="Default payment method">
            <FaStar />
          </DefaultStar>
        )}
        <ActionButton
          onClick={() => onDelete(method.id)}
          title="Delete"
          danger
        >
          <FaTrash />
        </ActionButton>
      </MethodActions>
    </MethodCard>
  );
};

// Styled Components
const MethodCard = styled.div<{ selected: boolean; expired: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.expired ? props.theme.colors.error : props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.selected ? props.theme.colors.infoLight : props.expired ? props.theme.colors.errorLight : props.theme.colors.white};
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.expired ? 0.7 : 1};

  &:hover {
    border-color: ${props => props.expired ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MethodIcon = styled.div`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 1rem;
`;

const MethodDetails = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: capitalize;
`;

const DefaultBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  font-weight: normal;
`;

const ExpiredBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  font-weight: normal;
`;

const MethodInfo = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

const MethodActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.danger ? props.theme.colors.error : props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? props.theme.colors.errorLight : props.theme.colors.hover};
    color: ${props => props.danger ? props.theme.colors.errorDark : props.theme.colors.text.primary};
  }
`;

const DefaultStar = styled.div`
  color: ${({ theme }) => theme.colors.warning};
  padding: 0.5rem;
  font-size: 1rem;
`;
