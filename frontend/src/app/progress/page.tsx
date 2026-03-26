'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { motion } from 'framer-motion';
import { LineChart as ChartIcon, Plus, Trophy, ArrowDown, ArrowUp, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ProgressPage() {
  const { progress, addProgress, weight, targetWeight, streak, deleteProgress } = useProtocol();
  const [newWeight, setNewWeight] = useState(weight || 70);
  const [showInput, setShowInput] = useState(false);

  const handleAddWeight = () => {
    addProgress(newWeight);
    setShowInput(false);
  };

  const startWeight = progress.length > 0 ? progress[0].weight : weight;
  const currentWeight = weight;
  const lost = startWeight && currentWeight ? Math.max(0, startWeight - currentWeight).toFixed(1) : '0.0';
  
  // Sort history newest first
  const history = [...progress].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex-1 p-6 pb-28 max-w-lg mx-auto w-full animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <header className="mb-8 pt-6">
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight">Evolução</h1>
        <p className="text-slate-500 font-medium text-[13px] mt-2">Acompanhe sua perda de peso</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <Trophy className="w-16 h-16" />
          </div>
          <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Total Perdido</p>
          <p className="text-[32px] font-black text-emerald-500">{lost}<span className="text-sm text-slate-400 font-bold ml-1 font-sans">kg</span></p>
        </div>
        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
          <p className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-wide">Sequência</p>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-black text-orange-500">{streak}<span className="text-sm text-orange-400/60 font-bold ml-1 font-sans">dias</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 mb-8 mt-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-2 tracking-tight">
            <ChartIcon className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
            Histórico de Pesagens
          </h3>
          <button 
            onClick={() => setShowInput(!showInput)}
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100 active:scale-95"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {showInput && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 overflow-hidden">
            <div className="flex gap-2">
              <input 
                type="number" 
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-[1rem] px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-lg font-bold"
                step="0.1"
              />
              <button 
                onClick={handleAddWeight}
                className="bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-[1rem] hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 active:scale-95"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-slate-500 font-medium tracking-wide text-center py-10 text-[13px] bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              Nenhum registro ainda.<br/><span className="mt-1 block text-slate-400">Comece a atualizar seu peso diariamente.</span>
            </div>
          ) : (
            history.map((entry, i) => {
              const prev = history[i + 1];
              let diff = 0;
              if (prev) diff = entry.weight - prev.weight;
              
              return (
                <div key={entry.date} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
                  <div>
                    <p className="font-extrabold text-slate-800 text-[17px] tracking-tight">{entry.weight.toFixed(1)} <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">kg</span></p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {prev && (
                      <div className={`flex items-center gap-1.5 text-[11px] font-extrabold tracking-tight px-3 py-1.5 rounded-full ${diff < 0 ? 'bg-emerald-100 text-emerald-600' : diff > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'}`}>
                        {diff < 0 ? <ArrowDown className="w-[14px] h-[14px] stroke-[3]" /> : diff > 0 ? <ArrowUp className="w-[14px] h-[14px] stroke-[3]" /> : <Minus className="w-[14px] h-[14px] stroke-[3]" />}
                        {Math.abs(diff).toFixed(1)}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (confirm('Deseja excluir este registro de peso?')) {
                          deleteProgress(entry.date);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                      title="Excluir medição"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
