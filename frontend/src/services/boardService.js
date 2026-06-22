// Funções relacionadas a boards (quadros).

import api from './api';

export async function fetchBoards() {
  const response = await api.get('/boards');
  return response.data;
}

export async function fetchBoardById(boardId) {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
}

export async function createBoard(title) {
  const response = await api.post('/boards', { title });
  return response.data;
}

export async function updateBoard(boardId, title) {
  const response = await api.put(`/boards/${boardId}`, { title });
  return response.data;
}

export async function deleteBoard(boardId) {
  await api.delete(`/boards/${boardId}`);
}
