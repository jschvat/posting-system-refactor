import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as FaIcons from 'react-icons/fa';
import marketplaceApi from '../../services/marketplaceApi';
import { useToast } from '../Toast';

// Extract icons from FaIcons
const FaPlus = (FaIcons as any).FaPlus;
const FaTrash = (FaIcons as any).FaTrash;
const FaStar = (FaIcons as any).FaStar;
const FaRegStar = (FaIcons as any).FaRegStar;
const FaCreditCard = (FaIcons as any).FaCreditCard;
const FaUniversity = (FaIcons as any).FaUniversity;

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

  // Form state for adding new card
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: '',
    isDefault: false
  });

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

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newCard.cardNumber.replace(/\s/g, '').length !== 16) {
      showError('Please enter a valid 16-digit card number');
      return;
    }

    if (!newCard.expMonth || !newCard.expYear) {
      showError('Please enter expiration date');
      return;
    }

    if (newCard.cvc.length !== 3 && newCard.cvc.length !== 4) {
      showError('Please enter a valid CVC');
      return;
    }

    try {
      setAddingMethod(true);
      const response = await marketplaceApi.addPaymentMethod({
        type: 'card',
        cardNumber: newCard.cardNumber.replace(/\s/g, ''),
        expMonth: parseInt(newCard.expMonth),
        expYear: parseInt(newCard.expYear),
        cvc: newCard.cvc,
        holderName: newCard.holderName,
        isDefault: newCard.isDefault || paymentMethods.length === 0
      });

      if (response.success) {
        showSuccess('Payment method added successfully');
        setShowAddForm(false);
        setNewCard({
          cardNumber: '',
          expMonth: '',
          expYear: '',
          cvc: '',
          holderName: '',
          isDefault: false
        });
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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
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
        <AddMethodForm onSubmit={handleAddPaymentMethod}>
          <FormTitle>Add New Card</FormTitle>

          <FormGroup>
            <Label>Cardholder Name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={newCard.holderName}
              onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Card Number</Label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={newCard.cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                if (formatted.replace(/\s/g, '').length <= 16) {
                  setNewCard({ ...newCard, cardNumber: formatted });
                }
              }}
              maxLength={19}
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Expiration Month</Label>
              <Select
                value={newCard.expMonth}
                onChange={(e) => setNewCard({ ...newCard, expMonth: e.target.value })}
                required
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Expiration Year</Label>
              <Select
                value={newCard.expYear}
                onChange={(e) => setNewCard({ ...newCard, expYear: e.target.value })}
                required
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>CVC</Label>
              <Input
                type="text"
                placeholder="123"
                value={newCard.cvc}
                onChange={(e) => {
                  if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                    setNewCard({ ...newCard, cvc: e.target.value });
                  }
                }}
                maxLength={4}
                required
              />
            </FormGroup>
          </FormRow>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="setDefault"
              checked={newCard.isDefault}
              onChange={(e) => setNewCard({ ...newCard, isDefault: e.target.checked })}
            />
            <CheckboxLabel htmlFor="setDefault">Set as default payment method</CheckboxLabel>
          </CheckboxGroup>

          <FormActions>
            <CancelButton type="button" onClick={() => setShowAddForm(false)}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={addingMethod}>
              {addingMethod ? 'Adding...' : 'Add Payment Method'}
            </SubmitButton>
          </FormActions>
        </AddMethodForm>
      )}

      {paymentMethods.length === 0 && !showAddForm ? (
        <EmptyState>
          <FaCreditCard size={48} />
          <EmptyText>No payment methods added yet</EmptyText>
          {showAddNew && (
            <AddButton onClick={() => setShowAddForm(true)}>
              <FaPlus /> Add Your First Payment Method
            </AddButton>
          )}
        </EmptyState>
      ) : (
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
                    onClick={() => handleSetDefault(method.id)}
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
                  onClick={() => handleDeleteMethod(method.id)}
                  title="Delete"
                  danger
                >
                  <FaTrash />
                </ActionButton>
              </MethodActions>
            </MethodCard>
          ))}
        </MethodsList>
      )}
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
  color: #333;
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

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

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

const AddMethodForm = styled.form`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
`;

const FormTitle = styled.h4`
  margin: 0 0 1rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

export default PaymentMethodSelector;
