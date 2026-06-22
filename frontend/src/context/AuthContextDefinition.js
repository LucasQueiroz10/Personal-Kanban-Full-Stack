// Definição do Context em arquivo isolado, separado do Provider.
// Mantém o Fast Refresh do Vite funcionando corretamente (regra react-refresh/only-export-components).

import { createContext } from 'react';

export const AuthContext = createContext(null);
