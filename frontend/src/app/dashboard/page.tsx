'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { motion } from 'framer-motion';
import { Calendar, Droplets, Target, Flame, ArrowRight, Activity, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { weight, targetWeight, streak, waterConsumed, waterTarget, plan, setPlan, goal, height, age, sex, activityLevel, comorbidities, medications, addProgress, progress } = useProtocol();
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [errorPlan, setErrorPlan] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (weight && (!age || !sex || !activityLevel)) {
      router.replace('/onboarding');
    }
  }, [weight, age, sex, activityLevel, router]);

  // Auto-generate plan with backend if none exists or is stale
  const generateProtocol = async () => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;
    setLoadingPlan(true);
    setErrorPlan(null);

    try {
      const data = await apiFetch('/ai/generate-plan', {
        method: 'POST',
        body: JSON.stringify({ weight, height, age, sex, activityLevel, comorbidities, medications, goal })
      });

      const hydratedWeeklyPlan = data.weeklyPlan?.map((day: any) => ({
        ...day,
        meals: day.meals.map((m: any) => ({ ...m, completed: false }))
      })) || [];
      
      setPlan({ waterTarget: data.waterTarget || (weight || 0) * 35, weeklyPlan: hydratedWeeklyPlan });
    } catch (err: any) {
      console.error("Erro ao gerar plano:", err);
      // Exibe a mensagem de erro exata na tela para ajudar a debugar
      setErrorPlan(err.message || 'Erro desconhecido ao conectar no servidor.');
      fetchAttempted.current = false; // Allow retry
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    const planIsStale = plan && !plan.weeklyPlan;
    if ((!plan || planIsStale) && weight && height && goal && age && sex && activityLevel) {
      generateProtocol();
    }
  }, [plan, weight, height, age, sex, activityLevel, comorbidities, medications, goal]);

  const todayDayOfWeek = new Date().getDay();
  const todaysPlan = plan?.weeklyPlan?.find(p => p.dayOfWeek === todayDayOfWeek);
  
  const completedMeals = todaysPlan?.meals.filter(m => m.completed).length || 0;
  const totalMeals = todaysPlan?.meals.length || 0;
  const mealProgress = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;
  
  const waterProgress = (waterConsumed / waterTarget) * 100;
  
  const nextMeal = todaysPlan?.meals.find(m => !m.completed);

  const todayWeight = progress.find(p => p.date === new Date().toISOString().split('T')[0])?.weight;

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-slate-50 min-h-screen">
      {/* Header Profile */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-slate-500 font-medium mb-1 tracking-wide">Bem-vinda de volta 👋</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estratégia do Dia</h1>
          </div>
          <div className="flex flex-col items-center bg-emerald-50 px-4 py-2.5 rounded-[1.5rem] border border-emerald-100 shadow-sm shadow-emerald-500/10 mb-1">
            <Flame className="w-6 h-6 text-emerald-500 mb-0.5" strokeWidth={2.5} />
            <span className="font-bold text-emerald-700 leading-none">{streak}</span>
            <span className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-wider mt-0.5">Dias</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Loading & Error Overlays */}
        {loadingPlan && !errorPlan && (
          <div className="animate-pulse bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-4 shadow-sm">
            <Activity className="w-10 h-10 text-emerald-500 animate-bounce" />
            <div className="text-center">
              <h3 className="font-bold text-emerald-800">A IA está gerando seu Protocolo...</h3>
              <p className="text-sm text-emerald-600 mt-1 font-medium">Isso leva de 15 a 45 segundos dependendo do servidor.</p>
            </div>
          </div>
        )}

        {errorPlan && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-4 shadow-sm">
             <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center">
               <span className="text-xl">🐢</span>
             </div>
             <div className="text-center">
               <h3 className="font-bold text-rose-800">O servidor está acordando...</h3>
               <p className="text-sm text-rose-600 mt-1 font-medium">{errorPlan}</p>
             </div>
             <button 
               onClick={() => generateProtocol()}
               className="mt-2 px-6 py-2.5 bg-rose-500 text-white font-bold rounded-xl shadow-sm hover:bg-rose-600 transition-colors"
             >
               Tentar Novamente
             </button>
          </div>
        )}

        {/* Peso Widget */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-colors">
          <div className="flex-1 flex gap-6">
            <div className="flex flex-col border-r border-slate-100 pr-6 w-1/2">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1 group-hover:text-emerald-500/70 transition-colors">Peso Atual</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-black text-slate-900 tracking-tight">{weight}</span>
                <span className="text-sm text-slate-400 font-bold">kg</span>
              </div>
            </div>
            <div className="flex flex-col w-1/2 pl-1">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">Peso Meta</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-black text-cyan-500 tracking-tight">{targetWeight}</span>
                <span className="text-sm text-cyan-500/60 font-bold">kg</span>
              </div>
            </div>
          </div>
          {!todayWeight && (
            <button 
              onClick={() => {
                const w = prompt('Qual seu peso hoje em kg?');
                if (w && !isNaN(Number(w))) addProgress(Number(w));
              }}
              className="ml-4 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Atividade Próxima (Refeição) */}
        {!loadingPlan && todaysPlan && (
          <Link href="/plan" className="block relative focus:outline-none focus:ring-4 ring-emerald-500/20 rounded-[2.5rem]">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-7 shadow-xl shadow-slate-900/10 text-white overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 bg-white/10 rounded-[1rem] backdrop-blur-md border border-white/5">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">Próximo Passo</span>
              </div>
              
              <div className="relative z-10">
                {nextMeal ? (
                  <>
                    <h2 className="text-3xl font-black mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">{nextMeal.title}</h2>
                    <p className="text-white/60 mb-6 font-medium line-clamp-1">{nextMeal.description}</p>
                    <div className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm shadow-white/10 group-hover:shadow-emerald-500/20 transition-all">
                      Marcadas: {completedMeals}/{totalMeals}
                      <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">Tudo concluído!</h2>
                    <p className="text-white/60 mb-6 font-medium">Você finalizou todas as refeições do dia.</p>
                    <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all border border-emerald-400">
                      Excelente trabalho <span className="text-lg">🎉</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mini ProgressBar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${mealProgress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </Link>
        )}

        {/* Metas Diárias Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Plano Card */}
          <Link href="/plan" className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between aspect-square group hover:border-emerald-200 transition-colors focus:outline-none focus:ring-4 ring-emerald-500/20">
            <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-emerald-500" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight mb-1">Meu Plano</h3>
              <p className="text-[13px] text-slate-500 font-medium">Semana Completa</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 group-hover:text-emerald-500 transition-colors">
              <span className="text-[13px] font-bold">Ver tudo</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Água Card */}
          <Link href="/water" className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-cyan-200 transition-colors focus:outline-none focus:ring-4 ring-cyan-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors"></div>
            <div className="w-12 h-12 rounded-[1.2rem] bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform">
              <Droplets className="w-6 h-6 text-cyan-500" strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight mb-1">Água</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-cyan-500 tabular-nums tracking-tighter">{waterConsumed}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">/ {waterTarget} ml</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative z-10">
              <motion.div 
                className="h-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(waterProgress, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </Link>
          
        </div>

      </div>
    </div>
  );
}
