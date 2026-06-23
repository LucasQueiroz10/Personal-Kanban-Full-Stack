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

  // IMPORTANTE: o elemento com setNodeRef é o único que pode ter "transform" e
  // "transition" no estilo — é nele que o @dnd-kit calcula a posição durante o
  // arrasto. Qualquer outro transform (como a rotação "post-it") aplicado neste
  // mesmo elemento entra em conflito com esse cálculo e faz o card "não acompanhar"
  // o mouse. Por isso a rotação decorativa fica num <div> interno separado,
  // controlado só pelo CSS (classe .kanban-card-inner), nunca por este estilo aqui.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card-wrapper"
      {...attributes}
      {...listeners}
    >
      <div
        className={`kanban-card ${isDragging ? 'kanban-card--dragging' : ''}`}
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
    </div>
  );
}
