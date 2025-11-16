import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import marketplaceApi, { MarketplaceListing } from '../../services/marketplaceApi';
import PaymentMethodSelector from './PaymentMethodSelector';
import { useToast } from '../Toast';
import { ShippingOptions } from './buying/ShippingOptions';
import { OrderSummary } from './buying/OrderSummary';

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
  background: ${props.theme.colors.white};
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: ${props.theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${props.theme.colors.text.primary};
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
  color: ${props.theme.colors.text.primary};
  margin: 0 0 12px 0;
`;

const ListingInfo = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: ${props.theme.colors.hover};
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
  color: ${props.theme.colors.white};
  font-weight: bold;
`;

const ListingDetails = styled.div`
  flex: 1;
`;

const ListingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ListingMeta = styled.div`
  font-size: 13px;
  color: ${props.theme.colors.text.secondary};
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
    background: ${props.theme.colors.info};
    color: ${props.theme.colors.white};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.infoDark};
    }
  ` : `
    background: ${props.theme.colors.border};
    color: ${props.theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.border};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${props.theme.colors.errorLight};
  color: ${props.theme.colors.error};
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
          <ShippingOptions
            listing={listing}
            selectedMethod={shippingMethod}
            onMethodChange={setShippingMethod}
            shippingAddress={shippingAddress}
            onAddressChange={setShippingAddress}
          />

          {/* Payment Method */}
          <Section>
            <SectionTitle>Payment Method</SectionTitle>
            <PaymentMethodSelector
              selectedId={selectedPaymentMethod}
              onSelect={setSelectedPaymentMethod}
            />
          </Section>

          {/* Order Summary */}
          <OrderSummary
            itemPrice={itemPrice}
            shippingCost={shippingCost}
            quantity={1}
          />

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
