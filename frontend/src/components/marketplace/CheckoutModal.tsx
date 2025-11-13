import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import marketplaceApi, { MarketplaceListing } from '../../services/marketplaceApi';
import PaymentMethodSelector from './PaymentMethodSelector';
import { useToast } from '../Toast';

interface CheckoutModalProps {
  listing: MarketplaceListing;
  onClose: () => void;
  onSuccess: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #2c3e50;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
`;

const OrderSummary = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const SummaryRow = styled.div<{ bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-weight: ${props => props.bold ? '700' : '400'};
  font-size: ${props => props.bold ? '18px' : '15px'};
  color: ${props => props.bold ? '#2c3e50' : '#555'};

  ${props => props.bold && `
    border-top: 2px solid #dee2e6;
    margin-top: 8px;
    padding-top: 16px;
  `}
`;

const ListingInfo = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ListingImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
`;

const ListingImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: bold;
`;

const ListingDetails = styled.div`
  flex: 1;
`;

const ListingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const ListingMeta = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

const ShippingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShippingOption = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#3498db' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};

  &:hover {
    border-color: #3498db;
  }

  input[type="radio"] {
    cursor: pointer;
  }
`;

const ShippingDetails = styled.div`
  flex: 1;
`;

const ShippingLabel = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
`;

const ShippingDescription = styled.div`
  font-size: 13px;
  color: #7f8c8d;
`;

const ShippingPrice = styled.div`
  font-weight: 700;
  color: #2c3e50;
  font-size: 16px;
`;

const AddressInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: #3498db;
    color: white;

    &:hover:not(:disabled) {
      background: #2980b9;
    }
  ` : `
    background: #ecf0f1;
    color: #2c3e50;

    &:hover:not(:disabled) {
      background: #d5dbdb;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c00;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ listing, onClose, onSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'pickup' | 'shipping'>(
    listing.shipping_available ? 'shipping' : 'pickup'
  );
  const [shippingAddress, setShippingAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const itemPrice = parseFloat(listing.price);
  const shippingCost = shippingMethod === 'shipping' ? parseFloat(listing.shipping_cost || '0') : 0;
  const totalPrice = itemPrice + shippingCost;

  const handleCheckout = async () => {
    setError(null);

    // Validation
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (shippingMethod === 'shipping' && !shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create transaction
      const transactionResponse = await marketplaceApi.createTransaction({
        listingId: listing.id,
        transactionType: 'direct_sale',
        fulfillmentMethod: shippingMethod,
        shippingAddress: shippingMethod === 'shipping' ? shippingAddress : null
      });

      if (!transactionResponse.success || !transactionResponse.data?.transaction) {
        throw new Error(transactionResponse.error?.message || 'Failed to create transaction');
      }

      const transactionId = transactionResponse.data.transaction.id;

      // Step 2: Process payment
      const paymentResponse = await marketplaceApi.processPayment(transactionId, selectedPaymentMethod);

      if (paymentResponse.success) {
        showSuccess('Purchase completed successfully!');
        onSuccess();
        onClose();
      } else {
        throw new Error(paymentResponse.error?.message || 'Payment failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to complete purchase';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return ReactDOM.createPortal(
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Complete Purchase</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {/* Listing Preview */}
          <ListingInfo>
            {listing.primary_image ? (
              <ListingImage src={listing.primary_image} alt={listing.title} />
            ) : (
              <ListingImagePlaceholder>
                {listing.title.charAt(0).toUpperCase()}
              </ListingImagePlaceholder>
            )}
            <ListingDetails>
              <ListingTitle>{listing.title}</ListingTitle>
              <ListingMeta>Quantity: 1</ListingMeta>
            </ListingDetails>
          </ListingInfo>

          {/* Shipping Options */}
          <Section>
            <SectionTitle>Delivery Method</SectionTitle>
            <ShippingOptions>
              {listing.shipping_available && (
                <ShippingOption
                  selected={shippingMethod === 'shipping'}
                  onClick={() => setShippingMethod('shipping')}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'shipping'}
                    onChange={() => setShippingMethod('shipping')}
                  />
                  <ShippingDetails>
                    <ShippingLabel>Ship to Address</ShippingLabel>
                    <ShippingDescription>Delivered to your address</ShippingDescription>
                  </ShippingDetails>
                  <ShippingPrice>${parseFloat(listing.shipping_cost || '0').toFixed(2)}</ShippingPrice>
                </ShippingOption>
              )}

              <ShippingOption
                selected={shippingMethod === 'pickup'}
                onClick={() => setShippingMethod('pickup')}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === 'pickup'}
                  onChange={() => setShippingMethod('pickup')}
                />
                <ShippingDetails>
                  <ShippingLabel>Local Pickup</ShippingLabel>
                  <ShippingDescription>
                    Pick up from {listing.location_city}, {listing.location_state}
                  </ShippingDescription>
                </ShippingDetails>
                <ShippingPrice>Free</ShippingPrice>
              </ShippingOption>
            </ShippingOptions>
          </Section>

          {/* Shipping Address (if shipping selected) */}
          {shippingMethod === 'shipping' && (
            <Section>
              <SectionTitle>Shipping Address</SectionTitle>
              <AddressInput
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address&#10;&#10;Example:&#10;123 Main Street&#10;Apt 4B&#10;San Francisco, CA 94102"
              />
            </Section>
          )}

          {/* Payment Method */}
          <Section>
            <SectionTitle>Payment Method</SectionTitle>
            <PaymentMethodSelector
              selectedId={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
            />
          </Section>

          {/* Order Summary */}
          <Section>
            <SectionTitle>Order Summary</SectionTitle>
            <OrderSummary>
              <SummaryRow>
                <span>Item Price</span>
                <span>${itemPrice.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </SummaryRow>
              <SummaryRow bold>
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </SummaryRow>
            </OrderSummary>
          </Section>

          {/* Action Buttons */}
          <ButtonGroup>
            <Button variant="secondary" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCheckout} disabled={processing}>
              {processing ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </Button>
          </ButtonGroup>
        </Content>
      </Modal>
    </Overlay>,
    document.body
  );
};
