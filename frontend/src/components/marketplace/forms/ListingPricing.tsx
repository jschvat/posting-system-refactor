import React from 'react';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${props.theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props.theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props.theme.colors.info};
  }

  &:disabled {
    background: ${props.theme.colors.hover};
    cursor: not-allowed;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 15px;
  color: ${props.theme.colors.text.primary};
  cursor: pointer;
`;

const HelpText = styled.p`
  font-size: 13px;
  color: ${props.theme.colors.text.secondary};
  margin: 6px 0 0 0;
`;

interface ListingPricingProps {
  formData: {
    price: string;
    negotiable: boolean;
    shipping_offered: boolean;
    shipping_cost: string;
  };
  onChange: (field: string, value: any) => void;
}

export const ListingPricing: React.FC<ListingPricingProps> = ({ formData, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange(name, type === 'checkbox' ? checked : value);
  };

  return (
    <>
      <Section>
        <SectionTitle>Pricing</SectionTitle>

        <FormGroup>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="99.99"
            required
          />
        </FormGroup>

        <FormGroup>
          <CheckboxLabel>
            <Checkbox
              name="negotiable"
              checked={formData.negotiable}
              onChange={handleInputChange}
            />
            Price is negotiable
          </CheckboxLabel>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Shipping</SectionTitle>

        <FormGroup>
          <CheckboxLabel>
            <Checkbox
              name="shipping_offered"
              checked={formData.shipping_offered}
              onChange={handleInputChange}
            />
            Offer shipping
          </CheckboxLabel>
        </FormGroup>

        {formData.shipping_offered && (
          <FormGroup>
            <Label htmlFor="shipping_cost">Shipping Cost</Label>
            <Input
              id="shipping_cost"
              name="shipping_cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.shipping_cost}
              onChange={handleInputChange}
              placeholder="15.00"
            />
            <HelpText>Enter the shipping cost or leave blank for free shipping</HelpText>
          </FormGroup>
        )}
      </Section>
    </>
  );
};
