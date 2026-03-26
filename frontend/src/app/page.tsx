'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, Droplets, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-1000 overflow-y-auto w-full bg-slate-50 min-h-screen">
      <div className="max-w-3xl w-full space-y-16 text-center py-12">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[13px] border border-emerald-100 mb-4 tracking-wide shadow-sm">
            <Brain className="w-4 h-4 stroke-[2.5]" />
            <span>Inteligência Artificial Nutricional</span>
          </div>
          
          <h1 className="text-[40px] leading-[1.1] sm:text-6xl font-black tracking-tight text-slate-900">
            Não é mais um app de dieta. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 drop-shadow-sm pb-2 inline-block">
              É um Protocolo Guiado.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto pt-4 leading-relaxed font-medium">
            O único sistema onde você <strong className="text-slate-800 font-extrabold">não precisa pensar</strong>. Nós dizemos exatamente o que comer, que horas comer e como desinchar. Apenas siga o plano.
          </p>
        </motion.div>

        {/* Features / Benefits */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left w-full mt-12 px-2"
        >
          <div className="p-7 rounded-[2rem] bg-white border border-slate-100 space-y-4 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.03)] group">
            <div className="w-[60px] h-[60px] rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Leaf className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">Suco Detox</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Receitas curadas para limpar o organismo pela manhã e desinchar rapidamente.</p>
          </div>

          <div className="p-7 rounded-[2rem] bg-white border border-slate-100 space-y-4 hover:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.1)] hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.03)] group">
            <div className="w-[60px] h-[60px] rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">Chá Seca Barriga</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Estratégia de segunda a sexta, antes do almoço ou jantar, para acelerar o metabolismo e queima de gordura.</p>
          </div>

          <div className="p-7 rounded-[2rem] bg-white border border-slate-100 space-y-4 hover:shadow-[0_10px_40px_-10px_rgba(14,165,233,0.1)] hover:-translate-y-1 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.03)] group">
            <div className="w-[60px] h-[60px] rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Droplets className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-[17px] text-slate-800 tracking-tight">Hidratação Exata</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Cálculo diário automático de água baseado no seu peso atual e sua meta.</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12 px-2"
        >
          <button 
            onClick={() => router.push('/onboarding')}
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto sm:inline-flex px-10 py-[22px] bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-[0_15px_40px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)]"
          >
            <span>Gerar Meu Protocolo AI</span>
            <ArrowRight className="w-[22px] h-[22px] group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </button>
          <p className="mt-8 text-[13px] font-bold text-slate-500 flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[3]" />
            Personalizado para o seu biotipo
          </p>
        </motion.div>

      </div>
    </div>
  );
}
