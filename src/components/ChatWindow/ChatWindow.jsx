import React, { useEffect, useRef, useState } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { getRoomDisplayName } from '../../api/chat';
import MessageBubble from '../MessageBubble/MessageBubble';
import './ChatWindow.css';

export default function ChatWindow({ onBack }) {
  const { user } = useAuthStore();
  const { activeRoomId, rooms, messages, sendMessage, isLoadingMessages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const roomMessages = messages[activeRoomId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  if (!activeRoom) return null;

  const roomName = getRoomDisplayName(activeRoom, user?.id);

  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        <button className="back-button icon-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="chat-header-info">
          <div className="room-avatar">{roomName[0]?.toUpperCase()}</div>
          <div className="room-title">
            <h3>{roomName}</h3>
            <span className="status">Online</span>
          </div>
        </div>
        <div className="chat-header-actions">
           <button className="icon-button">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
           </button>
        </div>
      </div>

      <div className="messages-area">
        {isLoadingMessages ? (
          <div className="loading-spinner">Loading messages...</div>
        ) : roomMessages.length === 0 ? (
          <div className="no-messages">
            Say hi to start the conversation!
          </div>
        ) : (
          <div className="messages-list">
            {roomMessages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <MessageBubble key={msg.id} message={msg} isMine={isMine} />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim()}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
