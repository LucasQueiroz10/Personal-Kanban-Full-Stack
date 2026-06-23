## Lucas Queiroz Costa

# Kanban App

Aplicação de quadro Kanban (estilo Trello) full stack, construída como projeto de portfólio / faculdade.

## Stack

**Frontend:** React + Vite, React Router, Axios, @dnd-kit (drag-and-drop)
**Backend:** Node.js + Express, autenticação via JWT, bcrypt para hashing de senha
**Banco de dados:** PostgreSQL via Prisma ORM (testado com Neon)

## Funcionalidades

- Cadastro e login de usuários (JWT)
- Criação de quadros (boards), listas (colunas) e cards (tarefas)
- Reordenação de cards via drag-and-drop, dentro de uma lista ou entre listas
- Cada usuário só acessa os próprios quadros (autorização por dono)

## Estrutura do repositório

```
kanban-app/
├── backend/    # API REST (Node.js + Express + Prisma)
└── frontend/   # Interface (React + Vite)
```

## Como rodar localmente

### 1. Banco de dados

Crie um banco PostgreSQL gratuito em [Neon](https://neon.tech) ou [Supabase](https://supabase.com),
e copie a connection string (formato `postgresql://usuario:senha@host/banco`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env e preencha DATABASE_URL e JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

A API sobe em `http://localhost:3001`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Decisões de arquitetura

- **Posicionamento de cards:** ao mover um card (drag-and-drop), o backend recalcula a posição
  (0, 1, 2...) de todos os cards afetados dentro de uma transação do Prisma, garantindo
  consistência mesmo se algo falhar no meio da operação.
- **Autorização:** toda rota de lista/card verifica que o board correspondente pertence ao
  usuário autenticado antes de permitir leitura ou escrita.
- **Segurança:** senhas com hash via bcrypt, JWT com expiração, rate limiting nas rotas de
  autenticação, headers de segurança via helmet, e CORS restrito à origem do frontend.

## Possíveis evoluções futuras

- Modal customizado para edição de cards (atualmente usa `window.prompt`)
- Testes automatizados (Jest no backend, React Testing Library no frontend)
- WebSockets para colaboração em tempo real entre múltiplos usuários
- Migração gradual para TypeScript
