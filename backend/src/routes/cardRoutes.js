const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { updateCard, moveCard, deleteCard } = require('../controllers/cardController');

const router = express.Router();

router.use(authMiddleware);

router.put('/:id', updateCard);
router.put('/:id/move', moveCard); // rota usada pelo drag-and-drop
router.delete('/:id', deleteCard);

module.exports = router;
