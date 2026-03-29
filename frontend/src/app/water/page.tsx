'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { getLocalDateKey, getStartOfLocalDay } from '@/lib/date';
import { motion } from 'framer-motion';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

const getToday = () => getLocalDateKey();

const getCurrentWeek = () => {
  const today = getStartOfLocalDay();
  // getDay(): 0=Sun, 1=Mon ... 6=Sat
  // We want Mon(1) as first day, so offset accordingly
  const day = today.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day); // days since last Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalDateKey(d);
  });
};

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function WaterPage() {
  const { waterLog, waterEventsLog, waterConsumed, waterTarget, addWater, undoWater } = useProtocol();
  const pct = Math.min(100, Math.max(0, (waterConsumed / waterTarget) * 100));
  const lastWaterAmount = (waterEventsLog[getToday()] || []).at(-1) || 0;

  const last7 = getCurrentWeek();
  const maxLog = Math.max(...last7.map(d => waterLog[d] || 0), waterTarget);

  const cups = [
    { label: 'Copo', ml: 250 },
    { label: 'Garrafa', ml: 500 },
    { label: 'Garrafa G', ml: 750 },
    { label: '1 Litro', ml: 1000 },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-slate-50 min-h-screen px-6">

      {/* Header */}
      <div className="text-center pt-14 mb-10">
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight">Hidratação</h1>
        <p className="text-slate-500 mt-1 font-bold text-sm uppercase tracking-wide">
          Meta do dia: <span className="text-cyan-600">{waterTarget.toLocaleString()} ml</span>
        </p>
      </div>

      {/* Circle Progress */}
      <div className="relative w-[280px] h-[280px] mb-4 flex flex-col items-center justify-center mx-auto">
        <div className="absolute inset-0 rounded-full border-[22px] border-slate-100 shadow-inner" />
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-[0_0_25px_rgba(6,182,212,0.2)]">
          <motion.circle
            cx="140" cy="140" r="129"
            className="stroke-cyan-500"
            strokeWidth="22" strokeLinecap="round" fill="none"
            initial={{ strokeDasharray: '0 1000' }}
            animate={{ strokeDasharray: `${(pct / 100) * (2 * Math.PI * 129)} 1000` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>

        <div className="flex flex-col items-center z-10">
          <motion.div animate={waterConsumed >= waterTarget ? { y: [0, -8, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
            <Droplets className={`w-12 h-12 mb-1 stroke-[2.5] ${waterConsumed >= waterTarget ? 'text-emerald-500' : 'text-cyan-400'}`} />
          </motion.div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums">{waterConsumed.toLocaleString()}</span>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">ml</span>
          </div>
          <span className="text-slate-400 text-xs font-semibold">de {waterTarget.toLocaleString()} ml</span>
        </div>

        {waterConsumed >= waterTarget && (
          <div className="absolute -bottom-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-600 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            🎯 Meta Alcançada!
          </div>
        )}
      </div>

      {/* Botões de Adição */}
      <div className="grid grid-cols-4 gap-3 mb-4 mt-10">
        {cups.map(({ label, ml }) => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="flex flex-col items-center justify-center bg-white border border-slate-100 hover:border-cyan-200 rounded-[1.5rem] p-4 transition-all active:scale-[0.95] group shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.1)]"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 mb-2.5 group-hover:bg-cyan-500 group-hover:text-white transition-all">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-[13px] text-slate-800">{label}</span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-0.5">{ml} ml</span>
          </button>
        ))}
      </div>

      {/* Botão Desfazer */}
      {lastWaterAmount > 0 && (
        <button
          onClick={() => undoWater()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] border border-slate-200 bg-white text-slate-500 font-bold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-[0.98] shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-6"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          Desfazer última adição ({lastWaterAmount}ml)
        </button>
      )}

      {/* Histórico 7 Dias */}
      <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <h2 className="font-black text-slate-900 tracking-tight mb-5 text-[15px]">Últimos 7 Dias</h2>
        <div className="flex items-end justify-between gap-2 h-24">
          {last7.map((date) => {
            const ml = waterLog[date] || 0;
            const barH = maxLog > 0 ? Math.max(4, (ml / maxLog) * 100) : 4;
            const isToday = date === getToday();
            const achieved = ml >= waterTarget;
            return (
              <div key={date} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <motion.div
                    className={`w-full rounded-full transition-colors ${achieved ? 'bg-emerald-400' : isToday ? 'bg-cyan-400' : 'bg-slate-200'}`}
                    initial={{ height: 4 }}
                    animate={{ height: `${barH}%` }}
                    transition={{ duration: 0.8, delay: 0.05 * last7.indexOf(date) }}
                  />
                </div>
                <span className={`text-[11px] font-black uppercase ${isToday ? 'text-cyan-600' : 'text-slate-400'}`}>
                  {DAY_LABELS[last7.indexOf(date)]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Meta batida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hoje</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outros dias</span>
          </div>
        </div>
      </div>

    </div>
  );
}
