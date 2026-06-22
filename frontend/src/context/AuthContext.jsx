// Provider de autenticação: guarda o usuário logado e expõe login/logout
// para qualquer componente da árvore, sem precisar passar props manualmente.

import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition';
import { loginUser, registerUser, logoutUser } from '../services/authService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao carregar a aplicação, recupera a sessão salva no localStorage (se houver).
  // Roda apenas uma vez, na montagem do provider — é o ponto de entrada correto
  // para sincronizar o estado do React com o localStorage (uma fonte externa).
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única da sessão a partir do localStorage ao montar.
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  async function login({ email, password }) {
    const data = await loginUser({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register({ name, email, password }) {
    await registerUser({ name, email, password });
    // Após cadastrar, fazemos login automaticamente para uma experiência mais fluida
    return login({ email, password });
  }

  function logout() {
    logoutUser();
    setUser(null);
  }

  const value = { user, isLoading, login, register, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
