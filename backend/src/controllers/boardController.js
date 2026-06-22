// Controller de boards (quadros).
// Todas as rotas aqui exigem usuário autenticado (req.userId é definido pelo authMiddleware).

const prisma = require('../prisma/client');
const { isValidTitle, sanitizeText } = require('../utils/validators');

// GET /boards -> lista todos os boards do usuário logado
async function listBoards(req, res) {
  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(boards);
  } catch (error) {
    console.error('Erro em listBoards:', error);
    return res.status(500).json({ error: 'Erro ao buscar boards.' });
  }
}

// GET /boards/:id -> retorna um board específico, com listas e cards aninhados
async function getBoard(req, res) {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board não encontrado.' });
    }
    // IMPORTANTE: garante que o usuário só acessa boards que ele mesmo criou.
    if (board.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem acesso a este board.' });
    }

    return res.json(board);
  } catch (error) {
    console.error('Erro em getBoard:', error);
    return res.status(500).json({ error: 'Erro ao buscar board.' });
  }
}

// POST /boards -> cria um novo board
async function createBoard(req, res) {
  try {
    const title = sanitizeText(req.body.title);

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }

    const board = await prisma.board.create({
      data: { title, ownerId: req.userId },
    });

    return res.status(201).json(board);
  } catch (error) {
    console.error('Erro em createBoard:', error);
    return res.status(500).json({ error: 'Erro ao criar board.' });
  }
}

// PUT /boards/:id -> atualiza o título do board
async function updateBoard(req, res) {
  try {
    const { id } = req.params;
    const title = sanitizeText(req.body.title);

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }

    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return res.status(404).json({ error: 'Board não encontrado.' });
    }
    if (board.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem acesso a este board.' });
    }

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: { title },
    });

    return res.json(updatedBoard);
  } catch (error) {
    console.error('Erro em updateBoard:', error);
    return res.status(500).json({ error: 'Erro ao atualizar board.' });
  }
}

// DELETE /boards/:id -> remove o board (listas e cards são removidos em cascata pelo banco)
async function deleteBoard(req, res) {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      return res.status(404).json({ error: 'Board não encontrado.' });
    }
    if (board.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem acesso a este board.' });
    }

    await prisma.board.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro em deleteBoard:', error);
    return res.status(500).json({ error: 'Erro ao excluir board.' });
  }
}

module.exports = { listBoards, getBoard, createBoard, updateBoard, deleteBoard };
