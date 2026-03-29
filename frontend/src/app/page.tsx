'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, Check, PlayCircle,
  Camera, Utensils, Zap, Droplets, Clock, MessageSquare, Star, Award, Search, Activity, Fingerprint, RefreshCcw, Lock, User, ShoppingCart, Repeat, Users, TrendingDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState, useRef } from 'react';

// Timer component for Scarcity
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2 rounded-full font-black text-sm tracking-widest mx-auto w-fit border border-red-200 shadow-sm animate-pulse">
      ⏳ <span suppressHydrationWarning>{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}</span> PARA ENCERRAR AS VAGAS
    </div>
  );
};

// Animated number counter component
const AnimatedCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setDisplayValue(Math.floor(easeOutQuart * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

// Reusable CSS Phone component
const PhoneMockup = ({ children, dark = false }: { children?: ReactNode, dark?: boolean }) => (
  <div className={`relative mx-auto w-[300px] h-[580px] sm:w-[380px] sm:h-[720px] rounded-[40px] sm:rounded-[48px] border-[8px] sm:border-[10px] ${dark ? 'border-[#222] bg-[#111]' : 'border-slate-200 bg-white'} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col`}>
    <div className={`absolute top-0 inset-x-0 h-6 sm:h-7 flex justify-center z-20`}>
      <div className={`w-32 sm:w-40 h-6 sm:h-7 ${dark ? 'bg-[#222]' : 'bg-slate-200'} rounded-b-2xl sm:rounded-b-3xl`}></div>
    </div>
    <div className="flex-1 w-full h-full p-4 pt-12 flex flex-col items-center justify-center relative z-10">
      {children || <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><Activity /></div>}
    </div>
  </div>
);

export default function LandingPage() {
  const router = useRouter();

  const [activeNotification, setActiveNotification] = useState(0);
  const notifications = [
    { title: 'Evolução de Peso', text: 'Parabéns! Você perdeu 2.4 kg 🔥', icon: Award, color: 'from-emerald-400 to-green-500', glow: 'shadow-emerald-500/20', border: 'border-emerald-100/50' },
    { title: 'Metabolismo Acelerado', text: 'Seu corpo iniciou queima total 🚀', icon: Zap, color: 'from-orange-400 to-red-500', glow: 'shadow-orange-500/20', border: 'border-orange-100/50' },
    { title: 'Saúde Otimizada', text: 'Suas medidas abdominais caíram 👖', icon: Activity, color: 'from-indigo-400 to-purple-500', glow: 'shadow-indigo-500/20', border: 'border-indigo-100/50' },
    { title: 'Meta Projetada', text: '-10kg projetados para 30 dias 🎯', icon: Star, color: 'from-sky-400 to-blue-500', glow: 'shadow-sky-500/20', border: 'border-sky-100/50' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotification(prev => (prev + 1) % notifications.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const primaryBtn = (text: string) => (
    <button
      onClick={() => router.push('/onboarding')}
      className="bg-[#21C55D] hover:bg-[#16A34A] text-white px-8 sm:px-14 py-5 rounded-full font-black text-[18px] sm:text-[20px] transition-all hover:scale-105 active:scale-95 shadow-[0_15px_35px_-5px_rgba(34,197,94,0.4)] tracking-wide border-b-4 border-[#15803d] flex items-center gap-2 mx-auto justify-center"
    >
      {text}
    </button>
  );

  const featuredBenefits = [
    {
      icon: Camera,
      title: 'Scanner IA Visual',
      desc: 'Tire foto do prato e descubra calorias sem parar para digitar tudo manualmente.',
      color: 'from-emerald-500/20 to-emerald-100',
      iconColor: 'text-emerald-500',
      badge: 'Mais desejado',
    },
    {
      icon: ShoppingCart,
      title: 'Lista de Compras Automática',
      desc: 'Receba a semana organizada para comprar o necessário sem improviso e sem desperdício.',
      color: 'from-indigo-500/20 to-indigo-100',
      iconColor: 'text-indigo-500',
      badge: 'Semana pronta',
    },
    {
      icon: Activity,
      title: 'Cardápios Semanais IA',
      desc: 'Abra o app e siga um plano prático com refeições e substituições já pensadas para você.',
      color: 'from-red-500/20 to-red-100',
      iconColor: 'text-red-500',
      badge: 'Rotina guiada',
    },
  ];

  const supportingBenefits = [
    { icon: Repeat, title: 'Variações Imediatas', desc: 'Troque alimentos sem perder a linha do protocolo.', color: 'text-sky-500 bg-sky-50' },
    { icon: Droplets, title: 'Chás Seca Barriga Secretos', desc: 'Chás e receitas estratégicas para desinchar e manter o ritmo.', color: 'text-purple-500 bg-purple-50' },
    { icon: ShieldCheck, title: 'Escudo Protetivo 24h', desc: 'Avisos e apoio visual para não sair do foco.', color: 'text-teal-500 bg-teal-50' },
    { icon: Clock, title: 'Desbloqueio de Janelas', desc: 'Horários e hidratação mais organizados no dia a dia.', color: 'text-orange-500 bg-orange-50' },
    { icon: Award, title: 'Prêmios Secretos', desc: 'Pequenas recompensas para manter constância.', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/20 overflow-x-hidden">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-50 flex items-center justify-between">
        <div className="font-black text-xl tracking-tighter text-slate-900">
          SECA<span className="text-emerald-500">APP</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm text-slate-700 hover:text-emerald-600 hover:border-emerald-200 px-5 py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none focus:ring-4 ring-emerald-500/10 active:scale-95 flex items-center gap-2"
        >
          <span>Já comprei</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-6 sm:pb-10 px-6 overflow-visible bg-white">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] w-3 h-3 bg-red-400 rounded-sm rotate-12" />
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[30%] right-[15%] w-4 h-4 bg-emerald-400 rounded-full" />
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="absolute top-[60%] left-[20%] w-3 h-3 bg-yellow-400 rotate-45" />
          <motion.div animate={{ y: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[15%] right-[25%] w-2 h-2 bg-indigo-400 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 sm:gap-8 items-center">
          <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase border border-red-100 mb-2">
              <Lock className="w-3.5 h-3.5" /> está pronta para transformar seu corpo e sua saúde?
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-[36px] sm:text-[52px] lg:text-[60px] font-black leading-[1.05] tracking-tight text-slate-900 drop-shadow-sm">
              Um aplicativo que cuida da sua alimentação e te ajuda a desinchar com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">apoio de nutricionista</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg sm:text-[20px] text-slate-500 font-medium leading-snug">
              Cardápios prontos, chás seca barriga, sucos detox e cálculo de calorias por foto, tudo com suporte e comunidade de alunos no WhatsApp.
            </motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }} className="pt-6 pb-6 w-full flex flex-col items-center md:items-start">
              {primaryBtn("QUERO PERDER 10KG AGORA")}
              <p className="text-xs text-slate-400 mt-4 font-semibold flex items-center gap-1 justify-center md:justify-start"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acesso ao pacote unificado (Dietas + Scanner IA).</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative w-full h-[580px] sm:h-[760px] flex items-center justify-center mt-6 md:mt-0"
          >
            <div className="relative z-10 transform scale-[1.05] sm:scale-100 hover:scale-[1.08] sm:hover:scale-[1.03] transition-transform duration-500 origin-bottom">
              <PhoneMockup>
                {/* Vídeo/Imagem mostrando o App em uso logo de cara */}
                <img
                  src="/app-dashboard.png"
                  alt="Dashboard App"
                  className="w-full h-full object-cover object-top rounded-[32px] absolute inset-0 z-0 bg-slate-100"
                />

                {/* DYNAMIC NOTIFICATIONS OVERLAY (Evolução Contínua) */}
                <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-[90%] z-20">
                  <AnimatePresence mode="wait">
                    {notifications.map((notif, idx) => {
                      if (idx !== activeNotification) return null;
                      const IconTag = notif.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ y: -40, opacity: 0, scale: 0.95 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: -20, opacity: 0, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`w-full bg-white/95 backdrop-blur-md rounded-[20px] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex gap-3 items-center border ${notif.border} ${notif.glow} absolute top-0 left-0`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-tr ${notif.color} flex items-center justify-center rounded-full text-white shrink-0 shadow-inner animate-pulse`}>
                            <IconTag className="w-5 h-5" />
                          </div>
                          <div className="text-left w-full">
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{notif.title}</p>
                            <p className="text-[14px] sm:text-[15px] font-black text-slate-800 leading-tight">{notif.text}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </PhoneMockup>
            </div>
          </motion.div>
        </div>

        {/* Stats Card — tira slim abaixo do mockup */}
        <div className="mt-4 sm:-mt-10 max-w-3xl mx-auto px-4 relative z-30">
          <div className="w-full mx-auto bg-[#0A0A0A] rounded-[18px] sm:rounded-[28px] px-4 py-3 sm:py-6 sm:px-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/10">

            {/* Grid sempre 3 colunas */}
            <div className="grid grid-cols-3 divide-x divide-white/10 w-full text-center">

              {/* Usuários */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-6 py-1 sm:py-0">
                <div className="text-[20px] sm:text-[40px] font-black text-emerald-400 tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  +<AnimatedCounter value={175} suffix="mil" />
                </div>
                <p className="font-bold text-slate-500 text-[9px] sm:text-[13px] uppercase tracking-wide mt-0.5">Usuários</p>
              </div>

              {/* Kg Perdidos */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-6 py-1 sm:py-0">
                <div className="text-[20px] sm:text-[40px] font-black text-orange-400 tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                  +<AnimatedCounter value={714} suffix="kg" />
                </div>
                <p className="font-bold text-slate-500 text-[9px] sm:text-[13px] uppercase tracking-wide mt-0.5">Gordura Derretida</p>
              </div>

              {/* Receitas */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-6 py-1 sm:py-0">
                <div className="text-[20px] sm:text-[40px] font-black text-emerald-400 tracking-tighter leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  +<AnimatedCounter value={3} suffix="mil" />
                </div>
                <p className="font-bold text-slate-500 text-[9px] sm:text-[13px] uppercase tracking-wide mt-0.5">Receitas</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Block 1 (A Dor Intensa - Dark) */}
      <section className="bg-[#0A0A0A] text-white py-24 sm:py-40 px-6 relative">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[60%] h-[200px] bg-red-500/10 blur-[150px] pointer-events-none rounded-full"></div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-12 sm:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <PhoneMockup dark>
              <img
                src="/mockup-dieta-restritiva.png"
                alt="Dieta Restritiva"
                className="w-full h-full object-cover object-center absolute inset-0 z-0 rounded-[32px] opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/80 z-10" />

              <div className="absolute top-16 left-5 z-20 rotate-[-8deg] rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 shadow-[0_15px_40px_rgba(239,68,68,0.18)] backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-300">Restrição Total</p>
                <p className="mt-1 text-sm font-bold text-white">Sem arroz, sem pão, sem erro.</p>
              </div>

              <div className="absolute right-4 top-32 z-20 rotate-[7deg] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Mercado</p>
                <p className="mt-1 text-sm font-bold text-white">23 itens difíceis de achar</p>
              </div>

              <div className="absolute bottom-24 left-5 right-5 z-20 rounded-[28px] border border-white/10 bg-black/45 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-300">Cansaço mental</p>
                    <p className="mt-2 max-w-[180px] text-base font-black leading-tight text-white">
                      Muita regra, pouca vida real.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-300">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Pesar tudo', 'Contar tudo', 'Desistir de novo'].map((item) => (
                    <div key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] font-bold text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </PhoneMockup>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 text-center sm:text-left">
            <span className="text-red-500 font-black tracking-widest uppercase text-sm">A FALHA DOS MÉTODOS TRADICIONAIS</span>
            <h2 className="text-3xl sm:text-[46px] leading-[1.1] font-black tracking-tight">
              A culpa dos seus escorregões nunca foi sua.
            </h2>
            <p className="text-slate-400 text-lg sm:text-[22px] font-medium leading-relaxed">
              Planilhas complexas, compras difíceis de encontrar e pesar grãozinho de arroz esgotam sua paciência e força de vontade rápida. Você desiste porque precisa ser cozinheiro em vez de viver.
            </p>
            <p className="text-slate-300 text-lg sm:text-[20px] font-bold">
              Nossa tecnologia substitui os maus hábitos com um protocolo prático e automatizado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Block 2 (O Mecanismo Mágico - Agora Dark com Imagem Gerada) */}
      <section className="bg-[#0A0A0A] border-t border-white/5 py-24 sm:py-36 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[40%] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 sm:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 text-center md:text-left order-1 md:order-1 relative z-10">
            <span className="text-emerald-500 font-black tracking-widest uppercase text-[14px]">O Scan Tecnológico</span>
            <h2 className="text-[34px] sm:text-[48px] leading-[1.1] font-black tracking-tight text-white">
              Tire uma foto, tenha a resposta em dois segundos.
            </h2>
            <p className="text-slate-400 text-lg sm:text-[22px] font-medium leading-relaxed">
              Dúvida se aquele doce estraga seus resultados? Literalmente: aponte o celular e tire foto. Nossa IA lê a matriz do prato, calcula e devolve as calorias ajustadas para você não quebrar o processo.
            </p>
            <div className="pt-4 flex flex-col md:flex-row items-center gap-4 hidden sm:flex">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-bold max-w-xs">Mais de 12.000 alimentos reconhecidos instantaneamente.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-2 flex justify-center">
            <div className="relative w-full max-w-[320px] sm:max-w-[380px] md:max-w-[460px] origin-center transform transition-all duration-700 hover:scale-[1.02]">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-[34px] opacity-20 blur-xl"></div>
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-black group">
                <video
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src="/scanner-demo.webm" type="video/webm" />
                  <source src="/scanner-demo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid de Benefícios Focados (O Pacote Bonitinho Refatorado) */}
      <section className="bg-slate-50 py-24 sm:py-36 px-6 text-center border-b border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1]">
              Os pilares de quem se liberta de esforços repetitivos
            </h2>
            <p className="text-slate-500 text-lg sm:text-[22px] font-medium pt-2">
              Transformamos um processo frustrante em apenas seguir instruções diárias simplificadas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredBenefits.map((f, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                key={f.title}
                className="group rounded-[30px] border border-slate-200 bg-white p-7 text-left shadow-[0_18px_45px_-24px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-26px_rgba(15,23,42,0.28)]"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${f.color} shadow-sm`}>
                    <f.icon className={`h-8 w-8 ${f.iconColor}`} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-[22px] font-black tracking-tight text-slate-900">{f.title}</h3>
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10">
            {supportingBenefits.map((f, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} key={f.title} className="flex flex-col items-center text-center space-y-4 group">
                <div className={`w-[60px] h-[60px] rounded-[18px] flex items-center justify-center ${f.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-black text-[17px] text-slate-800 tracking-tight">{f.title}</h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium px-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dobra 5: Autoridade Médica/Nutricional */}
      <section className="bg-[#050505] text-white py-24 sm:py-32 px-6 border-b border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-[4fr_5fr] gap-12 sm:gap-20 items-center relative z-10">
          <div className="w-full aspect-[4/5] bg-[#111] rounded-[36px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center relative translate-y-0 group hover:-translate-y-2 transition-transform duration-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src="/dra.png" alt="Jamilly Rodrigues" className="w-full h-full object-cover object-top opacity-100" />
            <div className="absolute bottom-6 left-6 z-20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-md">Supervisão Nutricional</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 text-center md:text-left">
            <div className="inline-block bg-indigo-500/20 text-indigo-400 font-bold px-4 py-1.5 rounded-full text-[13px] uppercase tracking-widest border border-indigo-500/30">
              Autoridade do Protocolo
            </div>
            <h2 className="text-[32px] md:text-[42px] font-black leading-tight tracking-tight">
              “Você não precisa continuar se olhando no espelho e sentindo que perdeu o controle do próprio corpo.”
            </h2>
            <p className="text-lg sm:text-[20px] text-slate-400 leading-relaxed font-medium">
              Com supervisão da nutricionista Jamilly Rodrigues, CRN 16822, o SECA APP foi pensado para transformar confusão, culpa e recomeços em uma rotina simples, guiada e possível de seguir. A proposta do protocolo é tirar o peso mental de decidir tudo sozinha e devolver clareza ao que fazer no dia a dia.
            </p>
            <p className="text-lg sm:text-[20px] text-slate-300 leading-relaxed font-bold">
              Em vez de mais uma dieta que te pressiona, te culpa e te faz desistir, o app organiza sua alimentação para você voltar a sentir direção, leveza e progresso real no próprio corpo.
            </p>
            <div className="pt-6 mt-6 border-t border-slate-800">
              <p className="font-black text-[20px]">Jamilly Rodrigues</p>
              <p className="text-slate-500 font-bold text-[13px] uppercase tracking-widest mt-1">Nutricionista responsável pelo protocolo • CRN 16822</p>
            </div>
          </div>
        </div>
      </section>

      {/* Provas sociais */}
      <section className="bg-white py-24 sm:py-36 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
            <span className="text-emerald-500 font-black tracking-widest uppercase text-[14px]">Resultados Reais</span>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1]">
              Histórias de quem entrou, seguiu e sentiu diferença no corpo e na rotina
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full bg-white rounded-[32px] overflow-hidden relative group flex flex-col p-8 sm:p-10 shadow-lg border-2 border-slate-50 justify-between items-start text-left h-[420px]">
                <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /></div>
                <p className="font-bold text-slate-700 text-[18px] leading-relaxed italic border-t border-slate-200 pt-6 my-6 flex-1">"Fui pro mercado, abri a lista das minhas compras no app. Resolvido. Em 4 semanas já estava com -6kg bebendo as receitas certas."</p>
                <div className="w-full mt-auto">
                  <div className="flex items-center gap-4">
                    <img src="/avatar_bruna_1774678119619.png" alt="Avatar Bruna" className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-emerald-500/20" />
                    <div>
                      <div className="font-black text-slate-900 text-lg leading-tight">Bruna C.</div>
                      <div className="text-emerald-500 font-bold text-[11px] uppercase mt-0.5 bg-emerald-50 px-2 py-0.5 rounded inline-block">-6 KG EM 4 SEMANAS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full bg-white rounded-[32px] overflow-hidden relative group flex flex-col p-8 sm:p-10 shadow-lg border-2 border-slate-50 justify-between items-start text-left h-[420px]">
                <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /></div>
                <p className="font-bold text-slate-700 text-[18px] leading-relaxed italic border-t border-slate-200 pt-6 my-6 flex-1">"A facilidade brutal do Scanner apagou meu medo de falhar ao sair num sábado à noite."</p>
                <div className="w-full mt-auto">
                  <div className="flex items-center gap-4">
                    <img src="/avatar_amanda_1774678168549.png" alt="Avatar Amanda F." className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-emerald-500/20" />
                    <div>
                      <div className="font-black text-slate-900 text-lg leading-tight">Amanda F.</div>
                      <div className="text-emerald-500 font-bold text-[11px] uppercase mt-0.5 bg-emerald-50 px-2 py-0.5 rounded inline-block">CONTROLE TOTAL MANTIDO</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full bg-slate-100 rounded-[32px] overflow-hidden relative group flex flex-col p-8 sm:p-10 shadow-lg border-2 border-slate-50 justify-between items-start text-left bg-gradient-to-br from-indigo-950 to-slate-900 flex-shrink-0 transition-transform hover:-translate-y-2 h-[420px]">
                <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /></div>
                <p className="font-bold text-white/95 text-[19px] leading-relaxed flex-1 mt-6">"É tipo colocar um 'cheat mode' ativado na vida. Prático saber fazer pequenas substituições quando falta algo. Emagreci comendo bem."</p>
                <div className="w-full mt-auto">
                  <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Avatar Mariana" className="w-14 h-14 rounded-full object-cover shadow-xl ring-2 ring-indigo-500" />
                    <div>
                      <div className="font-black text-white text-xl leading-tight">Mariana Lopes</div>
                      <div className="text-indigo-400 font-bold text-xs uppercase mt-0.5">-11 KG EM 35 DIAS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Oferta Irresistível unificada (Agora Dark + Mockup Lateral) */}
      <section className="bg-[#0A0A0A] py-24 sm:py-36 px-6 relative border-t border-white/5 overflow-hidden">
        <div className="absolute left-[10%] top-[20%] w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1fr] gap-16 lg:gap-24 items-center relative z-10">
          
          <div className="space-y-10 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-emerald-500 font-black uppercase tracking-widest text-[14px]">ACESSO IMEDIATO</span>
              <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-black text-white tracking-tight leading-[1.05]">
                O passe final para destravar o seu emagrecimento
              </h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#111] p-8 sm:p-12 rounded-[36px] shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-emerald-600 text-white font-black text-[12px] uppercase tracking-widest py-2 text-center">
                Vagas com Desconto Liberadas Hoje
              </div>

              <div className="pt-10 pb-8 mb-8 border-b border-white/10 flex flex-col md:items-start items-center">
                <p className="text-slate-400 text-lg font-medium line-through mb-1">Valor Original: R$ 450</p>
                <h3 className="text-[50px] sm:text-[60px] font-black text-white tracking-tighter leading-none mt-1">
                  R$ 29,90<span className="text-2xl text-slate-500 font-bold tracking-normal inline-block ml-1">/mês</span>
                </h3>
                <p className="text-emerald-400 font-bold uppercase text-[12px] tracking-widest mt-4 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block border border-emerald-500/20">
                  ASSINATURA SEMESTRAL GARANTIDA
                </p>
              </div>

              <div className="space-y-4 mb-10 text-left w-full">
                {[
                  'App Protocolo 30 Dias (-10kg)',
                  'Scanner IA Fotográfico Ilimitado',
                  'Sucos Detox & Chás Queimadores',
                  'Lista de Mercado Gerada no App'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-[16px] text-slate-300 font-bold">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mb-6"><CountdownTimer /></div>

              <button
                onClick={() => router.push('/onboarding')}
                className="w-full bg-[#21C55D] hover:bg-[#16A34A] text-white py-5 px-6 rounded-2xl font-black text-[18px] uppercase tracking-wide transition-all shadow-[0_15px_30px_-5px_rgba(34,197,94,0.3)] hover:scale-[1.03] active:scale-[0.98] border-b-4 border-[#15803d]"
              >
                GARANTIR MINHA VAGA AGORA
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[650px] sm:h-[750px] flex items-center justify-center hidden md:flex perspective-1000">
            <div className="transform rotate-y-[-15deg] rotate-x-[5deg] scale-110 shadow-2xl transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0">
              <PhoneMockup dark>
                <div className="w-full h-full bg-[#111] absolute inset-0 rounded-[32px] overflow-hidden flex flex-col p-6 items-center text-center justify-center border border-white/5">
                  <ShieldCheck className="w-16 h-16 text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <h3 className="text-white font-black text-[24px] mb-2">Acesso Liberado</h3>
                  <p className="text-slate-400 font-medium text-[15px] mb-10 px-4">Seu ambiente seguro já está preparado para receber seu acesso VIP.</p>
                  
                  <div className="w-full space-y-4">
                    <div className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 mr-4"></div>
                      <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 animate-pulse delay-75">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 mr-4"></div>
                      <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Garantia Absoluta com Selos Modernizados */}
      <section className="bg-[#050505] border-t border-white/5 py-20 px-6 overflow-hidden relative">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          <div className="bg-gradient-to-br from-emerald-900/40 to-black rounded-[40px] p-[2px] shadow-2xl shadow-emerald-900/20 relative z-10 w-full mb-12">
            <div className="bg-[#0A0A0A] rounded-[38px] p-8 sm:p-14 flex flex-col md:flex-row items-center gap-10 md:gap-16 text-center md:text-left">
              
              {/* Selo Visual Desenhado */}
              <div className="w-40 h-40 flex-shrink-0 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                <div className="w-full h-full border-[6px] border-emerald-500 rounded-full flex flex-col items-center justify-center relative bg-[#111] shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]">
                  <span className="font-black text-[46px] text-white leading-none tracking-tighter">7</span>
                  <span className="font-bold text-[14px] text-emerald-400 uppercase tracking-widest mt-1">Dias Seguros</span>
                  
                  {/* Fitas decorativas laterais */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0A0A0A]"></div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0A0A0A]"></div>
                </div>
                <div className="absolute bottom-[-10px] bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-[#0A0A0A]">
                  Garantia
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[30px] sm:text-[40px] font-black text-white tracking-tight leading-[1.1]">Risco Zero e Satisfação Padrão Ouro</h3>
                <p className="text-slate-400 text-[17px] sm:text-[19px] leading-relaxed font-medium">
                  Abra sua lista, siga o mecanismo de scanner por fotos. Se o seu corpo continuar o mesmo ou se você simplesmente se arrepender da experiência visual, basta um toque para receber seu dinheiro de volta integralmente. Simples, justo e transparente.
                </p>
              </div>
            </div>
          </div>

          {/* Logos Security and Payment Strip */}
          <div className="flex flex-col items-center gap-6 opacity-60">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-widest uppercase">
              <Lock className="w-4 h-4" /> Pagamento 100% Criptografado SSL
            </div>
            <div className="flex gap-4 sm:gap-8 flex-wrap justify-center items-center invert grayscale brightness-200">
              <div className="text-[20px] font-black tracking-tighter border-2 px-2 py-0.5 rounded">VISA</div>
              <div className="text-[20px] font-black tracking-tighter flex"><div className="w-6 h-6 rounded-full bg-current mix-blend-multiply"></div><div className="w-6 h-6 rounded-full bg-current -ml-3 mix-blend-multiply"></div><span className="ml-2 pt-0.5 text-[15px]">mastercard</span></div>
              <div className="text-[20px] font-black tracking-tighter flex items-center font-serif italic pr-2">Amex</div>
              <div className="text-[20px] font-black tracking-tighter text-emerald-500 border border-current px-3 py-0.5 rounded-full flex items-center gap-1"><Zap className="w-4 h-4 fill-current"/> PIX</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="bg-[#000] py-16 px-6 text-center flex flex-col items-center">
        <p className="font-black text-[26px] text-white tracking-tighter mb-8 opacity-50">SECA<span className="text-emerald-600">APP</span></p>

        <div className="flex flex-wrap justify-center gap-6 text-slate-600 text-sm font-bold mb-10">
          <a href="#" className="hover:text-emerald-500 transition-colors">Termos Privados de Uso</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">Política Absoluta de Privacidade</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">Aviso Legal</a>
        </div>

        <p className="text-[12px] text-slate-700 font-medium max-w-xl mx-auto leading-relaxed">
          Os resultados variam de indivíduo para indivíduo, baseados em compromisso biológico intrínseco. Nenhuma recomendação aqui feita substitui orientações estritas do seu conselho médico pessoal.<br /><br />
          © 2026 Inteligência Nutricional SECA APP.
        </p>
      </footer>

    </div>
  );
}
