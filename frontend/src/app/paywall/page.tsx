'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Zap, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProtocol } from '@/context/ProtocolContext';

export default function Paywall() {
  const router = useRouter();
  const { weight, targetWeight } = useProtocol();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate success
      router.push('/dashboard');
    }, 2000);
  };

  const kgToLose = weight && targetWeight ? Math.max(0, weight - targetWeight).toFixed(1) : '5.0';

  return (
    <div className="flex-1 flex flex-col pt-8 pb-12 px-6 overflow-y-auto w-full max-w-lg mx-auto relative duration-1000 animate-in slide-in-from-bottom-8 bg-slate-50 min-h-screen">
      
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[11px] border border-emerald-100 mb-2 uppercase tracking-wide shadow-sm">
          <Star className="w-3.5 h-3.5 fill-emerald-500 stroke-emerald-500" />
          <span>Protocolo Personalizado Gerado</span>
        </div>
        <h1 className="text-[32px] font-black text-slate-900 leading-tight tracking-tight">Seu plano guiado para perder <span className="text-emerald-500">{kgToLose}kg</span> está pronto.</h1>
        <p className="text-slate-500 text-[15px] px-2 font-medium leading-relaxed">A Inteligência Artificial calculou as quantidades exatas, horários e estratégias para o seu biotipo.</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 mb-8 mt-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-5">
        <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">O que está incluído:</h3>
        <ul className="space-y-4">
          {[
            'Protocolo diário guiado passo a passo',
            'Estratégia do Chá Seca Barriga de seg a sex',
            'Sucos Detox em jejum para desinchar',
            'Cálculo automático de hidratação ideal',
            'Scanner inteligente de refeições via foto'
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-[14px] font-medium text-slate-600">
              <Check className="w-5 h-5 text-emerald-500 stroke-[3] shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 mb-8 text-center bg-cyan-50 border border-cyan-100 rounded-[2rem] p-6 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        <p className="text-cyan-700 text-[11px] mb-1 uppercase tracking-widest font-black">Acesso Vitalício + IA</p>
        <div className="flex items-start justify-center gap-1 mt-2">
          <span className="text-cyan-600 font-bold mt-2">R$</span>
          <span className="text-[54px] font-black text-slate-900 tabular-nums leading-none">29<span className="text-[32px] text-slate-400">,90</span></span>
        </div>
        <div className="mt-4">
          <span className="text-[11px] text-cyan-700 bg-white shadow-sm border border-cyan-100 px-4 py-1.5 rounded-full font-extrabold uppercase tracking-wider">
            Taxa Única Sem Mensalidade
          </span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-3 py-[20px] bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-[0_15px_40px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)] disabled:opacity-70 disabled:pointer-events-none"
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
        ) : (
          <>
            <Lock className="w-[22px] h-[22px] stroke-[2.5]" />
            <span>Liberar Meu Protocolo</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
        <Shield className="w-4 h-4 stroke-[2.5]" />
        <span>Pagamento seguro e protegido (Simulação)</span>
      </div>

    </div>
  );
}
