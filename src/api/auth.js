/**
 * Auth API — login & signup.
 *
 * Mock mode: stores users in localStorage, generates fake tokens.
 * Real mode: swap `USE_MOCK` to false — calls go through `apiRequest`.
 */

import { apiRequest } from './client';

const USE_MOCK = false;

// ── Mock helpers ──────────────────────────────────────────────

function getMockUsers() {
  const raw = localStorage.getItem('mock_users');
  if (!raw) {
    // Seed two demo users
    const seed = [
      {
        id: 'u1',
        username: 'ahmad',
        email: 'ahmad@test.com',
        password: 'password',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'u2',
        username: 'sarah',
        email: 'sarah@test.com',
        password: 'password',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('mock_users', JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

function saveMockUsers(users) {
  localStorage.setItem('mock_users', JSON.stringify(users));
}

function generateId() {
  return 'u' + Math.random().toString(36).slice(2, 10);
}

function generateToken(userId) {
  // Fake JWT-like token: base64({ userId, exp })
  const payload = { userId, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

export function parseToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────

export async function login(email, password) {
  if (!USE_MOCK) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Mock
  await delay(300);
  const users = getMockUsers();
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken(user.id);
  return { token };
}

export async function signup(username, email, password) {
  if (!USE_MOCK) {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  // Mock
  await delay(300);
  const users = getMockUsers();

  if (users.find((u) => u.email === email)) {
    throw new Error('Email already registered');
  }
  if (users.find((u) => u.username === username)) {
    throw new Error('Username already taken');
  }

  const newUser = {
    id: generateId(),
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveMockUsers(users);

  return { user_id: newUser.id, message: 'user created successfully' };
}

export function findUserByEmail(email) {
  if (!USE_MOCK) {
    return apiRequest(`/api/users?email=${encodeURIComponent(email)}`);
  }

  const users = getMockUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return null;
  return { id: user.id, username: user.username, email: user.email };
}

export function getCurrentUser(token) {
  const payload = parseToken(token);
  if (!payload) return null;
  if (!USE_MOCK) {
    return { id: payload.user_id, username: payload.username, email: payload.email };
  }
  const users = getMockUsers();
  const user = users.find((u) => u.id === payload.userId);
  if (!user) return null;
  return { id: user.id, username: user.username, email: user.email };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
