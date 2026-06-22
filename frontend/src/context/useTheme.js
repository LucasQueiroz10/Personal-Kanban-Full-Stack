// Hook customizado para consumir o ThemeContext com mais facilidade.

import { useContext } from 'react';
import { ThemeContext } from './ThemeContextDefinition';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de um <ThemeProvider>.');
  }
  return context;
}
