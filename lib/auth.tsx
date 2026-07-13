"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => void;
}

// Context exportado (junto com o hook useAuth) para que TODA a árvore
// consuma exatamente o mesmo estado, compartilhado via o único
// <AuthProvider> montado no App.tsx — nunca uma cópia local por componente.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@amora.com';
const ADMIN_PASSWORD = 'admimasterpassword';
const USER_STORAGE_KEY = 'amora_user';
const REGISTERED_USERS_KEY = 'amora_registered_users';

function loadInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser && parsedUser.id) {
      return parsedUser as User;
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar usuário do localStorage:", error);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado único, criado UMA vez no Provider e compartilhado via Context por
  // toda a árvore (Login, Navbar, ProtectedRoute etc. consomem o MESMO estado
  // através de useAuth() — nunca criam sua própria cópia local via useState
  // isolado). O lazy initializer lê o localStorage de forma SÍNCRONA logo na
  // primeira renderização, então "loading" já nasce false: não há uma janela
  // assíncrona em que o guard de rota veria user=null antes da hidratação —
  // é essa janela que costuma causar o bug de "login não persiste".
  const [user, setUser] = useState<User | null>(() => loadInitialUser());
  const [loading, setLoading] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true);

    if (!email.trim()) {
      setLoading(false);
      return 'E-mail ou senha inválidos.';
    }

    if (password.length < 6) {
      setLoading(false);
      return 'E-mail ou senha inválidos.';
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = { id: 'admin-id', email, name: 'Admin', isAdmin: true };
      // Gravação SÍNCRONA no localStorage E no estado do Context ANTES de
      // qualquer navegação: o componente de Login pode desmontar logo em
      // seguida (navigate()), então nada disso pode depender de useEffect —
      // se dependesse, a gravação se perderia e o guard de rota (que lê o
      // MESMO Context) nunca veria o admin autenticado.
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
      } catch (error) {
        console.error('Erro ao gravar usuário no localStorage:', error);
      }
      setUser(adminUser);
      setLoading(false);
      return null;
    }

    let storedUsers: (User & { password?: string })[] = [];
    try {
      storedUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
    } catch {
      storedUsers = [];
    }

    const foundUser = storedUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const loggedInUser: User = {
        id: foundUser.id || Date.now().toString(),
        email: foundUser.email,
        name: foundUser.name,
        isAdmin: foundUser.email === ADMIN_EMAIL,
      };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      } catch (error) {
        console.error('Erro ao gravar usuário no localStorage:', error);
      }
      setUser(loggedInUser);
      setLoading(false);
      return null;
    }

    // Mensagem genérica por segurança (não revela se o e-mail existe)
    setLoading(false);
    return 'E-mail ou senha inválidos.';
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    setLoading(true);

    if (!name.trim()) {
      setLoading(false);
      return 'O nome é obrigatório.';
    }
    if (!email.trim()) {
      setLoading(false);
      return 'Informe seu e-mail.';
    }
    if (password.length < 6) {
      setLoading(false);
      return 'A senha deve ter no mínimo 6 caracteres.';
    }

    let storedUsers: (User & { password?: string })[] = [];
    try {
      storedUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
    } catch {
      storedUsers = [];
    }

    if (storedUsers.some((u) => u.email === email)) {
      setLoading(false);
      return 'Este e-mail já está cadastrado.';
    }

    const newUser = { id: Date.now().toString(), email, password, name, isAdmin: false };
    const updatedUsers = [...storedUsers, newUser];
    // Grava síncrono a lista de usuários registrados
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Erro ao gravar usuários registrados no localStorage:', error);
    }

    const loggedInUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isAdmin: newUser.email === ADMIN_EMAIL,
    };
    // Grava síncrono o usuário logado e atualiza o estado compartilhado do
    // Context ANTES de qualquer navegação subsequente (evita a corrida de
    // estado isolado entre Login e o guard de rota). register() faz o login
    // automático do usuário recém-criado.
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Erro ao gravar usuário no localStorage:', error);
    }
    setUser(loggedInUser);
    setLoading(false);

    return null;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value: AuthContextType = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook exportado — TODO consumidor (Navbar, Login, ProtectedRoute, Checkout,
// Admin...) DEVE importar e usar useAuth(), nunca o AuthContext cru, para
// garantir que sempre lê o MESMO estado compartilhado do Provider único
// montado em App.tsx.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}