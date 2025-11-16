import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { ConversationView } from '../messaging/ConversationView';
import { Conversation, Message } from '../../services/api/messagesApi';

interface GroupChatPopupProps {
  conversation: Conversation;
  messages: Message[];
  chatLoading: boolean;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage: (messageId: number, content: string) => Promise<void>;
  onDeleteMessage: (messageId: number) => Promise<void>;
  onReactionToggle: (messageId: number, emoji: string) => Promise<void>;
  groupName: string;
  groupSlug: string;
}

const GroupChatPopup: React.FC<GroupChatPopupProps> = ({
  conversation,
  messages,
  chatLoading,
  onClose,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactionToggle,
  groupName,
  groupSlug
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showMembersList, setShowMembersList] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activeUserIds, setActiveUserIds] = useState<Set<number>>(new Set());
  const { state } = useAuth();
  const { socket } = useWebSocket();

  // Load participants from conversation data
  React.useEffect(() => {
    if (conversation?.participants) {
      setParticipants(conversation.participants);
    }
  }, [conversation]);

  // Join conversation room and track active users
  React.useEffect(() => {
    if (!socket || !conversation?.id) return;

    // Join the conversation room
    socket.emit('conversation:join', { conversationId: conversation.id });

    // Handle joined response with active users
    const handleJoined = (data: any) => {
      if (data.conversationId === conversation.id && data.activeUsers) {
        const activeIds = new Set<number>(data.activeUsers.map((u: any) => u.userId as number));
        setActiveUserIds(activeIds);
      }
    };

    // Handle user joined
    const handleUserJoined = (data: any) => {
      if (data.conversationId === conversation.id) {
        setActiveUserIds(prev => new Set(prev).add(data.userId));
      }
    };

    // Handle user left
    const handleUserLeft = (data: any) => {
      if (data.conversationId === conversation.id) {
        setActiveUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    socket.on('conversation:joined', handleJoined);
    socket.on('conversation:user:joined', handleUserJoined);
    socket.on('conversation:user:left', handleUserLeft);

    // Cleanup: leave conversation room
    return () => {
      socket.emit('conversation:leave', { conversationId: conversation.id });
      socket.off('conversation:joined', handleJoined);
      socket.off('conversation:user:joined', handleUserJoined);
      socket.off('conversation:user:left', handleUserLeft);
    };
  }, [socket, conversation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(400, resizeStart.height + (e.clientY - resizeStart.y));
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  return (
    <ChatPopupContainer $position={position} $size={size} $isDragging={isDragging} $isResizing={isResizing}>
      <ChatPopupHeader onMouseDown={handleMouseDown}>
        <ChatPopupTitle>{groupName} Chat</ChatPopupTitle>
        <HeaderActions>
          <MembersButton onClick={() => setShowMembersList(!showMembersList)} title="Toggle active members">
            👥 {activeUserIds.size}
          </MembersButton>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </HeaderActions>
      </ChatPopupHeader>
      <ChatPopupBody>
        <ChatPopupContent $showSidebar={showMembersList}>
          {chatLoading ? (
            <LoadingMessage>Loading chat...</LoadingMessage>
          ) : (
            <ConversationView
              messages={messages}
              onSendMessage={onSendMessage}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
              onReactionToggle={onReactionToggle}
              conversationId={conversation.id}
            />
          )}
        </ChatPopupContent>
        {showMembersList && (
          <MembersSidebar>
            <MembersSidebarHeader>
              Active Now ({activeUserIds.size})
            </MembersSidebarHeader>
            <MembersList>
              {activeUserIds.size === 0 ? (
                <EmptyMembersMessage>
                  No one else is active in this chat right now
                </EmptyMembersMessage>
              ) : (
                participants
                  .filter(participant => activeUserIds.has(participant.user_id || participant.id))
                  .map((participant) => (
                  <MemberItem key={participant.user_id || participant.id}>
                    <MemberAvatar>
                      {participant.avatar_url ? (
                        <img src={participant.avatar_url} alt={participant.username} />
                      ) : (
                        <div>{participant.username?.[0]?.toUpperCase() || '?'}</div>
                      )}
                    </MemberAvatar>
                    <MemberInfo>
                      <MemberName $isCurrentUser={participant.user_id === state.user?.id || participant.id === state.user?.id}>
                        {participant.username}
                        {(participant.user_id === state.user?.id || participant.id === state.user?.id) && ' (You)'}
                      </MemberName>
                      {participant.role && participant.role !== 'member' && (
                        <MemberRole>{participant.role}</MemberRole>
                      )}
                    </MemberInfo>
                  </MemberItem>
                ))
              )}
            </MembersList>
          </MembersSidebar>
        )}
      </ChatPopupBody>
      <ResizeHandle onMouseDown={handleResizeMouseDown} />
    </ChatPopupContainer>
  );
};

// Chat Popup Styled Components
const ChatPopupContainer = styled.div.attrs<{ $position: { x: number; y: number }; $size: { width: number; height: number }; $isDragging: boolean; $isResizing: boolean }>(props => ({
  style: {
    left: `${props.$position.x}px`,
    top: `${props.$position.y}px`,
    width: `${props.$size.width}px`,
    height: `${props.$size.height}px`,
    userSelect: (props.$isDragging || props.$isResizing) ? 'none' : 'auto',
    cursor: props.$isDragging ? 'move' : 'default'
  }
}))<{ $position: { x: number; y: number }; $size: { width: number; height: number }; $isDragging: boolean; $isResizing: boolean }>`
  position: fixed;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
`;

const ChatPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${props => props.theme.colors.primary};
  color: ${props.theme.colors.white};
  cursor: move;
  user-select: none;
`;

const ChatPopupTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props.theme.colors.white};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MembersButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: ${props.theme.colors.white};
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatPopupBody = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const ChatPopupContent = styled.div<{ $showSidebar?: boolean }>`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: ${props => props.$showSidebar ? 'calc(100% - 220px)' : '100%'};
  transition: width 0.2s ease;
`;

const MembersSidebar = styled.div`
  width: 220px;
  border-left: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MembersSidebarHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MembersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: ${props => props.theme.colors.primary};
  color: ${props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MemberName = styled.div<{ $isCurrentUser?: boolean }>`
  font-size: 13px;
  font-weight: ${props => props.$isCurrentUser ? '600' : '500'};
  color: ${props => props.$isCurrentUser ? props.theme.colors.primary : props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberRole = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: capitalize;
  padding: 2px 6px;
  background: ${props => props.theme.colors.surface};
  border-radius: 3px;
  width: fit-content;
`;

const EmptyMembersMessage = styled.div`
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 18px;
`;

const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 50%,
    ${props => props.theme.colors.border} 50%,
    ${props => props.theme.colors.border} 55%,
    transparent 55%,
    transparent 60%,
    ${props => props.theme.colors.border} 60%,
    ${props => props.theme.colors.border} 65%,
    transparent 65%,
    transparent 70%,
    ${props => props.theme.colors.border} 70%,
    ${props => props.theme.colors.border} 75%,
    transparent 75%
  );

  &:hover {
    background: linear-gradient(
      135deg,
      transparent 0%,
      transparent 50%,
      ${props => props.theme.colors.primary} 50%,
      ${props => props.theme.colors.primary} 55%,
      transparent 55%,
      transparent 60%,
      ${props => props.theme.colors.primary} 60%,
      ${props => props.theme.colors.primary} 65%,
      transparent 65%,
      transparent 70%,
      ${props => props.theme.colors.primary} 70%,
      ${props => props.theme.colors.primary} 75%,
      transparent 75%
    );
  }
`;

export default GroupChatPopup;
