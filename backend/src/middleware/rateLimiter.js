// Rate limiter simples para rotas sensíveis (login e cadastro).
// Limita quantas tentativas um mesmo IP pode fazer em uma janela de tempo,
// dificultando ataques de força bruta contra senhas.
//
// Implementação em memória: suficiente para portfólio/projeto pequeno.
// Em produção com múltiplas instâncias do servidor, o ideal seria usar Redis.

const attemptsByIp = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 10;

function authRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  const record = attemptsByIp.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    // Nova janela de tempo para este IP
    attemptsByIp.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    });
  }

  record.count += 1;
  return next();
}

// Limpa registros antigos periodicamente para não acumular memória indefinidamente
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of attemptsByIp.entries()) {
    if (now - record.windowStart > WINDOW_MS) {
      attemptsByIp.delete(ip);
    }
  }
}, WINDOW_MS).unref();

module.exports = authRateLimiter;
