import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface ComposerActionsProps {
  submitting: boolean;
  uploading: boolean;
  children?: ReactNode;
}

export const ComposerActions: React.FC<ComposerActionsProps> = ({
  submitting,
  uploading,
  children
}) => {
  return (
    <FormActions>
      <AttachmentSection>
        {children}
      </AttachmentSection>

      <SubmitButton type="submit" disabled={submitting || uploading}>
        {submitting ? 'Posting...' : 'Post'}
      </SubmitButton>
    </FormActions>
  );
};

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const AttachmentSection = styled.div`
  flex: 1;
`;

const SubmitButton = styled.button`
  padding: 10px 32px;
  border-radius: 8px;
  border: none;
  background: ${props => props.theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
