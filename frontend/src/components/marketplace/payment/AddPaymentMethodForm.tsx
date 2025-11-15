import React, { useState } from 'react';
import styled from 'styled-components';

interface NewCardState {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
  isDefault: boolean;
}

interface AddPaymentMethodFormProps {
  onSubmit: (cardData: NewCardState) => Promise<void>;
  onCancel: () => void;
  addingMethod: boolean;
}

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
};

export const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  addingMethod
}) => {
  const [newCard, setNewCard] = useState<NewCardState>({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: '',
    isDefault: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newCard);
  };

  return (
    <AddMethodForm onSubmit={handleSubmit}>
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
        <CancelButton type="button" onClick={onCancel}>
          Cancel
        </CancelButton>
        <SubmitButton type="submit" disabled={addingMethod}>
          {addingMethod ? 'Adding...' : 'Add Payment Method'}
        </SubmitButton>
      </FormActions>
    </AddMethodForm>
  );
};

// Styled Components
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
