import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { connectWebSocket } from '../api/ws';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import AddContactModal from '../components/AddContactModal/AddContactModal';
import './ChatPage.css';

export default function ChatPage() {
  const { user, token } = useAuthStore();
  const { loadRooms, receiveMessage, rooms, activeRoomId } = useChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initial load
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const disconnect = connectWebSocket(token, (message) => {
      // Don't duplicate if we just sent it
      if (message.senderId !== user?.id) {
        receiveMessage(message);
      }
    });

    return () => {
      disconnect();
    };
  }, [token, user, receiveMessage]);

  // Responsive sidebar toggle logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else if (activeRoomId) {
        setSidebarOpen(false); // Hide sidebar when a chat is open on mobile
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, [activeRoomId]);

  const handleRoomSelect = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="chat-layout">
      <div className={`chat-sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar 
          onNewContact={() => setIsModalOpen(true)} 
          onRoomSelect={handleRoomSelect}
        />
      </div>

      <div className={`chat-main-wrapper ${!sidebarOpen ? 'active' : ''}`}>
        {activeRoomId ? (
          <ChatWindow onBack={() => setSidebarOpen(true)} />
        ) : (
          <div className="chat-empty-state">
            <div className="empty-state-content">
              <div className="empty-icon">💬</div>
              <h3>No chat selected</h3>
              <p>Select a conversation from the sidebar or start a new one.</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddContactModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
