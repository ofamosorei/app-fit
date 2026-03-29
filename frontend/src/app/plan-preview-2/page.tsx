'use client';

import { motion } from 'framer-motion';
import {
  Apple,
  Calendar,
  ChevronLeft,
  Coffee,
  Info,
  MoonStar,
  Sparkles,
  SunMedium,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

type PreviewMeal = {
  time: string;
  title: string;
  description: string;
  energy: string;
};

type MealLook = {
  icon: LucideIcon;
  pill: string;
  badge: string;
  card: string;
  note: string;
  tip: string;
};

const previewMeals: PreviewMeal[] = [
  {
    time: '08:00',
    title: 'Café da manhã',
    description: '1 ovo cozido, 2 colheres de sopa de aveia com 1 banana pequena.',
    energy: 'Leve e estável',
  },
  {
    time: '12:00',
    title: 'Almoço',
    description: '100g de peito de frango grelhado, 1/2 xícara de arroz integral e 1/2 xícara de brócolis cozidos.',
    energy: 'Saciedade alta',
  },
  {
    time: '15:00',
    title: 'Lanche da tarde',
    description: '1 maçã e 10 amêndoas.',
    energy: 'Controle da fome',
  },
  {
    time: '19:00',
    title: 'Jantar',
    description: '100g de patinho moído refogado com cebola e 1/2 xícara de feijão preto.',
    energy: 'Fechamento do dia',
  },
];

const getMealLook = (title: string): MealLook => {
  const normalized = title.toLowerCase();

  if (normalized.includes('café')) {
    return {
      icon: Coffee,
      pill: 'bg-amber-100 text-amber-700',
      badge: 'bg-white/85 text-amber-700 border-amber-100',
      card: 'from-amber-50 via-white to-white',
      note: 'text-amber-900/80',
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
      tip: 'Use o lanche como ponte. Ele evita chegar no jantar com fome desorganizada e vontade de compensar.',
    };
  }

  return {
    icon: MoonStar,
    pill: 'bg-indigo-100 text-indigo-700',
    badge: 'bg-white/85 text-indigo-700 border-indigo-100',
    card: 'from-indigo-50 via-white to-white',
    note: 'text-indigo-900/80',
    tip: 'À noite, a meta é terminar o dia satisfeita e leve. Não é perfeição; é continuidade.',
  };
};

export default function PlanPreview2Page() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_38%,#ffffff_100%)]">
      <div className="mx-auto max-w-md px-5 pt-10 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-500">
              Preview 02
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Ritual do Dia
            </h1>
          </div>

          <div className="w-11" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_60px_-25px_rgba(15,23,42,0.55)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
                <Calendar className="h-3.5 w-3.5" />
                Sábado
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-tight">4 refeições</h2>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-300">
                Uma leitura mais bonita e mais guiada do seu protocolo, como uma sequência do dia.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                Fluxo
              </p>
              <p className="mt-1 text-3xl font-black text-emerald-400">01</p>
            </div>
          </div>
        </motion.div>

        <div className="relative space-y-5">
          <div className="absolute left-[22px] top-5 bottom-5 w-px bg-gradient-to-b from-emerald-200 via-slate-200 to-transparent" />

          {previewMeals.map((meal, index) => {
            const look = getMealLook(meal.title);
            const Icon = look.icon;

            return (
              <motion.div
                key={meal.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-14"
              >
                <div className={`absolute left-0 top-5 flex h-11 w-11 items-center justify-center rounded-2xl ${look.pill} shadow-sm ring-4 ring-white`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className={`overflow-hidden rounded-[30px] border border-white bg-gradient-to-br ${look.card} p-5 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.28)]`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${look.badge}`}>
                        {meal.time}
                      </div>
                      <h3 className="mt-3 text-[29px] font-black leading-none tracking-tight text-slate-950">
                        {meal.title}
                      </h3>
                    </div>
                    <div className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white">
                      {meal.energy}
                    </div>
                  </div>

                  <p className="mt-4 text-[16px] leading-8 font-medium text-slate-600">
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
                        <p className={`mt-1 text-[14px] leading-6 font-medium ${look.note}`}>
                          {look.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 shadow-sm">
            <Info className="h-3.5 w-3.5" />
            Fim do preview
          </div>
        </div>
      </div>
    </div>
  );
}
