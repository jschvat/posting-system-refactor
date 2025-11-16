import React from 'react';
import styled from 'styled-components';

interface ComposerTextInputsProps {
  title: string;
  content: string;
  linkUrl: string;
  showLinkInput: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onLinkUrlChange: (value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemoveLink: () => void;
}

export const ComposerTextInputs: React.FC<ComposerTextInputsProps> = ({
  title,
  content,
  linkUrl,
  showLinkInput,
  onTitleChange,
  onContentChange,
  onLinkUrlChange,
  onPaste,
  onRemoveLink
}) => {
  return (
    <>
      <FormGroup>
        <Input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={300}
        />
      </FormGroup>

      <FormGroup>
        <TextArea
          placeholder="What's on your mind? (You can paste images here)"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          onPaste={onPaste}
          rows={4}
        />
      </FormGroup>

      {showLinkInput && (
        <FormGroup>
          <LinkInputContainer>
            <Input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => onLinkUrlChange(e.target.value)}
            />
            <RemoveLinkButton type="button" onClick={onRemoveLink}>
              ×
            </RemoveLinkButton>
          </LinkInputContainer>
        </FormGroup>
      )}
    </>
  );
};

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const LinkInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RemoveLinkButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${props => props.theme.colors.error};
  color: ${props.theme.colors.white};
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: ${props.theme.colors.error};
  }
`;
