import React from 'react';
import styled from 'styled-components';
import { MarketplaceListing } from '../../../services/marketplaceApi';

export interface ShippingOptionsProps {
  listing: MarketplaceListing;
  selectedMethod: 'pickup' | 'shipping';
  onMethodChange: (method: 'pickup' | 'shipping') => void;
  shippingAddress?: string;
  onAddressChange?: (address: string) => void;
}

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
`;

const ShippingOptionsContainer = styled.div`
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

export const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  listing,
  selectedMethod,
  onMethodChange,
  shippingAddress,
  onAddressChange
}) => {
  return (
    <>
      <Section>
        <SectionTitle>Delivery Method</SectionTitle>
        <ShippingOptionsContainer>
          {listing.shipping_available && (
            <ShippingOption
              selected={selectedMethod === 'shipping'}
              onClick={() => onMethodChange('shipping')}
            >
              <input
                type="radio"
                name="shipping"
                checked={selectedMethod === 'shipping'}
                onChange={() => onMethodChange('shipping')}
              />
              <ShippingDetails>
                <ShippingLabel>Ship to Address</ShippingLabel>
                <ShippingDescription>Delivered to your address</ShippingDescription>
              </ShippingDetails>
              <ShippingPrice>${parseFloat(listing.shipping_cost || '0').toFixed(2)}</ShippingPrice>
            </ShippingOption>
          )}

          <ShippingOption
            selected={selectedMethod === 'pickup'}
            onClick={() => onMethodChange('pickup')}
          >
            <input
              type="radio"
              name="shipping"
              checked={selectedMethod === 'pickup'}
              onChange={() => onMethodChange('pickup')}
            />
            <ShippingDetails>
              <ShippingLabel>Local Pickup</ShippingLabel>
              <ShippingDescription>
                Pick up from {listing.location_city}, {listing.location_state}
              </ShippingDescription>
            </ShippingDetails>
            <ShippingPrice>Free</ShippingPrice>
          </ShippingOption>
        </ShippingOptionsContainer>
      </Section>

      {selectedMethod === 'shipping' && onAddressChange && (
        <Section>
          <SectionTitle>Shipping Address</SectionTitle>
          <AddressInput
            value={shippingAddress || ''}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter your full shipping address&#10;&#10;Example:&#10;123 Main Street&#10;Apt 4B&#10;San Francisco, CA 94102"
          />
        </Section>
      )}
    </>
  );
};
