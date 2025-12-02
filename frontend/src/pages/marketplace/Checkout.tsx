/**
 * Checkout Page - Amazon Style
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface PaymentMethod {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
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

const CheckoutSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepCard = styled.div<{ $expanded?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${props => props.$expanded ? '#007185' : props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const StepHeader = styled.div<{ $completed?: boolean }>`
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${props => props.$completed ? '#f0f8ff' : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const StepTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
`;

const StepNumber = styled.div<{ $completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$completed ? '#067d62' : '#007185'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const StepContent = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007185;
    box-shadow: 0 0 0 3px rgba(0, 113, 133, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  background: ${props => props.$primary ? '#ffd814' : 'transparent'};
  border: 1px solid ${props => props.$primary ? '#fcd200' : props.theme.colors.border};
  color: ${props => props.$primary ? '#0f1111' : props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.$primary ? '#f7ca00' : props.theme.colors.hover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const SavedAddress = styled.div<{ $selected?: boolean }>`
  padding: 12px;
  border: 2px solid ${props => props.$selected ? '#007185' : props.theme.colors.border};
  border-radius: 4px;
  margin-bottom: 12px;
  cursor: pointer;
  background: ${props => props.$selected ? '#f0f8ff' : 'transparent'};

  &:hover {
    border-color: #007185;
  }
`;

const AddressText = styled.div`
  font-size: 14px;
  line-height: 1.5;
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
  font-size: 20px;
  font-weight: 700;
  color: #B12704;
`;

const PlaceOrderButton = styled(Button)`
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 16px;
`;

const ItemsList = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ItemRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ItemDetails = styled.div`
  flex: 1;
  font-size: 13px;
`;

const ItemTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ItemPrice = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ChangeLink = styled.button`
  background: none;
  border: none;
  color: #007185;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: #c7511f;
    text-decoration: underline;
  }
`;

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getItemCount, getTotal, clearCart } = useCart();
  const { state } = useAuth();

  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [shippingCompleted, setShippingCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (items.length === 0) {
    return (
      <Container>
        <Title>Checkout</Title>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Your cart is empty</h2>
          <p style={{ marginBottom: '24px' }}>Add items to continue</p>
          <Button $primary onClick={() => navigate('/marketplace/birds/supplies')}>
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingCompleted(true);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentCompleted(true);
    setCurrentStep('review');
  };

  const handlePlaceOrder = () => {
    // TODO: Submit order to backend
    alert('Order placed successfully! (This is a demo)');
    clearCart();
    navigate('/marketplace/birds/supplies');
  };

  return (
    <Container>
      <Title>Checkout ({getItemCount()} items)</Title>
      <Subtitle>Logged in as: {state.user?.username}</Subtitle>

      <MainLayout>
        <CheckoutSteps>
          {/* Step 1: Shipping Address */}
          <StepCard $expanded={currentStep === 'shipping'}>
            <StepHeader
              $completed={shippingCompleted}
              onClick={() => setCurrentStep('shipping')}
            >
              <StepTitle>
                <StepNumber $completed={shippingCompleted}>
                  {shippingCompleted ? '✓' : '1'}
                </StepNumber>
                Shipping Address
              </StepTitle>
              {shippingCompleted && <ChangeLink>Change</ChangeLink>}
            </StepHeader>

            {currentStep === 'shipping' && (
              <StepContent>
                <form onSubmit={handleShippingSubmit}>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input
                      required
                      value={shippingAddress.fullName}
                      onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Address Line 1</Label>
                    <Input
                      required
                      value={shippingAddress.addressLine1}
                      onChange={e => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Address Line 2 (Optional)</Label>
                    <Input
                      value={shippingAddress.addressLine2}
                      onChange={e => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                      placeholder="Apt 4B"
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label>City</Label>
                      <Input
                        required
                        value={shippingAddress.city}
                        onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>State</Label>
                      <Input
                        required
                        value={shippingAddress.state}
                        onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        placeholder="CA"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label>ZIP Code</Label>
                      <Input
                        required
                        value={shippingAddress.zipCode}
                        onChange={e => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        placeholder="90210"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone</Label>
                      <Input
                        required
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </FormGroup>
                  </FormRow>

                  <ButtonGroup>
                    <Button $primary type="submit">Use this address</Button>
                  </ButtonGroup>
                </form>
              </StepContent>
            )}

            {shippingCompleted && currentStep !== 'shipping' && (
              <StepContent>
                <AddressText>
                  <div><strong>{shippingAddress.fullName}</strong></div>
                  <div>{shippingAddress.addressLine1}</div>
                  {shippingAddress.addressLine2 && <div>{shippingAddress.addressLine2}</div>}
                  <div>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</div>
                  <div>Phone: {shippingAddress.phone}</div>
                </AddressText>
              </StepContent>
            )}
          </StepCard>

          {/* Step 2: Payment Method */}
          <StepCard $expanded={currentStep === 'payment'}>
            <StepHeader
              $completed={paymentCompleted}
              onClick={() => shippingCompleted && setCurrentStep('payment')}
            >
              <StepTitle>
                <StepNumber $completed={paymentCompleted}>
                  {paymentCompleted ? '✓' : '2'}
                </StepNumber>
                Payment Method
              </StepTitle>
              {paymentCompleted && <ChangeLink>Change</ChangeLink>}
            </StepHeader>

            {currentStep === 'payment' && shippingCompleted && (
              <StepContent>
                <form onSubmit={handlePaymentSubmit}>
                  <FormGroup>
                    <Label>Name on Card</Label>
                    <Input
                      required
                      value={paymentMethod.cardName}
                      onChange={e => setPaymentMethod({ ...paymentMethod, cardName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Card Number</Label>
                    <Input
                      required
                      value={paymentMethod.cardNumber}
                      onChange={e => setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label>Expiry Month</Label>
                      <Input
                        required
                        value={paymentMethod.expiryMonth}
                        onChange={e => setPaymentMethod({ ...paymentMethod, expiryMonth: e.target.value })}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Expiry Year</Label>
                      <Input
                        required
                        value={paymentMethod.expiryYear}
                        onChange={e => setPaymentMethod({ ...paymentMethod, expiryYear: e.target.value })}
                        placeholder="YYYY"
                        maxLength={4}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label>CVV</Label>
                    <Input
                      required
                      type="password"
                      value={paymentMethod.cvv}
                      onChange={e => setPaymentMethod({ ...paymentMethod, cvv: e.target.value })}
                      placeholder="123"
                      maxLength={4}
                      style={{ width: '120px' }}
                    />
                  </FormGroup>

                  <ButtonGroup>
                    <Button $primary type="submit">Use this payment method</Button>
                    <Button type="button" onClick={() => setCurrentStep('shipping')}>Back</Button>
                  </ButtonGroup>
                </form>
              </StepContent>
            )}

            {paymentCompleted && currentStep !== 'payment' && (
              <StepContent>
                <AddressText>
                  <div><strong>{paymentMethod.cardName}</strong></div>
                  <div>Card ending in {paymentMethod.cardNumber.slice(-4)}</div>
                  <div>Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}</div>
                </AddressText>
              </StepContent>
            )}
          </StepCard>

          {/* Step 3: Review Order */}
          <StepCard $expanded={currentStep === 'review'}>
            <StepHeader $completed={false}>
              <StepTitle>
                <StepNumber>3</StepNumber>
                Review Items and Shipping
              </StepTitle>
            </StepHeader>

            {currentStep === 'review' && paymentCompleted && (
              <StepContent>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                    Items ({getItemCount()})
                  </h3>
                  <ItemsList>
                    {items.map(item => (
                      <ItemRow key={item.id}>
                        <ItemImage src={item.image} alt={item.title} />
                        <ItemDetails>
                          <ItemTitle>{item.title}</ItemTitle>
                          <ItemPrice>
                            ${item.price.toFixed(2)} x {item.quantity}
                          </ItemPrice>
                        </ItemDetails>
                      </ItemRow>
                    ))}
                  </ItemsList>
                </div>

                <ButtonGroup>
                  <Button type="button" onClick={() => setCurrentStep('payment')}>Back</Button>
                </ButtonGroup>
              </StepContent>
            )}
          </StepCard>
        </CheckoutSteps>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>

          <SummaryRow>
            <span>Items ({getItemCount()}):</span>
            <span>${subtotal.toFixed(2)}</span>
          </SummaryRow>

          <SummaryRow>
            <span>Shipping & Handling:</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </SummaryRow>

          {shipping === 0 && (
            <div style={{ fontSize: '12px', color: '#067d62', marginBottom: '8px' }}>
              ✓ Your order qualifies for FREE Shipping!
            </div>
          )}

          <SummaryRow>
            <span>Estimated Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </SummaryRow>

          <SummaryTotal>
            <span>Order Total:</span>
            <span>${total.toFixed(2)}</span>
          </SummaryTotal>

          <PlaceOrderButton
            $primary
            disabled={!paymentCompleted || currentStep !== 'review'}
            onClick={handlePlaceOrder}
          >
            Place Your Order
          </PlaceOrderButton>

          <div style={{ fontSize: '11px', marginTop: '12px', color: '#666', textAlign: 'center' }}>
            By placing your order, you agree to our Terms & Conditions
          </div>
        </OrderSummary>
      </MainLayout>
    </Container>
  );
};

export default Checkout;
