// Funções relacionadas a cards (tarefas dentro de uma lista).

import api from './api';

export async function createCard(listId, { title, description }) {
  const response = await api.post(`/lists/${listId}/cards`, { title, description });
  return response.data;
}

export async function updateCard(cardId, { title, description }) {
  const response = await api.put(`/cards/${cardId}`, { title, description });
  return response.data;
}

// Move um card para outra lista e/ou posição (chamado após o drag-and-drop).
export async function moveCard(cardId, { destinationListId, newPosition }) {
  const response = await api.put(`/cards/${cardId}/move`, { destinationListId, newPosition });
  return response.data;
}

export async function deleteCard(cardId) {
  await api.delete(`/cards/${cardId}`);
}
