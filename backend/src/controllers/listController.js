// Controller de listas (colunas dentro de um board, ex: "To Do", "Doing", "Done").

const prisma = require('../prisma/client');
const { isValidTitle, sanitizeText } = require('../utils/validators');

// Confirma que o board existe e pertence ao usuário logado.
// Retorna null se estiver tudo certo, ou um objeto { status, error } caso contrário.
async function assertBoardOwnership(boardId, userId) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return { status: 404, error: 'Board não encontrado.' };
  if (board.ownerId !== userId) return { status: 403, error: 'Acesso negado.' };
  return null;
}

// Confirma que a lista existe e que o board dela pertence ao usuário logado.
async function assertListOwnership(listId, userId) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) return { status: 404, error: 'Lista não encontrada.', list: null };
  const ownershipError = await assertBoardOwnership(list.boardId, userId);
  if (ownershipError) return { ...ownershipError, list: null };
  return { status: null, error: null, list };
}

// POST /boards/:boardId/lists -> cria uma nova lista dentro de um board
async function createList(req, res) {
  try {
    const { boardId } = req.params;
    const title = sanitizeText(req.body.title);

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }

    const ownershipError = await assertBoardOwnership(boardId, req.userId);
    if (ownershipError) {
      return res.status(ownershipError.status).json({ error: ownershipError.error });
    }

    // A nova lista entra no final: posição = quantidade de listas já existentes no board
    const listCount = await prisma.list.count({ where: { boardId } });

    const list = await prisma.list.create({
      data: { title, boardId, position: listCount },
    });

    return res.status(201).json(list);
  } catch (error) {
    console.error('Erro em createList:', error);
    return res.status(500).json({ error: 'Erro ao criar lista.' });
  }
}

// PUT /lists/:id -> atualiza o título da lista
async function updateList(req, res) {
  try {
    const { id } = req.params;
    const title = sanitizeText(req.body.title);

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }

    const { status, error, list } = await assertListOwnership(id, req.userId);
    if (error) {
      return res.status(status).json({ error });
    }

    const updatedList = await prisma.list.update({
      where: { id: list.id },
      data: { title },
    });

    return res.json(updatedList);
  } catch (error) {
    console.error('Erro em updateList:', error);
    return res.status(500).json({ error: 'Erro ao atualizar lista.' });
  }
}

// DELETE /lists/:id -> remove a lista (cards são removidos em cascata pelo banco)
async function deleteList(req, res) {
  try {
    const { id } = req.params;

    const { status, error, list } = await assertListOwnership(id, req.userId);
    if (error) {
      return res.status(status).json({ error });
    }

    await prisma.list.delete({ where: { id: list.id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro em deleteList:', error);
    return res.status(500).json({ error: 'Erro ao excluir lista.' });
  }
}

module.exports = { createList, updateList, deleteList, assertBoardOwnership, assertListOwnership };
