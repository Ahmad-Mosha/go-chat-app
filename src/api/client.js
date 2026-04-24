/**
 * API Client — thin fetch wrapper with JWT interceptor.
 *
 * When VITE_API_URL is set, all calls go to the real backend.
 * The mock layer in auth.js / chat.js short-circuits before reaching this
 * when `VITE_MOCK` is true (default).
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.status = res.status;
    throw error;
  }

  return data;
}
