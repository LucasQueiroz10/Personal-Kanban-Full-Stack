// Representa um único card (tarefa) dentro de uma lista.
// useSortable conecta este componente ao sistema de drag-and-drop do @dnd-kit.

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Card.css';

export default function Card({ card, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
      onDoubleClick={() => onEdit(card)}
    >
      <p className="kanban-card-title">{card.title}</p>
      {card.description && <p className="kanban-card-description">{card.description}</p>}
      <button
        className="kanban-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        aria-label={`Excluir card ${card.title}`}
        title="Excluir card"
      >
        ×
      </button>
    </div>
  );
}
