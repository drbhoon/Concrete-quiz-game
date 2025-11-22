// services/api.ts - PRODUCTION VERSION (CORRECTED)
import { User, QuizAttempt } from '../types';

const API_BASE = '/api';

type SaveAttemptPayload = Omit<QuizAttempt, 'date'>;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const login = async (username: string): Promise<User> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  return handleResponse(response);
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users`);
  return handleResponse(response);
};

export const saveAttempt = async (username: string, attempt: SaveAttemptPayload): Promise<User> => {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt)
  });
  return handleResponse(response);
};

export const resetLeaderboard = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'DELETE'
  });
  return handleResponse(response);
};