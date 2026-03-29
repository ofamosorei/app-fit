'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronLeft,
  Coffee,
  Apple,
  MoonStar,
  SunMedium,
  Sparkles,
  Info,
  Soup,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

type PreviewMeal = {
  time: string;
  title: string;
  description: string;
  completed: boolean;
};

type MealTheme = {
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  iconColor: string;
  tone: string;
  tip: string;
};

const previewMeals: PreviewMeal[] = [
  {
    time: '08:00',
    title: 'Café da manhã',
    description: '1 ovo cozido, 2 colheres de sopa de aveia com 1 banana pequena.',
    completed: false,
  },
  {
    time: '12:00',
    title: 'Almoço',
    description: '100g de peito de frango grelhado, 1/2 xícara de arroz integral e 1/2 xícara de brócolis cozidos.',
    completed: false,
  },
  {
    time: '15:00',
    title: 'Lanche da Tarde',
    description: '1 maçã e 10 amêndoas.',
    completed: true,
  },
  {
    time: '19:00',
    title: 'Jantar',
    description: '100g de patinho moído refogado com cebola e 1/2 xícara de feijão preto.',
    completed: false,
  },
];

const getMealTheme = (title: string): MealTheme => {
  const normalized = title.toLowerCase();

  if (normalized.includes('café')) {
    return {
      icon: Coffee,
      accent: 'from-amber-400/20 via-orange-400/10 to-transparent',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      tone: 'Café de abertura',
      tip: 'Comece o dia com calma e tente não pular essa refeição para reduzir beliscos mais tarde.',
    };
  }

  if (normalized.includes('almoço')) {
    return {
      icon: SunMedium,
      accent: 'from-emerald-400/20 via-cyan-400/10 to-transparent',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      tone: 'Refeição principal',
      tip: 'Priorize comer sentada e sem pressa. Isso melhora saciedade e reduz a vontade de repetir.',
    };
  }

  if (normalized.includes('lanche')) {
    return {
      icon: Apple,
      accent: 'from-rose-400/20 via-pink-400/10 to-transparent',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      tone: 'Ponte da tarde',
      tip: 'Esse lanche ajuda a chegar no jantar com mais controle. Evite substituir por qualquer coisa.',
    };
  }

  if (normalized.includes('jantar')) {
    return {
      icon: MoonStar,
      accent: 'from-indigo-400/20 via-sky-400/10 to-transparent',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      tone: 'Fechamento do dia',
      tip: 'No jantar, foque em leveza e constância. A ideia é encerrar o dia satisfeita, não pesada.',
    };
  }

  return {
    icon: Soup,
    accent: 'from-slate-300/20 via-slate-200/10 to-transparent',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    tone: 'Refeição do protocolo',
    tip: 'Siga essa etapa como referência principal do dia para manter o plano organizado.',
  };
};

export default function PlanPreviewPage() {
  const completedCount = previewMeals.filter((meal) => meal.completed).length;
  const total = previewMeals.length;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-slate-100 shrink-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-full text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Cardápio do Mês</h1>
            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-500">Preview Local</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-full p-1 shadow-inner flex justify-between items-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <button
              key={day}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                day === 'Sáb'
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-100 ring-1 ring-black/5'
                  : 'text-slate-400'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/20 text-white shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  Hoje
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-1">Sábado</h2>
                <p className="text-emerald-50 text-sm font-medium">
                  Uma versão mais editorial para a organização das refeições.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 px-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <span className="text-2xl font-black tabular-nums tracking-tighter leading-none">{completedCount}</span>
                <div className="w-4 border-t border-white/30 my-1"></div>
                <span className="text-sm font-bold opacity-80 leading-none">{total}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 relative">
            <div className="absolute left-[34px] top-10 bottom-10 w-px bg-gradient-to-b from-emerald-100 via-slate-200 to-transparent z-0"></div>
            {previewMeals.map((meal, index) => {
              const theme = getMealTheme(meal.title);
              const MealIcon = theme.icon;

              return (
                <button
                  key={meal.title}
                  className={`w-full text-left rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition-all relative z-10 overflow-hidden group ${
                    meal.completed ? 'opacity-80' : ''
                  }`}
                >
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${theme.accent} pointer-events-none`} />

                  <div className="relative flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm ${
                          meal.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/25'
                            : `${theme.iconBg} ${theme.iconColor} border-white`
                        }`}
                      >
                        {meal.completed ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <MealIcon className="w-6 h-6 stroke-[2.4]" />
                        )}
                      </div>
                      {index !== previewMeals.length - 1 && (
                        <div className="mt-3 h-full min-h-10 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                              meal.completed
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-white text-slate-500 border-slate-200'
                            }`}>
                              {meal.time}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                              {theme.tone}
                            </span>
                          </div>

                          <h3 className={`font-black text-[17px] sm:text-[18px] tracking-tight transition-colors ${
                            meal.completed
                              ? 'text-slate-400 line-through decoration-emerald-500/30'
                              : 'text-slate-900'
                          }`}>
                            {meal.title}
                          </h3>
                        </div>

                        <div className={`shrink-0 rounded-2xl px-3 py-2 text-center border ${
                          meal.completed
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                            {meal.completed ? 'Feito' : 'Pendente'}
                          </p>
                        </div>
                      </div>

                      <div className={`rounded-[1.35rem] border px-4 py-3.5 ${
                        meal.completed
                          ? 'bg-slate-50 border-slate-100'
                          : 'bg-slate-50/80 border-slate-100'
                      }`}>
                        <p className={`text-[15px] font-medium leading-8 transition-colors ${
                          meal.completed ? 'text-slate-400/80' : 'text-slate-600'
                        }`}>
                          {meal.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-start gap-3 rounded-[1.2rem] bg-emerald-50/80 border border-emerald-100 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                            Dica da nutri
                          </p>
                          <p className="mt-1 text-[13px] leading-6 font-medium text-emerald-900/80">
                            {theme.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center p-4">
            <div className="bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 mb-10">
              <Info className="w-3.5 h-3.5" strokeWidth={3} />
              Fim das refeições
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
