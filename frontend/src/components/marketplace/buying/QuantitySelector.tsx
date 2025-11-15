import React from 'react';
import styled from 'styled-components';

export interface QuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onQuantityChange: (quantity: number) => void;
}

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const QuantityLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-right: 8px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #e9ecef;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    background: #dee2e6;
  }
`;

const QuantityInput = styled.input`
  width: 60px;
  height: 40px;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  background: white;

  &:focus {
    outline: none;
    background: #f8f9fa;
  }

  /* Remove number input arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const QuantityInfo = styled.span`
  font-size: 13px;
  color: #7f8c8d;
  margin-left: 8px;
`;

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxQuantity,
  onQuantityChange
}) => {
  const handleIncrement = () => {
    if (!maxQuantity || quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      if (!maxQuantity || value <= maxQuantity) {
        onQuantityChange(value);
      } else {
        onQuantityChange(maxQuantity);
      }
    }
  };

  return (
    <QuantityContainer>
      <QuantityLabel>Quantity:</QuantityLabel>
      <QuantityControls>
        <QuantityButton
          onClick={handleDecrement}
          disabled={quantity <= 1}
          type="button"
        >
          -
        </QuantityButton>
        <QuantityInput
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          max={maxQuantity}
        />
        <QuantityButton
          onClick={handleIncrement}
          disabled={maxQuantity !== undefined && quantity >= maxQuantity}
          type="button"
        >
          +
        </QuantityButton>
      </QuantityControls>
      {maxQuantity && (
        <QuantityInfo>
          ({maxQuantity} available)
        </QuantityInfo>
      )}
    </QuantityContainer>
  );
};
