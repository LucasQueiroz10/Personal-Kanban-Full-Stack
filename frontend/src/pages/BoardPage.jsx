import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { fetchBoardById } from '../services/boardService';
import { createList, deleteList } from '../services/listService';
import { createCard, deleteCard, moveCard, updateCard } from '../services/cardService';
import List from '../components/List';
import './BoardPage.css';

export default function BoardPage() {
  const { boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Exige um pequeno deslocamento antes de iniciar o drag,
  // para que um simples clique (ex: duplo clique para editar) não seja interpretado como arrasto.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchBoardById(boardId);
      setBoard(data);
    } catch {
      setError('Não foi possível carregar este quadro.');
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar a página; padrão correto para este caso.
    loadBoard();
  }, [loadBoard]);

  async function handleAddList(event) {
    event.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;

    try {
      const list = await createList(boardId, title);
      setBoard((prev) => ({ ...prev, lists: [...prev.lists, { ...list, cards: [] }] }));
      setNewListTitle('');
      setIsAddingList(false);
    } catch {
      setError('Não foi possível criar a lista.');
    }
  }

  async function handleDeleteList(listId) {
    const confirmed = window.confirm('Excluir esta lista e todos os seus cards?');
    if (!confirmed) return;

    try {
      await deleteList(listId);
      setBoard((prev) => ({ ...prev, lists: prev.lists.filter((l) => l.id !== listId) }));
    } catch {
      setError('Não foi possível excluir a lista.');
    }
  }

  async function handleAddCard(listId, title) {
    try {
      const card = await createCard(listId, { title });
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, card] } : l
        ),
      }));
    } catch {
      setError('Não foi possível criar o card.');
    }
  }

  async function handleDeleteCard(cardId) {
    try {
      await deleteCard(cardId);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((l) => ({
          ...l,
          cards: l.cards.filter((c) => c.id !== cardId),
        })),
      }));
    } catch {
      setError('Não foi possível excluir o card.');
    }
  }

  // Edição simples via prompt nativo do navegador.
  // Suficiente para portfólio; pode evoluir para um modal customizado depois.
  async function handleEditCard(card) {
    const newTitle = window.prompt('Editar título do card:', card.title);
    if (newTitle === null) return; // usuário cancelou

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || trimmedTitle === card.title) return;

    try {
      const updatedCard = await updateCard(card.id, { title: trimmedTitle });
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c.id === card.id ? updatedCard : c)),
        })),
      }));
    } catch {
      setError('Não foi possível atualizar o card.');
    }
  }

  // Encontra em qual lista um determinado card está, dado o id do card.
  const findListByCardId = useCallback(
    (cardId) => board?.lists.find((l) => l.cards.some((c) => c.id === cardId)),
    [board]
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceList = findListByCardId(active.id);
    if (!sourceList) return;

    // O card pode ser solto sobre outro card (over.id é um cardId)
    // ou diretamente sobre uma lista vazia (over.id é um listId).
    const destinationList =
      board.lists.find((l) => l.id === over.id) || findListByCardId(over.id);
    if (!destinationList) return;

    const sourceCardIndex = sourceList.cards.findIndex((c) => c.id === active.id);
    const destinationCardIndex = destinationList.cards.findIndex((c) => c.id === over.id);

    // Se "over" for a própria lista (não um card), o destino é o final da lista.
    const newPosition =
      destinationCardIndex >= 0 ? destinationCardIndex : destinationList.cards.length;

    // Atualização otimista: já reflete a mudança na tela antes da resposta do servidor,
    // para uma sensação de arrasto instantânea.
    setBoard((prev) => {
      const lists = prev.lists.map((l) => ({ ...l, cards: [...l.cards] }));
      const fromList = lists.find((l) => l.id === sourceList.id);
      const toList = lists.find((l) => l.id === destinationList.id);

      const [movedCard] = fromList.cards.splice(sourceCardIndex, 1);
      const insertAt = Math.min(newPosition, toList.cards.length);
      toList.cards.splice(insertAt, 0, movedCard);

      return { ...prev, lists };
    });

    try {
      await moveCard(active.id, {
        destinationListId: destinationList.id,
        newPosition,
      });
    } catch {
      setError('Não foi possível mover o card. Recarregando o quadro...');
      loadBoard(); // em caso de falha, recarrega o estado real do servidor
    }
  }

  if (isLoading) return <p className="board-page-loading">Carregando quadro...</p>;
  if (!board) return <p className="board-page-loading">Quadro não encontrado.</p>;

  return (
    <div className="board-page">
      <header className="board-page-header">
        <Link to="/boards" className="board-page-back">← Meus quadros</Link>
        <h1>{board.title}</h1>
      </header>

      {error && <p className="board-page-error" role="alert">{error}</p>}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="board-page-lists">
          {board.lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onEditCard={handleEditCard}
              onDeleteList={handleDeleteList}
            />
          ))}

          <div className="board-page-add-list">
            {isAddingList ? (
              <form onSubmit={handleAddList}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Título da lista"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  maxLength={120}
                />
                <div className="board-page-add-list-actions">
                  <button type="submit">Adicionar lista</button>
                  <button type="button" onClick={() => setIsAddingList(false)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button className="board-page-add-list-trigger" onClick={() => setIsAddingList(true)}>
                + Adicionar lista
              </button>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
