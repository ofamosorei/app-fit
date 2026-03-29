'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  FileText,
  Flame,
  Beef,
  Wheat,
  Droplets,
  TriangleAlert,
  Coffee,
  Apple,
  MoonStar,
  SunMedium,
  Soup,
  Sparkles,
  Info,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

type MealTheme = {
  icon: LucideIcon;
  pill: string;
  badge: string;
  card: string;
  note: string;
  tone: string;
  tip: string;
};

const getMealTheme = (title: string): MealTheme => {
  const normalized = title.toLowerCase();

  if (normalized.includes('café')) {
    return {
      icon: Coffee,
      pill: 'bg-amber-100 text-amber-700',
      badge: 'bg-white/85 text-amber-700 border-amber-100',
      card: 'from-amber-50 via-white to-white',
      note: 'text-amber-900/80',
      tone: 'Café de abertura',
      tip: 'Se acordar sem fome, beba água primeiro e preserve essa refeição como ponto de partida do dia.',
    };
  }

  if (normalized.includes('almoço')) {
    return {
      icon: SunMedium,
      pill: 'bg-emerald-100 text-emerald-700',
      badge: 'bg-white/85 text-emerald-700 border-emerald-100',
      card: 'from-emerald-50 via-white to-white',
      note: 'text-emerald-900/80',
      tone: 'Refeição principal',
      tip: 'Faça essa refeição sentada e com atenção. Ela sustenta boa parte da sua constância até o fim da tarde.',
    };
  }

  if (normalized.includes('lanche')) {
    return {
      icon: Apple,
      pill: 'bg-rose-100 text-rose-700',
      badge: 'bg-white/85 text-rose-700 border-rose-100',
      card: 'from-rose-50 via-white to-white',
      note: 'text-rose-900/80',
      tone: 'Ponte da tarde',
      tip: 'Use o lanche como ponte. Ele evita chegar no jantar com fome desorganizada e vontade de compensar.',
    };
  }

  if (normalized.includes('jantar')) {
    return {
      icon: MoonStar,
      pill: 'bg-indigo-100 text-indigo-700',
      badge: 'bg-white/85 text-indigo-700 border-indigo-100',
      card: 'from-indigo-50 via-white to-white',
      note: 'text-indigo-900/80',
      tone: 'Fechamento do dia',
      tip: 'À noite, a meta é terminar o dia satisfeita e leve. Não é perfeição; é continuidade.',
    };
  }

  return {
    icon: Soup,
    pill: 'bg-slate-100 text-slate-700',
    badge: 'bg-white/85 text-slate-700 border-slate-100',
    card: 'from-slate-100 via-white to-white',
    note: 'text-slate-900/75',
    tone: 'Etapa do protocolo',
    tip: 'Siga essa etapa como referência principal do dia para manter seu plano organizado e mais fácil de cumprir.',
  };
};

export default function Plan() {
  const { plan, toggleMeal } = useProtocol();
  const [selectedView, setSelectedView] = useState<'shopping' | number>(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'shopping') {
      setSelectedView('shopping');
      return;
    }
    setSelectedView(new Date().getDay());
  }, [searchParams]);

  const daysLabels = [
    { id: 0, label: 'Dom', full: 'Domingo' },
    { id: 1, label: 'Seg', full: 'Segunda-feira' },
    { id: 2, label: 'Ter', full: 'Terça-feira' },
    { id: 3, label: 'Qua', full: 'Quarta-feira' },
    { id: 4, label: 'Qui', full: 'Quinta-feira' },
    { id: 5, label: 'Sex', full: 'Sexta-feira' },
    { id: 6, label: 'Sáb', full: 'Sábado' },
  ];

  const selectedDay = typeof selectedView === 'number' ? selectedView : null;
  const currentDayPlan = plan?.weeklyPlan?.find((p) => p.dayOfWeek === selectedDay);
  const meals = currentDayPlan?.meals || [];
  const completedCount = meals.filter((m) => m.completed).length;
  const isToday = selectedDay !== null && new Date().getDay() === selectedDay;
  const shoppingSections = Object.entries(plan?.shoppingList || {}).filter(
    ([, items]) => Array.isArray(items) && items.length > 0,
  );

  const shoppingLabels: Record<string, string> = {
    proteinas: 'Proteínas',
    carboidratos: 'Carboidratos',
    vegetaisEFolhas: 'Vegetais e folhas',
    frutas: 'Frutas',
    gordurasEOleaginosas: 'Gorduras e oleaginosas',
    temperosECondimentos: 'Temperos e condimentos',
    outros: 'Outros',
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_36%,#ffffff_100%)]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-28">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-500">
              Repetição semanal
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Cardápio do Mês
            </h1>
          </div>

          <div className="w-11" />
        </div>

        <div className="mb-6 rounded-full border border-slate-100 bg-white/80 p-1 shadow-sm backdrop-blur">
          <div className="grid grid-cols-8 gap-1">
            <button
              onClick={() => setSelectedView('shopping')}
              className={`flex items-center justify-center rounded-full py-2.5 text-sm font-bold transition-all ${
                selectedView === 'shopping'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`}
              aria-label="Lista de compras"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            {daysLabels.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedView(day.id)}
                className={`rounded-full py-2.5 text-sm font-bold transition-all ${
                  selectedView === day.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={String(selectedView)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {selectedView === 'shopping' ? (
              <div className="overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_60px_-25px_rgba(15,23,42,0.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Lista da semana
                    </div>
                    <h2 className="mt-4 text-4xl font-black tracking-tight">
                      Compras do Protocolo
                    </h2>
                    <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-300">
                      Tudo o que você precisa para seguir o plano com mais clareza no mercado e menos improviso na rotina.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Categorias
                    </p>
                    <p className="mt-1 text-3xl font-black text-emerald-400">
                      {String(shoppingSections.length).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_60px_-25px_rgba(15,23,42,0.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
                      <Calendar className="h-3.5 w-3.5" />
                      {isToday ? 'Hoje' : 'Rotina'}
                    </div>
                    <h2 className="mt-4 text-4xl font-black tracking-tight">
                      {daysLabels.find((d) => d.id === selectedDay)?.full}
                    </h2>
                    <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-300">
                      Um plano mais bonito de acompanhar e mais fácil de seguir ao longo do dia.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Fluxo
                    </p>
                    <p className="mt-1 text-3xl font-black text-emerald-400">
                      {String(completedCount).padStart(2, '0')}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      de {String(meals.length).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedView !== 'shopping' && (plan?.dailyMacros || (plan?.warnings && plan.warnings.length > 0)) && (
              <div className="space-y-4">
                {plan?.dailyMacros && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <Flame className="h-4 w-4 text-rose-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Calorias</span>
                      </div>
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {plan.dailyMacros.calories}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">kcal por dia</p>
                    </div>

                    <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <Beef className="h-4 w-4 text-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Proteína</span>
                      </div>
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {plan.dailyMacros.protein}g
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">meta diária</p>
                    </div>

                    <div className="rounded-[24px] border border-amber-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <Wheat className="h-4 w-4 text-amber-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Carbo</span>
                      </div>
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {plan.dailyMacros.carbs}g
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">meta diária</p>
                    </div>

                    <div className="rounded-[24px] border border-cyan-100 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-slate-400">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Gordura</span>
                      </div>
                      <p className="text-2xl font-black tracking-tight text-slate-950">
                        {plan.dailyMacros.fat}g
                      </p>
                      <p className="text-[11px] font-medium text-slate-500">meta diária</p>
                    </div>
                  </div>
                )}

                {plan?.warnings && plan.warnings.length > 0 && (
                  <div className="rounded-[28px] border border-amber-100 bg-amber-50 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <TriangleAlert className="h-5 w-5 text-amber-600" />
                      <h3 className="font-black tracking-tight text-slate-950">
                        Avisos importantes
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {plan.warnings.map((warning, index) => (
                        <p
                          key={index}
                          className="text-sm font-medium leading-6 text-amber-900/80"
                        >
                          {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'shopping' && shoppingSections.length > 0 && (
              <div className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                      Lista da semana
                    </p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      Compras para seguir o plano
                    </h3>
                    <p className="mt-2 text-sm leading-6 font-medium text-slate-500">
                      Use esta lista como base para organizar a semana sem improvisar na feira ou no mercado.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {shoppingSections.map(([section, items]) => (
                    <div
                      key={section}
                      className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4"
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        {shoppingLabels[section] || section}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 shadow-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedView !== 'shopping' && meals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white py-14 text-center shadow-sm">
                <FileText className="mb-4 h-12 w-12 text-slate-300" />
                <p className="font-medium text-slate-500">Nenhuma refeição carregada para este dia.</p>
              </div>
            ) : selectedView !== 'shopping' ? (
              <div className="relative space-y-5">
                <div className="absolute left-[22px] top-5 bottom-5 w-px bg-gradient-to-b from-emerald-200 via-slate-200 to-transparent" />

                {meals.map((meal, index) => {
                  const theme = getMealTheme(meal.title);
                  const Icon = theme.icon;

                  return (
                    <button
                      key={`${meal.title}-${index}`}
                      onClick={() => {
                        if (selectedDay === null) return;
                        toggleMeal(selectedDay, index);
                      }}
                      className="relative w-full pl-14 text-left outline-none"
                    >
                      <div className={`absolute left-0 top-5 flex h-11 w-11 items-center justify-center rounded-2xl ${theme.pill} shadow-sm ring-4 ring-white`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className={`overflow-hidden rounded-[30px] border border-white bg-gradient-to-br ${theme.card} p-5 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.28)] transition-transform hover:-translate-y-0.5`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${theme.badge}`}>
                              {meal.time}
                            </div>
                            <h3 className={`mt-3 text-[29px] font-black leading-none tracking-tight ${
                              meal.completed ? 'text-slate-400 line-through decoration-emerald-500/30' : 'text-slate-950'
                            }`}>
                              {meal.title}
                            </h3>
                          </div>

                          <div className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] ${
                            meal.completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-950 text-white'
                          }`}>
                            {meal.completed ? 'Feita' : theme.tone}
                          </div>
                        </div>

                        <p className={`mt-4 text-[16px] leading-8 font-medium ${
                          meal.completed ? 'text-slate-400/80' : 'text-slate-600'
                        }`}>
                          {meal.description}
                        </p>

                        <div className="mt-5 rounded-[22px] bg-white/90 p-4 ring-1 ring-slate-100">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-emerald-400">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                Observação da nutri
                              </p>
                              <p className={`mt-1 text-[14px] leading-6 font-medium ${theme.note}`}>
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
            ) : shoppingSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white py-14 text-center shadow-sm">
                <ShoppingCart className="mb-4 h-12 w-12 text-slate-300" />
                <p className="font-medium text-slate-500">A lista de compras ainda não foi gerada para este plano.</p>
              </div>
            ) : null}

            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 shadow-sm">
                <Info className="h-3.5 w-3.5" />
                {selectedView === 'shopping' ? 'Fim da lista' : 'Fim das refeições'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
