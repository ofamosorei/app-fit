'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CreatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 4) {
      setError('Sua senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação da senha não confere.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/auth/me/password', {
        method: 'POST',
        body: JSON.stringify({ password, confirmPassword }),
      });

      window.dispatchEvent(new Event('appfit:profile-updated'));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao definir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <p className="font-black text-2xl tracking-tighter text-white mb-2">
            SECA<span className="text-[#21C55D]">APP</span>
          </p>
          <h1 className="text-[32px] font-black text-white tracking-tight leading-tight">Defina sua senha</h1>
          <p className="text-slate-400 font-medium mt-2">No primeiro acesso, escolha uma senha para entrar mais rápido nas próximas vezes.</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-[28px] p-8 shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Crie sua senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="new-password"
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Confirme sua senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                  autoComplete="new-password"
                  className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold rounded-xl p-3">
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
                  Salvando...
                </>
              ) : (
                'Salvar senha'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
