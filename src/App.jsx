import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { init, isAuthenticated } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <SignupPage />} 
        />

        {/* Protected Route */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/chat" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}
