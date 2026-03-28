'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyTokenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Aulinks de acesso são inválidos ou expiraram. Volte para a página de Login e solicite outro acesso.');
      return;
    }

    const verifyToken = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://app-fit-backend.onrender.com').replace(/\/$/, '');
        const res = await fetch(`${baseUrl}/auth/verify?token=${token}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Token inválido ou expirado.');
        }

        const data = await res.json();
        
        if (data.accessToken) {
          login(data.accessToken);
          router.replace('/dashboard');
        } else {
          throw new Error('Falha ao autenticar sua sessão.');
        }
      } catch (err: any) {
        setError(err.message || 'Falha ao processar o ticket mágico.');
      }
    };

    verifyToken();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 p-10 bg-[#111] border border-white/10 rounded-[32px] shadow-2xl max-w-sm w-full"
      >
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Falha no Acesso</h2>
            <p className="text-sm font-medium text-slate-400">
              {error}
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative mb-2">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-8 h-8 text-emerald-500" strokeWidth={2} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#111] rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Liberando aplicativo...</h2>
            <p className="text-sm font-medium text-slate-400">
              Descriptografando seu ticket seguro e construindo a sessão privada.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
