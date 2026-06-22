// Controller de cards (as tarefas dentro de cada lista).

const prisma = require('../prisma/client');
const { isValidTitle, isValidDescription, sanitizeText } = require('../utils/validators');
const { assertBoardOwnership } = require('./listController');

// Confirma que a lista existe e que seu board pertence ao usuário logado.
async function assertListOwnershipForCard(listId, userId) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) return { status: 404, error: 'Lista não encontrada.', list: null };
  const ownershipError = await assertBoardOwnership(list.boardId, userId);
  if (ownershipError) return { ...ownershipError, list: null };
  return { status: null, error: null, list };
}

// POST /lists/:listId/cards -> cria um novo card dentro de uma lista
async function createCard(req, res) {
  try {
    const { listId } = req.params;
    const title = sanitizeText(req.body.title);
    const description = sanitizeText(req.body.description) || null;

    if (!isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }
    if (!isValidDescription(description)) {
      return res.status(400).json({ error: 'Descrição muito longa (máximo 2000 caracteres).' });
    }

    const { status, error, list } = await assertListOwnershipForCard(listId, req.userId);
    if (error) {
      return res.status(status).json({ error });
    }

    const cardCount = await prisma.card.count({ where: { listId: list.id } });

    const card = await prisma.card.create({
      data: { title, description, listId: list.id, position: cardCount },
    });

    return res.status(201).json(card);
  } catch (error) {
    console.error('Erro em createCard:', error);
    return res.status(500).json({ error: 'Erro ao criar card.' });
  }
}

// PUT /cards/:id -> atualiza título e/ou descrição do card
async function updateCard(req, res) {
  try {
    const { id } = req.params;
    const hasTitle = req.body.title !== undefined;
    const hasDescription = req.body.description !== undefined;

    const title = hasTitle ? sanitizeText(req.body.title) : undefined;
    const description = hasDescription ? sanitizeText(req.body.description) || null : undefined;

    if (hasTitle && !isValidTitle(title)) {
      return res.status(400).json({ error: 'Título inválido (1 a 120 caracteres).' });
    }
    if (hasDescription && !isValidDescription(description)) {
      return res.status(400).json({ error: 'Descrição muito longa (máximo 2000 caracteres).' });
    }

    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado.' });
    }

    const ownership = await assertListOwnershipForCard(card.listId, req.userId);
    if (ownership.error) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        ...(hasTitle && { title }),
        ...(hasDescription && { description }),
      },
    });

    return res.json(updatedCard);
  } catch (error) {
    console.error('Erro em updateCard:', error);
    return res.status(500).json({ error: 'Erro ao atualizar card.' });
  }
}

// PUT /cards/:id/move -> move o card para outra lista e/ou outra posição.
// É esta rota que o frontend chama quando o usuário solta um card após arrastar (drag-and-drop).
//
// Corpo esperado: { destinationListId: string, newPosition: number (>= 0) }
//
// Estratégia de posicionamento: ao mover um card, recalculamos a posição (0, 1, 2...)
// de todos os cards afetados, tanto na lista de origem quanto na de destino.
// Isso é mais simples de entender e debugar do que usar posições fracionárias,
// e é totalmente adequado para o volume de dados de um projeto como este.
async function moveCard(req, res) {
  try {
    const { id } = req.params;
    const { destinationListId, newPosition } = req.body;

    if (!destinationListId || typeof destinationListId !== 'string') {
      return res.status(400).json({ error: 'destinationListId é obrigatório.' });
    }
    if (typeof newPosition !== 'number' || newPosition < 0 || !Number.isInteger(newPosition)) {
      return res.status(400).json({ error: 'newPosition deve ser um número inteiro >= 0.' });
    }

    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado.' });
    }

    // Verifica que o usuário tem acesso tanto à lista de origem quanto à de destino.
    // Isso evita que alguém mova um card seu para dentro de um board de outro usuário,
    // ou mova um card de um board que não é dele.
    const originOwnership = await assertListOwnershipForCard(card.listId, req.userId);
    if (originOwnership.error) {
      return res.status(originOwnership.status).json({ error: originOwnership.error });
    }
    const destinationOwnership = await assertListOwnershipForCard(destinationListId, req.userId);
    if (destinationOwnership.error) {
      return res.status(destinationOwnership.status).json({ error: destinationOwnership.error });
    }

    const originListId = card.listId;

    // Tudo dentro de $transaction: ou todas as atualizações de posição acontecem,
    // ou nenhuma acontece. Isso evita o banco ficar com posições inconsistentes
    // se o servidor cair no meio da operação.
    await prisma.$transaction(async (tx) => {
      if (originListId === destinationListId) {
        // Caso 1: o card mudou de posição DENTRO DA MESMA lista.
        const siblingCards = await tx.card.findMany({
          where: { listId: originListId, id: { not: id } },
          orderBy: { position: 'asc' },
        });

        const clampedPosition = Math.min(newPosition, siblingCards.length);
        siblingCards.splice(clampedPosition, 0, card);

        await Promise.all(
          siblingCards.map((c, index) =>
            tx.card.update({ where: { id: c.id }, data: { position: index } })
          )
        );
      } else {
        // Caso 2: o card mudou de lista.

        // 2a. Fecha o "buraco" deixado na lista de origem.
        const remainingInOrigin = await tx.card.findMany({
          where: { listId: originListId, id: { not: id } },
          orderBy: { position: 'asc' },
        });
        await Promise.all(
          remainingInOrigin.map((c, index) =>
            tx.card.update({ where: { id: c.id }, data: { position: index } })
          )
        );

        // 2b. Insere o card na lista de destino, na posição solicitada.
        const cardsInDestination = await tx.card.findMany({
          where: { listId: destinationListId },
          orderBy: { position: 'asc' },
        });
        const clampedPosition = Math.min(newPosition, cardsInDestination.length);
        cardsInDestination.splice(clampedPosition, 0, card);

        await Promise.all(
          cardsInDestination.map((c, index) =>
            tx.card.update({
              where: { id: c.id },
              data: { position: index, listId: destinationListId },
            })
          )
        );
      }
    });

    const updatedCard = await prisma.card.findUnique({ where: { id } });
    return res.json(updatedCard);
  } catch (error) {
    console.error('Erro em moveCard:', error);
    return res.status(500).json({ error: 'Erro ao mover card.' });
  }
}

// DELETE /cards/:id -> remove o card
async function deleteCard(req, res) {
  try {
    const { id } = req.params;

    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) {
      return res.status(404).json({ error: 'Card não encontrado.' });
    }

    const ownership = await assertListOwnershipForCard(card.listId, req.userId);
    if (ownership.error) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    await prisma.card.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro em deleteCard:', error);
    return res.status(500).json({ error: 'Erro ao excluir card.' });
  }
}

module.exports = { createCard, updateCard, moveCard, deleteCard };
