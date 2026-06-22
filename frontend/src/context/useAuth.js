// Hook customizado para consumir o AuthContext com mais facilidade
// e validar que está sendo usado dentro de um <AuthProvider>.

import { useContext } from 'react';
import { AuthContext } from './AuthContextDefinition';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>.');
  }
  return context;
}
