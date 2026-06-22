// Funções relacionadas a listas (colunas dentro de um board).

import api from './api';

export async function createList(boardId, title) {
  const response = await api.post(`/boards/${boardId}/lists`, { title });
  return response.data;
}

export async function updateList(listId, title) {
  const response = await api.put(`/lists/${listId}`, { title });
  return response.data;
}

export async function deleteList(listId) {
  await api.delete(`/lists/${listId}`);
}
