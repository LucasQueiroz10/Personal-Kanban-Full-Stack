// Funções de validação reutilizadas pelos controllers.
// Centralizar aqui evita duplicar regras de validação espalhadas pelo código,
// e facilita ajustar uma regra (ex: tamanho mínimo de senha) em um único lugar.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

// Valida títulos (de board, lista ou card): não vazio e dentro do tamanho máximo.
function isValidTitle(title) {
  return (
    typeof title === 'string' &&
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH
  );
}

function isValidDescription(description) {
  if (description === undefined || description === null) return true; // é opcional
  return typeof description === 'string' && description.length <= MAX_DESCRIPTION_LENGTH;
}

// Remove espaços extras e evita que strings vazias "  " passem como válidas.
function sanitizeText(text) {
  return typeof text === 'string' ? text.trim() : text;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidTitle,
  isValidDescription,
  sanitizeText,
  MIN_PASSWORD_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
};
