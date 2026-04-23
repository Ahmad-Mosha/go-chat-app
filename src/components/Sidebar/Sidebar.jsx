import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { getRoomDisplayName } from '../../api/chat';
import './Sidebar.css';

export default function Sidebar({ onNewContact, onRoomSelect }) {
  const { user, logout } = useAuthStore();
  const { rooms, activeRoomId, selectRoom, isLoadingRooms } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((room) => {
    const name = getRoomDisplayName(room, user?.id).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const handleSelect = (id) => {
    selectRoom(id);
    if (onRoomSelect) onRoomSelect();
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <span className="status">Online</span>
          </div>
        </div>
        <button className="icon-button" onClick={onNewContact} title="Add Contact">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-rooms">
        {isLoadingRooms ? (
          <div className="loading-spinner">Loading...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="no-rooms">
            {searchQuery ? 'No chats found' : 'No chats yet. Start one!'}
          </div>
        ) : (
          filteredRooms.map((room) => {
            const name = getRoomDisplayName(room, user?.id);
            return (
              <div
                key={room.id}
                className={`room-item ${activeRoomId === room.id ? 'active' : ''}`}
                onClick={() => handleSelect(room.id)}
              >
                <div className="room-avatar">{name[0]?.toUpperCase()}</div>
                <div className="room-details">
                  <div className="room-top">
                    <span className="room-name">{name}</span>
                    <span className="room-time">{formatTime(room.lastMessageAt)}</span>
                  </div>
                  <div className="room-bottom">
                    <span className="room-last-msg">
                      {room.lastMessage || 'New chat started'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
