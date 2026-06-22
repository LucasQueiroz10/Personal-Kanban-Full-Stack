// Definição do Context em arquivo isolado, separado do Provider.
// Mantém o Fast Refresh do Vite funcionando corretamente.

import { createContext } from 'react';

export const ThemeContext = createContext(null);
