// Rodapé exibido em todas as páginas da aplicação.

import './Footer.css';

const YOUR_NAME = 'Lucas Queiroz Costa';
const GITHUB_URL = 'https://github.com/LucasQueiroz10/Personal-Kanban-Full-Stack';
const LINKEDIN_URL = 'https://www.linkedin.com/in/lucasqueirozcosta/'; // TODO: troque pelo seu link real
const EMAIL = 'lucasqueirozcosta696@gmail.com'; // TODO: troque pelo seu email real

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p className="app-footer-text">
        {YOUR_NAME} · {year}
      </p>
      <nav className="app-footer-links">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={`mailto:${EMAIL}`}>Email</a>
      </nav>
    </footer>
  );
}
