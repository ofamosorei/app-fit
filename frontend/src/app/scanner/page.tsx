'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImageIcon, Flame, Drumstick, Wheat, Activity, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface ScanResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients?: Ingredient[];
}

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 800;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_SIZE) { height = Math.round((height * MAX_SIZE) / width); width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width = Math.round((width * MAX_SIZE) / height); height = MAX_SIZE; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = base64;
    });
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setImage(compressed);
        analyzeMeal(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async (base64: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'https://app-fit-backend.onrender.com').replace(/\/$/, '') + '/ai/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 w-full max-w-lg mx-auto pb-32 bg-slate-50 min-h-screen">
      <header className="mb-8 pt-10 text-center">
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight">AI Scanner</h1>
        <p className="text-slate-500 font-medium text-[13px] mt-2 max-w-[280px] mx-auto">
          Fotografe o prato e a IA + banco de dados nutricional calculam os macros reais.
        </p>
      </header>

      <div className="flex flex-col gap-6">

        {/* Upload Area */}
        {!image ? (
          <div className="flex flex-col gap-4">
            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-emerald-200 rounded-[3rem] bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center gap-4 group shadow-sm active:scale-[0.98]"
            >
              <div className="w-[88px] h-[88px] rounded-full bg-white flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
                <Camera className="w-[38px] h-[38px] stroke-[2.5]" />
              </div>
              <span className="font-black text-emerald-600 text-xl mt-2 tracking-tight">Tirar Foto do Prato</span>
            </button>

            {/* Gallery Button */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full py-5 border border-slate-200 bg-white rounded-3xl flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              <ImageIcon className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <span className="font-bold text-slate-600 tracking-tight">Importar da Galeria</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Refeição" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-emerald-500">
                <Loader2 className="w-14 h-14 animate-spin stroke-[2.5]" />
                <div className="text-center space-y-1">
                  <p className="font-black text-emerald-700 tracking-wide text-sm">Identificando ingredientes...</p>
                  <p className="text-[11px] text-emerald-600/70 font-bold">Consultando banco nutricional USDA</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleCapture} />
        <input type="file" accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleCapture} />

        {/* Results */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.35 }}
            className="space-y-4"
          >
            {/* Meal Name */}
            <div className="bg-white rounded-[2rem] px-6 py-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" strokeWidth={2.5} />
              <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{result.name}</h3>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-100 rounded-[1.75rem] p-5 flex flex-col items-center justify-center">
                <Flame className="w-7 h-7 text-orange-500 mb-2 stroke-[2.5]" />
                <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">{result.calories}</span>
                <span className="text-[10px] text-orange-600/80 uppercase font-black tracking-widest mt-1">Kcal Total</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-[1.75rem] p-5 flex flex-col items-center justify-center">
                <Drumstick className="w-7 h-7 text-rose-500 mb-2 stroke-[2.5]" />
                <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">{result.protein}g</span>
                <span className="text-[10px] text-rose-600/80 uppercase font-black tracking-widest mt-1">Proteína</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-[1.75rem] p-5 flex flex-col items-center justify-center">
                <Wheat className="w-7 h-7 text-amber-500 mb-2 stroke-[2.5]" />
                <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">{result.carbs}g</span>
                <span className="text-[10px] text-amber-600/80 uppercase font-black tracking-widest mt-1">Carboidratos</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-[1.75rem] p-5 flex flex-col items-center justify-center">
                <Activity className="w-7 h-7 text-yellow-500 mb-2 stroke-[2.5]" />
                <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">{result.fats}g</span>
                <span className="text-[10px] text-yellow-600/80 uppercase font-black tracking-widest mt-1">Gorduras</span>
              </div>
            </div>

            {/* Ingredient Breakdown */}
            {result.ingredients && result.ingredients.length > 0 && (
              <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-800 text-[15px] mb-4 tracking-tight">Detalhamento por Ingrediente</h4>
                <div className="space-y-3">
                  {result.ingredients.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-[14px] capitalize truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.grams}g • {item.protein}g prot • {item.carbs}g carb • {item.fats}g gord</p>
                      </div>
                      <div className="shrink-0 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <span className="text-[13px] font-black text-orange-600 tabular-nums">{item.calories} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan Another */}
            <button
              onClick={() => { setImage(null); setResult(null); }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 text-emerald-600 font-extrabold hover:bg-emerald-100 transition-colors active:scale-[0.98]"
            >
              <RefreshCcw className="w-4 h-4" strokeWidth={2.5} />
              Escanear Outro Prato
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
