import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './SignupPage.css';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const navigate = useNavigate();
  const { signup, login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await signup(username, email, password);
      // Automatically log in after successful signup
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-brand">
        <div className="brand-content">
          <h1>Join Pulse</h1>
          <p>Experience real-time chatting like never before.</p>
        </div>
        <div className="brand-bg"></div>
      </div>
      
      <div className="auth-form-wrapper">
        <div className="auth-form-container">
          <h2>Create an account</h2>
          <p className="auth-subtitle">Get started with Pulse Chat today.</p>

          {(error || validationError) && (
            <div className="auth-error">{validationError || error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
