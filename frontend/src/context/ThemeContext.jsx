// Provider de tema: controla claro/escuro e persiste a escolha no localStorage.

import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextDefinition';

const STORAGE_KEY = 'theme';

// Decide o tema inicial: usa o que estiver salvo, ou cai para a preferência do sistema.
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Sempre que o tema mudar, aplica o atributo no <html> (o CSS reage a isso)
  // e persiste a escolha para a próxima visita.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
