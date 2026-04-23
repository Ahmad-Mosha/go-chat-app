import React from 'react';
import './MessageBubble.css';

export default function MessageBubble({ message, isMine }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-bubble">
        <div className="message-content">{message.content}</div>
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
}
