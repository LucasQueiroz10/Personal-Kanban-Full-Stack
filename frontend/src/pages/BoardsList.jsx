import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBoards, createBoard, deleteBoard } from '../services/boardService';
import { useAuth } from '../context/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import './BoardsList.css';

export default function BoardsList() {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchBoards();
      setBoards(data);
    } catch {
      setError('Não foi possível carregar seus quadros.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar a página; padrão correto para este caso.
    loadBoards();
  }, [loadBoards]);

  async function handleCreateBoard(event) {
    event.preventDefault();
    const title = newBoardTitle.trim();
    if (!title) return;

    try {
      const board = await createBoard(title);
      setBoards((prev) => [board, ...prev]);
      setNewBoardTitle('');
    } catch {
      setError('Não foi possível criar o quadro.');
    }
  }

  async function handleDeleteBoard(boardId, event) {
    event.preventDefault(); // evita navegar pelo <Link> ao clicar em excluir
    event.stopPropagation();

    const confirmed = window.confirm('Excluir este quadro e todo o seu conteúdo?');
    if (!confirmed) return;

    try {
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch {
      setError('Não foi possível excluir o quadro.');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="boards-page">
      <header className="boards-header">
        <h1>Meus quadros</h1>
        <div className="boards-header-actions">
          <ThemeToggle />
          <span className="boards-user-name">Olá, {user?.name}</span>
          <button className="boards-logout-btn" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <form className="boards-new-form" onSubmit={handleCreateBoard}>
        <input
          type="text"
          placeholder="Nome do novo quadro (ex: Projeto Pessoal)"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          maxLength={120}
        />
        <button type="submit">Criar quadro</button>
      </form>

      {error && <p className="boards-error" role="alert">{error}</p>}

      {isLoading ? (
        <p className="boards-loading">Carregando quadros...</p>
      ) : boards.length === 0 ? (
        <p className="boards-empty">
          Você ainda não tem nenhum quadro. Crie o primeiro acima para começar a organizar suas tarefas.
        </p>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <Link to={`/boards/${board.id}`} key={board.id} className="board-card">
              <span className="board-card-title">{board.title}</span>
              <button
                className="board-card-delete"
                onClick={(e) => handleDeleteBoard(board.id, e)}
                aria-label={`Excluir quadro ${board.title}`}
                title="Excluir quadro"
              >
                ×
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
