'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Calendar, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Plan() {
  const { plan, toggleMeal } = useProtocol();
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    setSelectedDay(new Date().getDay());
  }, []);

  const daysLabels = [
    { id: 0, label: 'Dom', full: 'Domingo' },
    { id: 1, label: 'Seg', full: 'Segunda-feira' },
    { id: 2, label: 'Ter', full: 'Terça-feira' },
    { id: 3, label: 'Qua', full: 'Quarta-feira' },
    { id: 4, label: 'Qui', full: 'Quinta-feira' },
    { id: 5, label: 'Sex', full: 'Sexta-feira' },
    { id: 6, label: 'Sáb', full: 'Sábado' },
  ];

  const currentDayPlan = plan?.weeklyPlan?.find(p => p.dayOfWeek === selectedDay);
  const meals = currentDayPlan?.meals || [];
  const completedCount = meals.filter(m => m.completed).length;
  const progress = meals.length > 0 ? (completedCount / meals.length) * 100 : 0;
  const isToday = new Date().getDay() === selectedDay;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      
      {/* Header Fixo */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-slate-100 shrink-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-full text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors focus:outline-none focus:ring-4 ring-emerald-500/20 active:scale-95">
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Cardápio do Mês</h1>
            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-500">Repetição Semanal</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Seletor de Dias */}
        <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-full p-1 shadow-inner">
          {daysLabels.map(day => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                selectedDay === day.id 
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-100 ring-1 ring-black/5' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Cabecalho do Dia */}
            <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/20 text-white shadow-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    {isToday ? 'Hoje' : 'Rotina'}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-1">{daysLabels.find(d => d.id === selectedDay)?.full}</h2>
                  <p className="text-emerald-50 text-sm font-medium">Siga este plano a cada {daysLabels.find(d => d.id === selectedDay)?.label}.</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 px-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <span className="text-2xl font-black tabular-nums tracking-tighter leading-none">{completedCount}</span>
                  <div className="w-4 border-t border-white/30 my-1"></div>
                  <span className="text-sm font-bold opacity-80 leading-none">{meals.length}</span>
                </div>
              </div>
            </div>

            {/* Empty State ou Lista */}
            {meals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma dieta carregada.</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-[30px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>
                {meals.map((meal, index) => (
                  <button
                    key={index}
                    onClick={() => toggleMeal(selectedDay, index)}
                    className="w-full text-left bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-100 flex gap-5 items-center group hover:border-emerald-200 transition-all focus:outline-none focus:ring-4 ring-emerald-500/20 active:scale-[0.99] relative z-10"
                  >
                    <div 
                      className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 border-2 transition-all duration-300 shadow-sm ${
                        meal.completed 
                          ? 'bg-emerald-500 border-emerald-500 shadow-emerald-500/30 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-300 group-hover:border-emerald-200 group-hover:bg-emerald-50/50'
                      }`}
                    >
                      <Check className={`w-7 h-7 stroke-[3] ${meal.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${meal.completed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {meal.time}
                        </span>
                      </div>
                      <h3 className={`font-black text-[17px] tracking-tight mb-1 transition-colors ${meal.completed ? 'text-slate-400 line-through decoration-emerald-500/30' : 'text-slate-900'}`}>
                        {meal.title}
                      </h3>
                      <p className={`text-sm font-medium leading-relaxed transition-colors ${meal.completed ? 'text-slate-400/80' : 'text-slate-500'}`}>
                        {meal.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-center p-4">
               <div className="bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 mb-10">
                 <Info className="w-3.5 h-3.5" strokeWidth={3} />
                 Fim das refeições
               </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
