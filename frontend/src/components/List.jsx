// Representa uma lista (coluna) do board, contendo seus cards.
// useDroppable + SortableContext permitem que cards sejam soltos dentro desta lista.

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';
import './List.css';

export default function List({ list, onAddCard, onDeleteCard, onEditCard, onDeleteList }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  });

  const cardIds = list.cards.map((card) => card.id);

  function handleAddCard(event) {
    event.preventDefault();
    const title = newCardTitle.trim();
    if (!title) return;

    onAddCard(list.id, title);
    setNewCardTitle('');
    setIsAddingCard(false);
  }

  return (
    <div className="kanban-list">
      <div className="kanban-list-header">
        <h3 className="kanban-list-title">{list.title}</h3>
        <button
          className="kanban-list-delete"
          onClick={() => onDeleteList(list.id)}
          aria-label={`Excluir lista ${list.title}`}
          title="Excluir lista"
        >
          ×
        </button>
      </div>

      <div ref={setNodeRef} className="kanban-list-cards">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} onEdit={onEditCard} />
          ))}
        </SortableContext>
      </div>

      {isAddingCard ? (
        <form className="kanban-add-card-form" onSubmit={handleAddCard}>
          <textarea
            autoFocus
            placeholder="Título do card"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            maxLength={120}
            rows={2}
          />
          <div className="kanban-add-card-actions">
            <button type="submit">Adicionar</button>
            <button type="button" onClick={() => setIsAddingCard(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button className="kanban-add-card-trigger" onClick={() => setIsAddingCard(true)}>
          + Adicionar card
        </button>
      )}
    </div>
  );
}
