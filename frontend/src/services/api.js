// Configuração central do cliente HTTP (axios).
// Toda chamada à API do backend passa por esta instância.

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor de requisição: anexa o token JWT em toda chamada, automaticamente.
// Assim os componentes não precisam se preocupar em passar o token manualmente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: se o token expirou ou é inválido (401),
// limpa a sessão local e redireciona para o login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Evita redirecionar se já estivermos na tela de login/cadastro
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
