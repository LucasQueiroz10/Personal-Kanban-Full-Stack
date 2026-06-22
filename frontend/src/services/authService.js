// Funções relacionadas a autenticação: cadastro, login, logout.

import api from './api';

export async function registerUser({ name, email, password }) {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { token, user }
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
