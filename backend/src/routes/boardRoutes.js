const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { createList } = require('../controllers/listController');

const router = express.Router();

// Todas as rotas abaixo exigem usuário autenticado
router.use(authMiddleware);

router.get('/', listBoards);
router.get('/:id', getBoard);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

// Criar lista acontece "dentro" de um board: POST /boards/:boardId/lists
router.post('/:boardId/lists', createList);

module.exports = router;
