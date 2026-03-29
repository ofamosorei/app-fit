'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null; // Novo campo
  login: (jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('@appfit:token');
      if (storedToken) {
        try {
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.secaapp.com').replace(/\/$/, '');
          const res = await fetch(`${baseUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (res.ok) {
            const userData = await res.json();
            setToken(storedToken);
            setUser(userData);
          } else {
            localStorage.removeItem('@appfit:token');
            setToken(null);
            setUser(null);
          }
        } catch {
          // Em caso de alerta de rede
          setToken(storedToken);
        }
      }
      setIsLoaded(true);
    };
    
    validateToken();
  }, []);

  // Update user state globally after an onboarding
  useEffect(() => {
    function validateToken() {
        const storedToken = localStorage.getItem('@appfit:token');
        if (storedToken) {
          const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.secaapp.com').replace(/\/$/, '');
          fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${storedToken}` } })
            .then(res => res.ok ? res.json() : null)
            .then(userData => { if (userData) setUser(userData); })
            .catch(() => {});
        }
    }

    // Escuta evento customizado de atualização de perfil para não precisar recarregar a página
    const handleProfileUpdate = () => validateToken();
    window.addEventListener('appfit:profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('appfit:profile-updated', handleProfileUpdate);
  }, []);

  const login = (jwt: string) => {
    localStorage.setItem('@appfit:token', jwt);
    setToken(jwt);
    // Dispara validação pra carregar o User
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.secaapp.com').replace(/\/$/, '');
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${jwt}` } })
      .then(res => res.ok ? res.json() : null)
      .then(userData => { if (userData) setUser(userData); })
      .catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('@appfit:token');
    setToken(null);
    setUser(null);
  };

  if (!isLoaded) return null; 

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, user, login, logout }}>
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
  '/onboarding',
  '/dashboard-preview',
  '/plan-preview',
  '/plan-preview-2'
];

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) {
      setIsChecking(false);
      return;
    }

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
