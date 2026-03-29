'use client';

import { useProtocol } from '@/context/ProtocolContext';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Droplets, Target, Flame, ArrowRight, Plus, LogOut, CheckCircle2, ShoppingBasket, LineChart, Weight, TimerReset, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getLocalDateKey } from '@/lib/date';

export default function Dashboard() {
  const loadingMessages = [
    'Entendendo seu objetivo',
    'Montando suas refeições',
    'Calculando proteínas e calorias',
    'Ajustando sua meta de água',
    'Organizando substituições práticas',
    'Separando receitas detox e chás seca barriga',
    'Finalizando seu protocolo',
  ];
  const router = useRouter();
  const { user, logout } = useAuth();
  const { weight, targetWeight, streak, waterConsumed, waterTarget, plan, setPlan, goal, height, age, sex, activityLevel, comorbidities, medications, addProgress, progress, setWeight, setHeight, setAge, setSex, setActivityLevel, setComorbidities, setMedications, setGoal, setTargetWeight } = useProtocol();
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [errorPlan, setErrorPlan] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const fetchAttempted = useRef(false);

  const needsPasswordSetup = !!user && !user.hasPassword;

  // Sync Auth User Data into Protocol Context immediately if not present
  useEffect(() => {
    if (user) {
      if (user.weight && !weight) setWeight(user.weight);
      if (user.height && !height) setHeight(user.height);
      if (user.age && !age) setAge(user.age);
      if (user.sex && !sex) setSex(user.sex);
      if (user.activityLevel && !activityLevel) setActivityLevel(user.activityLevel);
      if (user.goal && !goal) setGoal(user.goal);
      if (user.targetWeight && !targetWeight) setTargetWeight(user.targetWeight);
      if (user.plan && !plan) setPlan(user.plan);
    }
  }, [user, weight, height, age, sex, activityLevel, goal, targetWeight, plan]);

  // Redirect to onboarding if profile is incomplete
  // FIX: usa Protocol context como fallback porque os dados são setados IMEDIATAMENTE
  // no onboarding antes do router.push. O AuthContext user pode estar desatualizado
  // (race condition) enquanto a re-fetch assíncrona do appfit:profile-updated ainda não terminou.
  useEffect(() => {
    const hasLocalData = !!(weight && age && sex && activityLevel && goal);
    if (user && !hasLocalData && (!user.weight || !user.age || !user.sex || !user.activityLevel || !user.goal)) {
      router.replace('/onboarding');
    }
  }, [user, weight, age, sex, activityLevel, goal, router]);

  // Auto-generate plan with backend se o plano não existe e o Onboarding FOI preenchido
  const generateProtocol = async () => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;
    setLoadingPlan(true);
    setErrorPlan(null);

    try {
      // Nova versão: não precisa mandar JSON Body. A Auth valida via JWT e pega DB direto
      const data = await apiFetch('/ai/generate-plan', { method: 'POST' });

      const hydratedWeeklyPlan = data.weeklyPlan?.map((day: any) => ({
        ...day,
        meals: day.meals.map((m: any) => ({ ...m, completed: false }))
      })) || [];

      setPlan({
        ...data,
        waterTarget: data.waterTarget || (user?.weight || 0) * 35,
        weeklyPlan: hydratedWeeklyPlan,
      });
    } catch (err: any) {
      console.error("Erro ao gerar plano:", err);
      setErrorPlan(err.message || 'Erro desconhecido ao conectar no servidor.');
      fetchAttempted.current = false; // Allow retry
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    const planIsStale = plan && !plan.weeklyPlan;
    
    // Agora baseamos a checagem no "user" vindo da base
    if ((!plan || planIsStale) && user?.weight && user?.goal && user?.age) {
      generateProtocol();
    }
  }, [plan, user]);

  useEffect(() => {
    if (!loadingPlan) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 1600);

    return () => window.clearInterval(interval);
  }, [loadingPlan]);

  useEffect(() => {
    if (!needsPasswordSetup) {
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setSavingPassword(false);
    }
  }, [needsPasswordSetup]);

  const handleCreatePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password || password.length < 4) {
      setPasswordError('Sua senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('A confirmação da senha não confere.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');

    try {
      await apiFetch('/auth/me/password', {
        method: 'POST',
        body: JSON.stringify({ password, confirmPassword }),
      });

      window.dispatchEvent(new Event('appfit:profile-updated'));
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Não foi possível salvar sua senha agora.');
    } finally {
      setSavingPassword(false);
    }
  };

  const todayDayOfWeek = new Date().getDay();
  const todaysPlan = plan?.weeklyPlan?.find(p => p.dayOfWeek === todayDayOfWeek);
  
  const completedMeals = todaysPlan?.meals.filter(m => m.completed).length || 0;
  const totalMeals = todaysPlan?.meals.length || 0;
  const mealProgress = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;
  
  const waterProgress = (waterConsumed / waterTarget) * 100;
  
  const nextMeal = todaysPlan?.meals.find(m => !m.completed);

  const todayWeight = progress.find(p => p.date === getLocalDateKey())?.weight;
  const shoppingSectionsCount = Object.values(plan?.shoppingList || {}).filter(
    (items) => Array.isArray(items) && items.length > 0,
  ).length;
  const tasks = [
    {
      label: 'Registrar peso',
      done: !!todayWeight,
      helper: todayWeight ? `${todayWeight} kg salvo hoje` : 'Ainda falta registrar hoje',
    },
    {
      label: 'Bater meta de água',
      done: waterConsumed >= waterTarget,
      helper: waterConsumed >= waterTarget ? 'Meta concluída' : `Faltam ${Math.max(waterTarget - waterConsumed, 0)} ml`,
    },
    {
      label: 'Concluir refeições',
      done: totalMeals > 0 && completedMeals === totalMeals,
      helper: totalMeals > 0 ? `${completedMeals} de ${totalMeals} concluídas` : 'Plano ainda não gerado',
    },
    {
      label: 'Lista da semana',
      done: shoppingSectionsCount > 0,
      helper: shoppingSectionsCount > 0 ? `${shoppingSectionsCount} categorias prontas` : 'Disponível após gerar o plano',
    },
  ];
  const completedTasks = tasks.filter((task) => task.done).length;
  const dayProgress = Math.round((completedTasks / tasks.length) * 100);
  const nextActionLabel = nextMeal ? nextMeal.title : loadingPlan ? 'Gerando protocolo' : errorPlan ? 'Servidor acordando' : 'Seu dia está em ordem';
  const nextActionDescription = nextMeal
    ? nextMeal.description
    : loadingPlan
      ? 'A IA está montando seu plano personalizado.'
      : errorPlan
        ? errorPlan
        : 'Você concluiu o essencial do dia. Pode revisar o plano ou evolução.';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_38%,#eef2ff_100%)] pb-32">
      {needsPasswordSetup && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 px-4 pb-24 pt-8 backdrop-blur-[2px] sm:items-center sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_80px_-28px_rgba(15,23,42,0.45)]"
          >
            <div className="bg-slate-950 px-6 pb-6 pt-7 text-white">
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-emerald-300">Primeiro acesso</p>
              <h2 className="mt-3 text-[1.9rem] font-black leading-[0.95] tracking-tight">
                Seu protocolo está sendo montado. Agora crie sua senha.
              </h2>
              <p className="mt-3 max-w-[30ch] text-sm font-medium leading-relaxed text-white/70">
                Assim, na próxima vez, você entra direto como cliente sem depender de novo email.
              </p>
            </div>

            <form onSubmit={handleCreatePassword} className="space-y-4 px-6 pb-6 pt-5">
              <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-800">
                {loadingPlan ? 'Enquanto a IA termina seu plano, deixe seu acesso pronto.' : 'Seu acesso vai ficar salvo para as próximas entradas.'}
              </div>

              <div className="space-y-2">
                <label className="pl-1 text-[0.72rem] font-black uppercase tracking-[0.22em] text-slate-400">
                  Crie sua senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha simples"
                  autoComplete="new-password"
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-2">
                <label className="pl-1 text-[0.72rem] font-black uppercase tracking-[0.22em] text-slate-400">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente"
                  autoComplete="new-password"
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {passwordError && (
                <div className="rounded-[1.1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-70"
              >
                {savingPassword ? 'Salvando senha...' : 'Salvar e continuar'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-10">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/90 px-6 pb-7 pt-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Bem-vinda de volta</p>
              <h1 className="mt-2 max-w-[12ch] text-[2.1rem] font-black leading-[0.96] tracking-tight text-slate-950">
                Seu dia está {dayProgress}% em ordem.
              </h1>
              <p className="mt-3 max-w-[26ch] text-[0.96rem] font-medium leading-relaxed text-slate-500">
                Abra o app e execute só o que falta hoje. Sem pensar demais, sem se perder.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <button
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:text-rose-500 active:scale-95"
                aria-label="Sair da conta"
              >
                <LogOut className="w-5 h-5" strokeWidth={2.4} />
              </button>

              <div className="flex flex-col items-center rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm shadow-emerald-500/10">
                <Flame className="mb-1 h-5 w-5 text-emerald-500" strokeWidth={2.5} />
                <span className="text-lg font-black leading-none text-emerald-700">{streak}</span>
                <span className="mt-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600/80">Dias</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 rounded-[1.8rem] bg-slate-950 px-5 py-5 text-white shadow-[0_18px_45px_-22px_rgba(15,23,42,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-black uppercase tracking-[0.24em] text-emerald-300">Ação do momento</p>
                <h2 className="mt-2 text-[1.8rem] font-black tracking-tight">{nextActionLabel}</h2>
                <p className="mt-2 line-clamp-2 max-w-[24ch] text-sm font-medium text-white/65">{nextActionDescription}</p>
                {loadingPlan && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[0.72rem] font-black uppercase tracking-[0.18em] text-emerald-200">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {loadingMessages[loadingMessageIndex]}
                  </div>
                )}
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-white/45">Hoje</p>
                {loadingPlan ? (
                  <div className="mt-2 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                  </div>
                ) : (
                  <p className="mt-1 text-xl font-black">{nextMeal?.time || '--:--'}</p>
                )}
              </div>
            </div>

            {loadingPlan && (
              <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-sm font-semibold">{loadingMessages[loadingMessageIndex]}</p>
                  </div>
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/45">
                    aguarde
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-300"
                    initial={{ x: '-65%' }}
                    animate={{ x: ['-65%', '110%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '58%' }}
                  />
                </div>
                <p className="mt-3 text-xs font-medium leading-relaxed text-white/55">
                  Estamos personalizando seu protocolo com base no seu objetivo, rotina, refeições e estratégias do dia. Isso pode levar alguns segundos.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              {errorPlan ? (
                <button
                  onClick={() => generateProtocol()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-rose-500/25"
                >
                  Tentar novamente
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href={nextMeal ? '/plan' : '/dashboard'}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/25"
                >
                  {nextMeal ? 'Ver refeição' : loadingPlan ? 'Gerando plano' : 'Dia concluído'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-black text-white/75">
                {completedMeals}/{totalMeals || 0}
              </div>
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
            <p className="mt-1 text-[1.9rem] font-black tracking-tight text-slate-950">{Math.round(waterConsumed / 100) / 10}L</p>
            <p className="mt-1 text-sm font-medium text-slate-400">de {Math.round(waterTarget / 100) / 10}L</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <motion.div
                className="h-2 rounded-full bg-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(waterProgress, 100)}%` }}
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
            <p className="mt-1 text-[1.9rem] font-black tracking-tight text-slate-950">{completedMeals}/{totalMeals || 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-400">{totalMeals > 0 ? 'concluídas hoje' : 'aguardando plano'}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <motion.div
                className="h-2 rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(mealProgress, 100)}%` }}
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
            {tasks.map((task) => (
              <div key={task.label} className="flex items-center gap-4 rounded-[1.4rem] border border-slate-100 bg-slate-50/80 px-4 py-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${task.done ? 'bg-emerald-500 text-white' : 'border border-slate-200 bg-white text-slate-400'}`}>
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
            {(todaysPlan?.meals.slice(0, 3) || []).map((meal, index) => (
              <div key={`${meal.time}-${meal.title}-${index}`} className="flex items-center gap-4 rounded-[1.4rem] bg-gradient-to-r from-slate-50 to-white px-4 py-4 ring-1 ring-slate-100">
                <div className="rounded-[1rem] bg-slate-950 px-3 py-2 text-center text-white">
                  <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-white/45">{meal.completed ? 'feito' : index === 0 ? 'agora' : 'depois'}</p>
                  <p className="mt-1 text-sm font-black">{meal.time}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black tracking-tight text-slate-900">{meal.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium text-slate-500">{meal.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </div>
            ))}

            {!loadingPlan && !todaysPlan && (
              <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                Seu plano de hoje ainda não apareceu aqui. Gere o protocolo ou tente novamente em instantes.
              </div>
            )}
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

          <button
            onClick={() => {
              const w = prompt('Qual seu peso hoje em kg?');
              if (w && !isNaN(Number(w))) addProgress(Number(w));
            }}
            className="rounded-[1.8rem] border border-slate-200/70 bg-white px-4 py-5 text-center shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)]"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-rose-50 text-rose-500">
              {todayWeight ? <Weight className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <p className="mt-3 text-sm font-black tracking-tight text-slate-900">Peso</p>
            <p className="mt-1 text-[0.72rem] font-medium text-slate-500">{todayWeight ? `${todayWeight} kg hoje` : 'Registrar agora'}</p>
          </button>
        </section>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-slate-400">Corpo e meta</p>
              <h3 className="mt-2 text-[1.55rem] font-black tracking-tight text-slate-950">Seu caminho visível.</h3>
            </div>
            <div className="rounded-[1rem] bg-slate-100 px-3 py-2 text-right">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-slate-400">Atual</p>
              <p className="mt-1 text-lg font-black text-slate-950">{weight ?? '--'} kg</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.22em] text-slate-400">Peso meta</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-cyan-500">{targetWeight ?? '--'} kg</p>
            </div>
            <div className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.22em] text-slate-400">Água sugerida</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-emerald-500">{Math.round(waterTarget / 100) / 10}L</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
