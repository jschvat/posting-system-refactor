import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CreatePostData } from '../../types/group';
import { Media } from '../../types';
import { mediaApi } from '../../services/api';
import { useToast } from '../Toast';
import PollCreator from '../PollCreator';
import { ComposerTextInputs } from './composer/ComposerTextInputs';
import { ComposerMediaUpload } from './composer/ComposerMediaUpload';
import { ComposerActions } from './composer/ComposerActions';

interface GroupPostComposerProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  allowedTypes: {
    text: boolean;
    link: boolean;
    image: boolean;
    video: boolean;
    poll: boolean;
  };
  requiresApproval?: boolean;
}

const GroupPostComposer: React.FC<GroupPostComposerProps> = ({
  onSubmit,
  allowedTypes,
  requiresApproval = false
}) => {
  const { showError, showSuccess } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollData, setPollData] = useState<{
    question: string;
    options: string[];
    endsAt: string | null;
    allowMultiple: boolean;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file size (100MB max for all file types)
    const maxSize = 100 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      showError('File size must be less than 100MB');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);

      const response = await mediaApi.uploadFiles({
        files: selectedFiles
      });

      if (response.success && response.data) {
        setUploadedMedia(prev => [...prev, ...response.data]);
        showSuccess(`${selectedFiles.length} file(s) uploaded successfully`);
        setSelectedFiles([]); // Clear selected files after upload
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to upload files';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveUploadedMedia = (mediaId: number) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      const oversizedFiles = imageFiles.filter(f => f.size > maxSize);
      if (oversizedFiles.length > 0) {
        showError('Pasted image is too large (max 50MB)');
        return;
      }

      setSelectedFiles(prev => [...prev, ...imageFiles]);
      showSuccess(`${imageFiles.length} image(s) pasted`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() && !content.trim() && !showPollCreator) {
      setError('Please provide a title or content');
      return;
    }

    if (showLinkInput && !linkUrl.trim()) {
      setError('Please provide a link URL or remove the link');
      return;
    }

    if (showPollCreator && pollData) {
      if (!pollData.question.trim()) {
        setError('Please provide a poll question');
        return;
      }

      if (pollData.options.length < 2) {
        setError('Please provide at least 2 poll options');
        return;
      }
    }

    try {
      setSubmitting(true);

      // Use title if provided, otherwise use content preview, poll question, or default
      const postTitle = title.trim() ||
                       (content.trim().substring(0, 100)) ||
                       (showPollCreator && pollData ? pollData.question.substring(0, 100) : null) ||
                       'Untitled Post';

      const postData: CreatePostData = {
        title: postTitle,
        content_type: showPollCreator ? 'poll' : 'text'
      };

      if (content.trim()) {
        postData.content = content.trim();
      }

      if (linkUrl.trim()) {
        postData.link_url = linkUrl.trim();
      }

      // Add uploaded media IDs
      if (uploadedMedia.length > 0) {
        postData.media_ids = uploadedMedia.map(m => m.id);
      }

      // Add poll data if creating a poll
      if (showPollCreator && pollData) {
        postData.poll_question = pollData.question;
        postData.poll_options = pollData.options;
        postData.poll_ends_at = pollData.endsAt;
        postData.poll_allow_multiple = pollData.allowMultiple;
      }

      await onSubmit(postData);

      // Reset form
      setTitle('');
      setContent('');
      setLinkUrl('');
      setSelectedFiles([]);
      setUploadedMedia([]);
      setShowLinkInput(false);
      setShowPollCreator(false);
      setPollData(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-upload files when selected
  React.useEffect(() => {
    if (selectedFiles.length > 0 && !uploading) {
      handleUploadFiles();
    }
  }, [selectedFiles.length]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachMenu && !(event.target as Element).closest('[data-attach-menu]')) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  return (
    <ComposerCard>
      <ComposerTitle>Create a Post</ComposerTitle>

      {requiresApproval && (
        <ApprovalNotice>
          Posts in this group require moderator approval before they are visible to others.
        </ApprovalNotice>
      )}

      <Form onSubmit={handleSubmit}>
        <ComposerTextInputs
          title={title}
          content={content}
          linkUrl={linkUrl}
          showLinkInput={showLinkInput}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onLinkUrlChange={setLinkUrl}
          onPaste={handlePaste}
          onRemoveLink={() => {
            setShowLinkInput(false);
            setLinkUrl('');
          }}
        />

        <ComposerMediaUpload
          uploadedMedia={uploadedMedia}
          uploading={uploading}
          selectedFiles={selectedFiles}
          showAttachMenu={showAttachMenu}
          allowedTypes={allowedTypes}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onRemoveUploadedMedia={handleRemoveUploadedMedia}
          onToggleAttachMenu={setShowAttachMenu}
          onMenuItemClick={(fileType, accept) => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = accept;
              fileInputRef.current.click();
            }
          }}
          onLinkClick={() => {
            setShowLinkInput(true);
            setShowAttachMenu(false);
          }}
          onPollClick={() => {
            setShowPollCreator(!showPollCreator);
            setShowAttachMenu(false);
          }}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ComposerActions submitting={submitting} uploading={uploading}>
          {/* Attach menu is rendered within ComposerMediaUpload */}
        </ComposerActions>

        {/* Poll Creator */}
        {showPollCreator && (
          <PollCreator onChange={(data) => setPollData(data)} />
        )}
      </Form>
    </ComposerCard>
  );
};

const ComposerCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ComposerTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ApprovalNotice = styled.div`
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196F3;
  border-radius: 4px;
  color: #2196F3;
  font-size: 14px;
  margin-bottom: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #f44336;
  font-size: 14px;
`;

export default GroupPostComposer;
