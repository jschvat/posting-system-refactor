import React from 'react';
import styled from 'styled-components';
import * as FaIcons from 'react-icons/fa';

// Extract icons from FaIcons
const FaPlus = (FaIcons as any).FaPlus;
const FaTrash = (FaIcons as any).FaTrash;
const FaStar = (FaIcons as any).FaStar;
const FaRegStar = (FaIcons as any).FaRegStar;
const FaCreditCard = (FaIcons as any).FaCreditCard;
const FaUniversity = (FaIcons as any).FaUniversity;

// PaymentMethod interface
interface PaymentMethod {
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

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  selectedId: number | null;
  showAddNew: boolean;
  onSelect: (methodId: number) => void;
  onSetDefault: (methodId: number) => void;
  onDelete: (methodId: number) => void;
  onAddNew: () => void;
}

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

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  paymentMethods,
  selectedId,
  showAddNew,
  onSelect,
  onSetDefault,
  onDelete,
  onAddNew
}) => {
  if (paymentMethods.length === 0) {
    return (
      <EmptyState>
        <FaCreditCard size={48} />
        <EmptyText>No payment methods added yet</EmptyText>
        {showAddNew && (
          <AddButton onClick={onAddNew}>
            <FaPlus /> Add Your First Payment Method
          </AddButton>
        )}
      </EmptyState>
    );
  }

  return (
    <MethodsList>
      {paymentMethods.map((method) => (
        <MethodCard
          key={method.id}
          selected={selectedId === method.id}
          expired={isExpired(method.exp_month, method.exp_year)}
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
      ))}
    </MethodsList>
  );
};

// Styled Components

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #999;

  svg {
    margin-bottom: 1rem;
    opacity: 0.3;
  }
`;

const EmptyText = styled.p`
  margin: 1rem 0 1.5rem;
  font-size: 1.1rem;
`;

const MethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }

  svg {
    font-size: 0.8rem;
  }
`;

const MethodCard = styled.div<{ selected: boolean; expired: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#007bff' : props.expired ? '#dc3545' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.selected ? '#f0f8ff' : props.expired ? '#fff5f5' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.expired ? 0.7 : 1};

  &:hover {
    border-color: ${props => props.expired ? '#dc3545' : '#007bff'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MethodIcon = styled.div`
  font-size: 1.5rem;
  color: #007bff;
  margin-right: 1rem;
`;

const MethodDetails = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: capitalize;
`;

const DefaultBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: #28a745;
  color: white;
  border-radius: 12px;
  font-weight: normal;
`;

const ExpiredBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: #dc3545;
  color: white;
  border-radius: 12px;
  font-weight: normal;
`;

const MethodInfo = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
`;

const MethodActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.danger ? '#dc3545' : '#666'};
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? '#fff5f5' : '#f8f9fa'};
    color: ${props => props.danger ? '#bd2130' : '#333'};
  }
`;

const DefaultStar = styled.div`
  color: #ffc107;
  padding: 0.5rem;
  font-size: 1rem;
`;
