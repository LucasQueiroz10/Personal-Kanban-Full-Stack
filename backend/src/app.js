// Configuração principal da aplicação Express.
// Aqui registramos os middlewares globais de segurança e conectamos todas as rotas.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();

// helmet: define cabeçalhos HTTP de segurança (ex: evita sniffing de MIME type,
// desativa alguns vetores comuns de ataque). Boa prática padrão em qualquer API Express.
app.use(helmet());

// Restringe quais origens podem chamar esta API.
// Em desenvolvimento, liberamos localhost; em produção, defina FRONTEND_URL no .env.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Limita o tamanho do corpo das requisições JSON, evitando payloads gigantes maliciosos.
app.use(express.json({ limit: '100kb' }));

// Rota de teste simples, útil para verificar se a API está no ar (ex: health check em deploy)
app.get('/', (req, res) => {
  res.json({ message: 'API do Kanban está rodando.' });
});

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);

// Rota não encontrada (qualquer URL que não bateu em nenhuma rota acima)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Middleware de erro genérico: captura qualquer erro não tratado.
// Não expõe detalhes internos (stack trace) na resposta, apenas no log do servidor.
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
