import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as FaIcons from 'react-icons/fa';
import marketplaceApi from '../../services/marketplaceApi';
import { useToast } from '../Toast';
import { AddPaymentMethodForm } from './payment/AddPaymentMethodForm';
import { PaymentMethodList } from './payment/PaymentMethodList';

// Extract icons from FaIcons
const FaPlus = (FaIcons as any).FaPlus;

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

interface PaymentMethodSelectorProps {
  selectedId?: number | null;
  onSelect: (methodId: number | null) => void;
  showAddNew?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedId,
  onSelect,
  showAddNew = true
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await marketplaceApi.getPaymentMethods();
      if (response.success && response.data) {
        const methods = Array.isArray(response.data) ? response.data : [];
        setPaymentMethods(methods);
        // Auto-select default if no method selected
        if (!selectedId && methods.length > 0) {
          const defaultMethod = methods.find((m: PaymentMethod) => m.is_default);
          if (defaultMethod) {
            onSelect(defaultMethod.id);
          }
        }
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      showError('Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (cardData: any) => {
    // Validation
    if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      showError('Please enter a valid 16-digit card number');
      return;
    }

    if (!cardData.expMonth || !cardData.expYear) {
      showError('Please enter expiration date');
      return;
    }

    if (cardData.cvc.length !== 3 && cardData.cvc.length !== 4) {
      showError('Please enter a valid CVC');
      return;
    }

    try {
      setAddingMethod(true);
      const response = await marketplaceApi.addPaymentMethod({
        type: 'card',
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        expMonth: parseInt(cardData.expMonth),
        expYear: parseInt(cardData.expYear),
        cvc: cardData.cvc,
        holderName: cardData.holderName,
        isDefault: cardData.isDefault || paymentMethods.length === 0
      });

      if (response.success) {
        showSuccess('Payment method added successfully');
        setShowAddForm(false);
        loadPaymentMethods();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to add payment method');
    } finally {
      setAddingMethod(false);
    }
  };

  const handleSetDefault = async (methodId: number) => {
    try {
      const response = await marketplaceApi.setDefaultPaymentMethod(methodId);
      if (response.success) {
        showSuccess('Default payment method updated');
        loadPaymentMethods();
      }
    } catch (error) {
      showError('Failed to set default payment method');
    }
  };

  const handleDeleteMethod = async (methodId: number) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await marketplaceApi.deletePaymentMethod(methodId);
      if (response.success) {
        showSuccess('Payment method deleted');
        if (selectedId === methodId) {
          onSelect(null);
        }
        loadPaymentMethods();
      }
    } catch (error) {
      showError('Failed to delete payment method');
    }
  };

  if (loading) {
    return <LoadingText>Loading payment methods...</LoadingText>;
  }

  return (
    <Container>
      <Header>
        <Title>Payment Methods</Title>
        {showAddNew && !showAddForm && (
          <AddButton onClick={() => setShowAddForm(true)}>
            <FaPlus /> Add New
          </AddButton>
        )}
      </Header>

      {showAddForm && (
        <AddPaymentMethodForm
          onSubmit={handleAddPaymentMethod}
          onCancel={() => setShowAddForm(false)}
          addingMethod={addingMethod}
        />
      )}

      <PaymentMethodList
        paymentMethods={paymentMethods}
        selectedId={selectedId ?? null}
        showAddNew={showAddNew}
        onSelect={onSelect}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteMethod}
        onAddNew={() => setShowAddForm(true)}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  svg {
    font-size: 0.8rem;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default PaymentMethodSelector;
