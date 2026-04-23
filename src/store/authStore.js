import { create } from 'zustand';
import { login as apiLogin, signup as apiSignup, getCurrentUser } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Initialize user from stored token
  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = getCurrentUser(token);
      if (user) {
        set({ user, token, isAuthenticated: true });
      } else {
        // Token expired or invalid
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token } = await apiLogin(email, password);
      localStorage.setItem('token', token);
      const user = getCurrentUser(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signup: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await apiSignup(username, email, password);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
