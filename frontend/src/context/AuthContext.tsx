'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('@appfit:token');
      if (storedToken) {
        try {
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://app-fit-backend.onrender.com').replace(/\/$/, '');
          const res = await fetch(`${baseUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (res.ok) {
            setToken(storedToken);
          } else {
            localStorage.removeItem('@appfit:token');
            setToken(null);
          }
        } catch {
          // Em caso de falta de conexão com a internet, mantemos o token optimista 
          // ou limpamos? Vamos manter até a primeira falha de API real.
          setToken(storedToken);
        }
      }
      setIsLoaded(true);
    };
    
    validateToken();
  }, []);

  const login = (jwt: string) => {
    localStorage.setItem('@appfit:token', jwt);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem('@appfit:token');
    setToken(null);
  };

  if (!isLoaded) {
    // Previne flash de redirecionamento enquanto carrega o estado do lado do cliente
    return null; 
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// --- AUTH GUARD --- //

const PROTECTED_ROUTES = [
  '/dashboard',
  '/scanner',
  '/progress',
  '/water',
  '/plan'
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/verify',
  '/paywall',
  '/onboarding'
];

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Checa se a rota atual começa com alguma das rotas protegidas
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    // Se for protegida e NÃO tiver autenticado, ejetar silenciosamente
    if (isProtected && !isAuthenticated) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, pathname, router]);

  if (isChecking) {
    // Para não piscar o dashboard vazio antes do redirecionamento
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};
