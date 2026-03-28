'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor, informe um email válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.secaapp.com').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao processar sua solicitação.');
      }

      const data = await res.json();
      localStorage.setItem('@appfit:token', data.accessToken);
      
      // FORÇAR REDIRECIONAMENTO IMEDIATO
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Houve um erro ao enviar o link mágico.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Blooms */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <p className="font-black text-2xl tracking-tighter text-white mb-2">
            SECA<span className="text-[#21C55D]">APP</span>
          </p>
          <h1 className="text-[32px] font-black text-white tracking-tight leading-tight">Acesso Assinantes</h1>
          <p className="text-slate-400 font-medium mt-2">Validação rápida em 1 clique. Zero senhas.</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-[28px] p-8 shadow-2xl relative z-10">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-3">Enviado!</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Um link de acesso exclusivo e seguro foi enviado para <b className="text-white">{email}</b>.<br/><br/>Abra seu email e clique no botão para entrar.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Qual e-mail você utilizou na compra?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="email"
                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold rounded-xl p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#21C55D] hover:bg-[#16A34A] text-white py-4 rounded-2xl font-black text-lg shadow-[0_15px_30px_-5px_rgba(34,197,94,0.3)] border-b-[3px] border-[#15803d] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    Validando...
                  </>
                ) : (
                  <>
                    Receber Acesso <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 pt-2 text-slate-500 font-medium text-xs">
                <ShieldCheck className="w-4 h-4" />
                <p>Nenhuma senha obrigatória. Acesso blindado.</p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
