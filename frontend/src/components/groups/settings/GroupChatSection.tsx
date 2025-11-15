import React from 'react';
import styled from 'styled-components';

interface GroupChatSectionProps {
  chatEnabled: boolean;
  onChatEnabledChange: (enabled: boolean) => void;
}

export const GroupChatSection: React.FC<GroupChatSectionProps> = ({
  chatEnabled,
  onChatEnabledChange
}) => {
  return (
    <FormSection>
      <SectionTitle>Group Chat</SectionTitle>
      <Help>Enable a real-time group chat for all members. Members will be automatically added when they join the group.</Help>

      <FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={chatEnabled}
            onChange={(e) => onChatEnabledChange(e.target.checked)}
          />
          <strong>Enable Group Chat</strong> - Add a chat tab where members can message each other in real-time
        </CheckboxLabel>
      </FormGroup>

      {chatEnabled && (
        <InfoBox>
          When enabled, all current and future members will have access to the group chat.
          The chat will appear as a tab on the group page. Members are automatically added
          when they join the group and removed when they leave.
        </InfoBox>
      )}
    </FormSection>
  );
};

// Styled Components
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Help = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 16px;
`;

const InfoBox = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.theme.colors.primary}15;
  border: 1px solid ${props => props.theme.colors.primary}40;
  border-radius: 6px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.5;
`;
