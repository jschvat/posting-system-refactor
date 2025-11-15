import React from 'react';
import styled from 'styled-components';

interface RulesSectionProps {
  rules: string;
  onRulesChange: (value: string) => void;
}

export const RulesSection: React.FC<RulesSectionProps> = ({ rules, onRulesChange }) => {
  return (
    <FormSection>
      <SectionTitle>Rules & Guidelines</SectionTitle>

      <FormGroup>
        <Label htmlFor="rules">Group Rules</Label>
        <Textarea
          id="rules"
          value={rules}
          onChange={(e) => onRulesChange(e.target.value)}
          rows={8}
          maxLength={2000}
          placeholder="Enter group rules and guidelines..."
        />
      </FormGroup>
    </FormSection>
  );
};

const FormSection = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;
