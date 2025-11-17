import React from 'react';
import styled from 'styled-components';

export interface OrderSummaryProps {
  itemPrice: number;
  shippingCost: number;
  quantity?: number;
}

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 12px 0;
`;

const OrderSummaryContainer = styled.div`
  background: ${({ theme }) => theme.colors.hover};
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
  color: ${props => props.bold ? props.theme.colors.text.primary : props.theme.colors.text.secondary};

  ${props => props.bold && `
    border-top: 2px solid ${({ theme }) => theme.colors.border};
    margin-top: 8px;
    padding-top: 16px;
  `}
`;

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  itemPrice,
  shippingCost,
  quantity = 1
}) => {
  const subtotal = itemPrice * quantity;
  const totalPrice = subtotal + shippingCost;

  return (
    <Section>
      <SectionTitle>Order Summary</SectionTitle>
      <OrderSummaryContainer>
        <SummaryRow>
          <span>Item Price{quantity > 1 ? ` (x${quantity})` : ''}</span>
          <span>${subtotal.toFixed(2)}</span>
        </SummaryRow>
        <SummaryRow>
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
        </SummaryRow>
        <SummaryRow bold>
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </SummaryRow>
      </OrderSummaryContainer>
    </Section>
  );
};
