// Ponto de entrada da aplicação: carrega variáveis de ambiente, valida configuração
// essencial e inicia o servidor HTTP.

require('dotenv').config();

const app = require('./app');

// Falha rápido se variáveis críticas não estiverem configuradas,
// em vez de deixar o servidor subir "quebrado" silenciosamente.
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
  console.error('Verifique seu arquivo .env (veja .env.example como referência).');
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
