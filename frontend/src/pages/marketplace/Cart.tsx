/**
 * Shopping Cart Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../../contexts/CartContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 20px;
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: #f7f7f7;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #007185;
  cursor: pointer;

  &:hover {
    color: #c7511f;
  }
`;

const ItemSeller = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 8px;
`;

const ItemPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #B12704;
`;

const ItemStock = styled.div<{ $inStock: boolean }>`
  font-size: 12px;
  color: ${props => props.$inStock ? '#067d62' : '#c00'};
  font-weight: 600;
  margin-top: 4px;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.background};
`;

const QuantityButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 30px;
  text-align: center;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #007185;
  font-size: 13px;
  cursor: pointer;
  padding: 8px;

  &:hover {
    color: #c7511f;
    text-decoration: underline;
  }
`;

const OrderSummary = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const SummaryTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 18px;
  font-weight: 700;
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: #ffd814;
  border: 1px solid #fcd200;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;

  &:hover {
    background: #f7ca00;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ContinueShoppingButton = styled.button`
  width: 100%;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyCartTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 12px;
`;

const EmptyCartText = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 24px;
`;

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getItemCount, getTotal } = useCart();

  const handleCheckout = () => {
    navigate('/marketplace/checkout');
  };

  if (items.length === 0) {
    return (
      <Container>
        <Title>Shopping Cart</Title>
        <EmptyCart>
          <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
          <EmptyCartText>Add items to your cart to continue shopping</EmptyCartText>
          <CheckoutButton onClick={() => navigate('/marketplace/birds/supplies')}>
            Continue Shopping
          </CheckoutButton>
        </EmptyCart>
      </Container>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <Container>
      <Title>Shopping Cart ({getItemCount()} items)</Title>

      <MainLayout>
        <CartItems>
          {items.map(item => (
            <CartItem key={item.id}>
              <ItemImage src={item.image} alt={item.title} />

              <ItemDetails>
                <div>
                  <ItemTitle onClick={() => navigate(`/marketplace/supplies/${item.id}`)}>
                    {item.title}
                  </ItemTitle>
                  <ItemSeller>by {item.seller_username}</ItemSeller>
                  <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                  <ItemStock $inStock={true}>In Stock</ItemStock>
                </div>

                <ItemActions>
                  <QuantitySelector>
                    <QuantityButton
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </QuantityButton>
                  </QuantitySelector>

                  <RemoveButton onClick={() => removeItem(item.id)}>
                    Remove
                  </RemoveButton>
                </ItemActions>
              </ItemDetails>
            </CartItem>
          ))}
        </CartItems>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>

          <SummaryRow>
            <span>Subtotal ({getItemCount()} items):</span>
            <span>${subtotal.toFixed(2)}</span>
          </SummaryRow>

          <SummaryRow>
            <span>Shipping:</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </SummaryRow>

          {shipping === 0 && (
            <div style={{ fontSize: '12px', color: '#067d62', marginBottom: '8px' }}>
              ✓ You saved ${5.99.toFixed(2)} on shipping!
            </div>
          )}

          <SummaryRow>
            <span>Estimated Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </SummaryRow>

          <SummaryTotal>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </SummaryTotal>

          <CheckoutButton onClick={handleCheckout}>
            Proceed to Checkout
          </CheckoutButton>

          <ContinueShoppingButton onClick={() => navigate('/marketplace/birds/supplies')}>
            Continue Shopping
          </ContinueShoppingButton>
        </OrderSummary>
      </MainLayout>
    </Container>
  );
};

export default Cart;
