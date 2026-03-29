'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Flame,
  LineChart,
  Plus,
  ShoppingBasket,
  Target,
  TimerReset,
  Weight,
} from 'lucide-react';

const mockTasks = [
  { label: 'Registrar peso', done: true, helper: '99,2 kg salvo hoje' },
  { label: 'Bater meta de água', done: false, helper: 'Faltam 1.250 ml' },
  { label: 'Concluir refeições', done: false, helper: '2 de 5 concluídas' },
  { label: 'Ver lista da semana', done: true, helper: 'Compras organizadas' },
];

const mockMeals = [
  { time: '12:00', title: 'Chá Seca Barriga', desc: '1 xícara antes do almoço', state: 'Agora' },
  { time: '12:30', title: 'Almoço do dia', desc: 'Arroz, feijão, frango e salada', state: 'Próximo' },
];

export default function DashboardPreview() {
  const completedTasks = mockTasks.filter((task) => task.done).length;
  const dayProgress = Math.round((completedTasks / mockTasks.length) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_38%,#eef2ff_100%)] pb-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-10">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/90 px-6 pb-7 pt-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm">
            <Flame className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">7 dias</span>
          </div>

          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500">Bom te ver de volta</p>
            <h1 className="mt-2 max-w-[12ch] text-[2.1rem] font-black leading-[0.96] tracking-tight text-slate-950">
              Seu dia está {dayProgress}% em ordem.
            </h1>
            <p className="mt-3 max-w-[26ch] text-[0.96rem] font-medium leading-relaxed text-slate-500">
              Abra o app e execute só o que falta hoje. Sem pensar demais, sem se perder.
            </p>
          </div>

          <div className="relative z-10 mt-6 rounded-[1.8rem] bg-slate-950 px-5 py-5 text-white shadow-[0_18px_45px_-22px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] font-black uppercase tracking-[0.24em] text-emerald-300">Ação do momento</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Chá Seca Barriga</h2>
                <p className="mt-1 text-sm font-medium text-white/65">Faltam 12 minutos para manter seu ritual do almoço.</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/45">Hoje</p>
                <p className="mt-1 text-2xl font-black">12:00</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/plan"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/25"
              >
                Ver refeição
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75">
                <CheckCircle2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-[2rem] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_12px_40px_-26px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-cyan-50 text-cyan-500">
                <Droplets className="h-5 w-5" />
              </div>
              <span className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-cyan-500">Hoje</span>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500">Água</p>
            <p className="mt-1 text-[1.9rem] font-black tracking-tight text-slate-950">2.1L</p>
            <p className="mt-1 text-sm font-medium text-slate-400">de 3.4L</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <motion.div
                className="h-2 rounded-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: '62%' }}
                transition={{ duration: 0.9 }}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_12px_40px_-26px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-emerald-50 text-emerald-500">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-emerald-500">Plano</span>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-500">Refeições</p>
            <p className="mt-1 text-[1.9rem] font-black tracking-tight text-slate-950">2/5</p>
            <p className="mt-1 text-sm font-medium text-slate-400">concluídas</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <motion.div
                className="h-2 rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: '40%' }}
                transition={{ duration: 0.9, delay: 0.1 }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_16px_45px_-26px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-slate-400">Checklist do dia</p>
              <h3 className="mt-2 text-[1.55rem] font-black tracking-tight text-slate-950">Falta pouco para fechar hoje.</h3>
            </div>
            <div className="rounded-[1.2rem] bg-slate-100 px-4 py-3 text-center">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-slate-400">Status</p>
              <p className="mt-1 text-xl font-black text-slate-950">{dayProgress}%</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {mockTasks.map((task) => (
              <div key={task.label} className="flex items-center gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50/80 px-4 py-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${task.done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  {task.done ? <CheckCircle2 className="h-5 w-5" /> : <TimerReset className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black tracking-tight text-slate-900">{task.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-500">{task.helper}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.22em] ${task.done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {task.done ? 'ok' : 'falta'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_16px_45px_-26px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-slate-400">Ritmo do dia</p>
              <h3 className="mt-2 text-[1.55rem] font-black tracking-tight text-slate-950">Sua sequência de agora.</h3>
            </div>
            <Link href="/plan" className="text-sm font-black text-emerald-600">
              Abrir plano
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {mockMeals.map((meal) => (
              <div key={meal.time} className="flex items-center gap-4 rounded-[1.4rem] bg-gradient-to-r from-slate-50 to-white px-4 py-4 ring-1 ring-slate-100">
                <div className="rounded-[1rem] bg-slate-950 px-3 py-2 text-center text-white">
                  <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-white/45">{meal.state}</p>
                  <p className="mt-1 text-sm font-black">{meal.time}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black tracking-tight text-slate-900">{meal.title}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-500">{meal.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <Link href="/progress" className="rounded-[1.8rem] border border-slate-200/70 bg-white px-4 py-5 text-center shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)]">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-violet-50 text-violet-500">
              <LineChart className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-black tracking-tight text-slate-900">Evolução</p>
            <p className="mt-1 text-[0.72rem] font-medium text-slate-500">Peso e histórico</p>
          </Link>

          <Link href="/plan?tab=shopping" className="rounded-[1.8rem] border border-slate-200/70 bg-white px-4 py-5 text-center shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)]">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-amber-50 text-amber-500">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-black tracking-tight text-slate-900">Compras</p>
            <p className="mt-1 text-[0.72rem] font-medium text-slate-500">Semana pronta</p>
          </Link>

          <button className="rounded-[1.8rem] border border-slate-200/70 bg-white px-4 py-5 text-center shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)]">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-rose-50 text-rose-500">
              <Weight className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-black tracking-tight text-slate-900">Peso</p>
            <p className="mt-1 text-[0.72rem] font-medium text-slate-500">Registrar hoje</p>
          </button>
        </section>

        <div className="flex items-center justify-center pt-2">
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_16px_40px_-20px_rgba(15,23,42,0.55)]">
            <Plus className="h-4 w-4" />
            Testar esta dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
