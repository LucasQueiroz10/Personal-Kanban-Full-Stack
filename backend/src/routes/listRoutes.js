const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { updateList, deleteList } = require('../controllers/listController');
const { createCard } = require('../controllers/cardController');

const router = express.Router();

router.use(authMiddleware);

router.put('/:id', updateList);
router.delete('/:id', deleteList);

// Criar card acontece "dentro" de uma lista: POST /lists/:listId/cards
router.post('/:listId/cards', createCard);

module.exports = router;
