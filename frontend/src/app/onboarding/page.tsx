'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProtocol } from '@/context/ProtocolContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function Onboarding() {
  const router = useRouter();
  const { setWeight, setHeight, setAge, setSex, setActivityLevel, setComorbidities, setMedications, setGoal, setTargetWeight } = useProtocol();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [localWeight, setLocalWeight] = useState(70);
  const [localHeight, setLocalHeight] = useState(170);
  const [localAge, setLocalAge] = useState(30);
  const [localSex, setLocalSex] = useState<'male' | 'female'>('female');
  const [localActivity, setLocalActivity] = useState<'sedentary' | 'light' | 'moderate' | 'intense'>('sedentary');
  const [localComorbidities, setLocalComorbidities] = useState('');
  const [localMedications, setLocalMedications] = useState('');
  const [localGoal, setLocalGoal] = useState<'fast'|'moderate'|'maintenance'>('fast');
  const [localTarget, setLocalTarget] = useState(65);
  // Novos campos premium
  const [localAllergies, setLocalAllergies] = useState('');
  const [localDislikedFoods, setLocalDislikedFoods] = useState('');

  const TOTAL_STEPS = 11;

  const nextStep = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setIsSaving(true);
      // Salva no contexto local pré-compra (caso ainda não tenha pago)
      setWeight(localWeight);
      setHeight(localHeight);
      setAge(localAge);
      setSex(localSex);
      setActivityLevel(localActivity);
      setComorbidities(localComorbidities.trim() === '' ? 'Nenhuma' : localComorbidities);
      setMedications(localMedications.trim() === '' ? 'Nenhum' : localMedications);
      setGoal(localGoal);
      setTargetWeight(localTarget);

      // Se já está autenticado (veio pelo Magic Link), salva direto no banco e vai pro app
      if (isAuthenticated) {
        try {
          await apiFetch('/auth/me/profile', {
            method: 'POST',
            body: JSON.stringify({
              weight: localWeight, height: localHeight, age: localAge, sex: localSex,
              activityLevel: localActivity, comorbidities: localComorbidities,
              medications: localMedications, goal: localGoal, targetWeight: localTarget,
              allergies: localAllergies, dislikedFoods: localDislikedFoods
            })
          });
          
          window.dispatchEvent(new Event('appfit:profile-updated'));
          
          // A geração do plano vai ocorrer no Dashboard agora com os dados completos!
          router.push('/dashboard');
        } catch (error) {
          console.error("Erro ao salvar perfil:", error);
          alert('Erro ao salvar dados. Tente novamente.');
        } finally {
          setIsSaving(false);
        }
      } else {
        // Fluxo de primeiro acesso pré-Kiwify
        router.push('/paywall');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col max-w-md w-full mx-auto px-6 py-10 relative overflow-hidden bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={prevStep} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-[26px] h-[26px] stroke-[2.5]" />
        </button>
        <div className="flex gap-1.5 flex-1 mx-4">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 flex-1 ${i <= step ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative w-full h-full">
        <AnimatePresence mode="wait">
          {/* Step 1 – Peso */}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Qual seu peso atual?</h2>
                <p className="text-slate-500 font-medium">Usado para calcular sua meta de água e calorias.</p>
              </div>
              <div className="flex flex-col items-center gap-6 mt-12">
                <div className="text-[72px] font-black text-emerald-500 tracking-tighter tabular-nums mb-8">{localWeight} <span className="text-[28px] text-slate-400 font-bold ml-1 font-sans tracking-wide">kg</span></div>
                <input 
                  type="range" min="40" max="150" value={localWeight} 
                  onChange={(e) => setLocalWeight(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2 – Altura */}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">E sua altura?</h2>
                <p className="text-slate-500 font-medium">Para calcularmos seu gasto energético total.</p>
              </div>
              <div className="flex flex-col items-center gap-6 mt-12">
                <div className="text-[72px] font-black text-emerald-500 tracking-tighter tabular-nums mb-8">{localHeight} <span className="text-[28px] text-slate-400 font-bold ml-1 font-sans tracking-wide">cm</span></div>
                <input 
                  type="range" min="140" max="220" value={localHeight} 
                  onChange={(e) => setLocalHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3 – Sexo */}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-8">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Qual seu sexo biológico?</h2>
                <p className="text-slate-500 font-medium">A fórmula calórica varia entre homens e mulheres.</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { id: 'female', label: '♀ Feminino', desc: 'Taxa metabólica basal feminina' },
                  { id: 'male', label: '♂ Masculino', desc: 'Taxa metabólica basal masculina' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLocalSex(opt.id as 'male' | 'female')}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] active:scale-[0.98] ${localSex === opt.id ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                  >
                    <h3 className={`font-black text-xl tracking-tight ${localSex === opt.id ? 'text-emerald-600' : 'text-slate-800'}`}>{opt.label}</h3>
                    <p className={`text-sm mt-1.5 font-medium ${localSex === opt.id ? 'text-emerald-600/70' : 'text-slate-500'}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4 – Idade */}
          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Qual a sua idade?</h2>
                <p className="text-slate-500 font-medium">O metabolismo basal sofre ajustes drásticos com a idade.</p>
              </div>
              <div className="flex flex-col items-center gap-6 mt-12">
                <div className="text-[72px] font-black text-emerald-500 tracking-tighter tabular-nums mb-8">{localAge} <span className="text-[28px] text-slate-400 font-bold ml-1 font-sans tracking-wide">anos</span></div>
                <input 
                  type="range" min="18" max="70" value={localAge} 
                  onChange={(e) => setLocalAge(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 5 – Nível de Atividade */}
          {step === 5 && (
            <motion.div key="5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-6 absolute inset-0">
              <div className="space-y-2 text-center mt-2 mb-4">
                <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Qual seu nível de atividade?</h2>
                <p className="text-slate-500 font-medium">Define se você perderá peso ou se passará fome.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'sedentary', label: 'Sofa Surfer (Sedentário)', desc: 'Pouco ou nenhum exercício.' },
                  { id: 'light', label: 'Leve (1 a 3 dias/sem)', desc: 'Caminhadas ou exercícios leves.' },
                  { id: 'moderate', label: 'Moderado (3 a 5 dias/sem)', desc: 'Treino de força ou esporte frequente.' },
                  { id: 'intense', label: 'Intenso (6 a 7 dias/sem)', desc: 'Atleta, crossfit ou trabalho braçal.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLocalActivity(opt.id as 'sedentary' | 'light' | 'moderate' | 'intense')}
                    className={`p-5 rounded-[2rem] border-2 text-left transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] active:scale-[0.98] ${localActivity === opt.id ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                  >
                    <h3 className={`font-black text-[17px] tracking-tight ${localActivity === opt.id ? 'text-emerald-600' : 'text-slate-800'}`}>{opt.label}</h3>
                    <p className={`text-[13px] mt-1 font-medium ${localActivity === opt.id ? 'text-emerald-600/70' : 'text-slate-500'}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6 – Comorbidades / Saúde */}
          {step === 6 && (
            <motion.div key="6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-6 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Condições Médicas</h2>
                <p className="text-slate-500 font-medium">Tem alguma condição como Diabetes, Hipertensão, intolerância à lactose?</p>
              </div>
              <div className="flex flex-col flex-1 pb-10">
                <textarea 
                  value={localComorbidities}
                  onChange={(e) => setLocalComorbidities(e.target.value)}
                  placeholder="Se sim, descreva. Caso contrário, deixe em branco."
                  className="w-full flex-1 min-h-[150px] max-h-[250px] resize-none bg-white border border-slate-200 rounded-[2rem] p-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg shadow-inner placeholder:text-slate-300"
                />
              </div>
            </motion.div>
          )}

          {/* Step 7 – Medicamentos */}
          {step === 7 && (
            <motion.div key="7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Medicamentos</h2>
                <p className="text-slate-500 font-medium">Faz o uso contínuo de alguma medicação? (Ex: Puran T4, Ozempic, etc)</p>
              </div>
              <div className="flex flex-col flex-1 pb-10">
                <textarea 
                  value={localMedications}
                  onChange={(e) => setLocalMedications(e.target.value)}
                  placeholder="Se sim, digite os nomes. Caso contrário, deixe em branco."
                  className="w-full flex-1 min-h-[150px] max-h-[250px] resize-none bg-white border border-slate-200 rounded-[2rem] p-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg shadow-inner placeholder:text-slate-300"
                />
              </div>
            </motion.div>
          )}

          {/* Step 8 – Objetivo */}
          {step === 8 && (
            <motion.div key="8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-6 absolute inset-0">
              <div className="space-y-2 text-center mt-2 mb-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Qual sua prioridade?</h2>
                <p className="text-slate-500 font-medium">A IA adaptará a rigidez calórica.</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { id: 'fast', label: 'Emagrecimento Rápido', desc: 'Déficit de 500 kcal/dia — protocolo restrito e proteico' },
                  { id: 'moderate', label: 'Perda Moderada', desc: 'Déficit de 250 kcal/dia — equilíbrio sem abrir mão de tudo' },
                  { id: 'maintenance', label: 'Manter Peso', desc: 'Calorias de manutenção — foco em saúde e desinchar' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setLocalGoal(opt.id as 'fast' | 'moderate' | 'maintenance')}
                    className={`p-6 rounded-[2rem] border-2 text-left transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] active:scale-[0.98] ${localGoal === opt.id ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                  >
                    <h3 className={`font-black text-[17px] tracking-tight ${localGoal === opt.id ? 'text-emerald-600' : 'text-slate-800'}`}>{opt.label}</h3>
                    <p className={`text-[13px] mt-1.5 font-medium leading-relaxed ${localGoal === opt.id ? 'text-emerald-600/70' : 'text-slate-500'}`}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 9 – Peso desejado */}
          {step === 9 && (
            <motion.div key="9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-8 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-8">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Qual o peso desejado?</h2>
                <p className="text-slate-500 font-medium">Onde você quer chegar ao final do protocolo.</p>
              </div>
              <div className="flex flex-col items-center gap-6 mt-12">
                <div className="text-[72px] font-black text-cyan-500 tracking-tighter tabular-nums mb-8">{localTarget} <span className="text-[28px] text-slate-400 font-bold ml-1 font-sans tracking-wide">kg</span></div>
                <input 
                  type="range" min="40" max="150" value={localTarget} 
                  onChange={(e) => setLocalTarget(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="h-10 mt-6">
                  {localWeight - localTarget > 0 && (
                    <div className="px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 text-[13px] font-bold border border-emerald-100 uppercase tracking-wide">
                      Meta total: Perder {(localWeight - localTarget).toFixed(1)} kg
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 10 – Alergias */}
          {step === 10 && (
            <motion.div key="10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-6 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-4">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">Alergias ou Intolerâncias</h2>
                <p className="text-slate-500 font-medium">Glúten, lactose, frutos do mar? A IA usará isso para adaptar sua dieta.</p>
              </div>
              <div className="flex flex-col flex-1 pb-10">
                <textarea 
                  value={localAllergies}
                  onChange={(e) => setLocalAllergies(e.target.value)}
                  placeholder="Se sim, descreva. Caso contrário, deixe em branco."
                  className="w-full flex-1 min-h-[150px] max-h-[250px] resize-none bg-white border border-slate-200 rounded-[2rem] p-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg shadow-inner placeholder:text-slate-300"
                />
              </div>
            </motion.div>
          )}

          {/* Step 11 – Alimentos Indesejados */}
          {step === 11 && (
            <motion.div key="11" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center gap-6 absolute inset-0">
              <div className="space-y-2 text-center mt-4 mb-4">
                <h2 className="text-[30px] font-black text-slate-900 tracking-tight leading-tight">Alimentos que não gosta</h2>
                <p className="text-slate-500 font-medium">Não suporta fígado? Odeia ovo? Diga o que deve ser evitado a todo custo.</p>
              </div>
              <div className="flex flex-col flex-1 pb-10">
                <textarea 
                  value={localDislikedFoods}
                  onChange={(e) => setLocalDislikedFoods(e.target.value)}
                  placeholder="Se sim, digite os nomes. Caso contrário, deixe em branco."
                  className="w-full flex-1 min-h-[150px] max-h-[250px] resize-none bg-white border border-slate-200 rounded-[2rem] p-6 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg shadow-inner placeholder:text-slate-300"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-8 z-10 w-full bg-slate-50">
        <button 
          onClick={nextStep}
          disabled={isSaving}
          className="w-full relative flex items-center justify-center gap-3 py-4 sm:py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/30 disabled:opacity-70"
        >
          {isSaving ? 'Configurando IA...' : step === TOTAL_STEPS ? 'Salvar Meu Perfil' : 'Continuar'}
          {!isSaving && <ChevronRight className="w-[22px] h-[22px] stroke-[2.5]" />}
        </button>
      </div>

    </div>
  );
}
