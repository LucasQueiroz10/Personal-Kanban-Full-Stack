// Controller de autenticação: cadastro e login.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { isValidEmail, isValidPassword, sanitizeText, MIN_PASSWORD_LENGTH } = require('../utils/validators');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = '7d';

// POST /auth/register
async function register(req, res) {
  try {
    const name = sanitizeText(req.body.name);
    const email = sanitizeText(req.body.email)?.toLowerCase();
    const { password } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Nome é obrigatório (mínimo 2 caracteres).' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Mensagem genérica: evita confirmar para um atacante quais emails já têm conta
      return res.status(409).json({ error: 'Não foi possível concluir o cadastro.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }, // nunca seleciona a senha
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Erro em register:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const email = sanitizeText(req.body.email)?.toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Mensagem idêntica para "email não existe" e "senha errada":
    // não revelamos qual dos dois estava incorreto.
    const invalidCredentialsResponse = () =>
      res.status(401).json({ error: 'Email ou senha inválidos.' });

    if (!user) {
      return invalidCredentialsResponse();
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return invalidCredentialsResponse();
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Erro em login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login.' });
  }
}

module.exports = { register, login };
