import React, { useState } from 'react';
import useChatStore from '../../store/chatStore';
import './AddContactModal.css';

export default function AddContactModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addContact } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await addContact(email);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to add contact');
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Chat</h3>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-desc">Enter the email address of the person you want to chat with.</p>
          
          {error && <div className="modal-error">{error}</div>}
          
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || !email.trim()}>
              {isLoading ? 'Searching...' : 'Start Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
