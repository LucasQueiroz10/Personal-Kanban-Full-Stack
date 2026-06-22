// Instância única do Prisma Client, compartilhada por toda a aplicação.
// Evita abrir múltiplas conexões com o banco ao importar este módulo várias vezes.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
