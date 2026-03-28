'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, Check, PlayCircle,
  Camera, Utensils, Zap, Droplets, Clock, MessageSquare, Star, Award, Search, Activity, Fingerprint, RefreshCcw, Lock, User, ShoppingCart, Repeat
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

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

// Reusable CSS Phone component
const PhoneMockup = ({ children, dark = false }: { children?: ReactNode, dark?: boolean }) => (
  <div className={`relative mx-auto w-[250px] h-[480px] sm:w-[280px] sm:h-[540px] rounded-[40px] border-[8px] ${dark ? 'border-[#222] bg-[#111]' : 'border-slate-200 bg-white'} shadow-2xl overflow-hidden flex flex-col`}>
    <div className={`absolute top-0 inset-x-0 h-6 flex justify-center z-20`}>
      <div className={`w-32 h-6 ${dark ? 'bg-[#222]' : 'bg-slate-200'} rounded-b-2xl`}></div>
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
      <section className="relative pt-24 pb-48 px-6 overflow-hidden bg-white text-center">
        <div className="absolute inset-0 opacity-[0.25] pointer-events-none">
           <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-red-400 rounded-sm rotate-12"></div>
           <div className="absolute top-[30%] right-[15%] w-4 h-4 bg-emerald-400 rounded-full"></div>
           <div className="absolute top-[60%] left-[20%] w-3 h-3 bg-yellow-400 rotate-45"></div>
           <div className="absolute top-[15%] right-[25%] w-2 h-2 bg-indigo-400 rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase border border-red-100 mb-2">
            <Lock className="w-3.5 h-3.5" /> MÉTODO CLÍNICO VALIDADO PARA LEIGOS
          </div>
          <h1 className="text-[34px] sm:text-[58px] font-black leading-[1.1] tracking-tight text-slate-900 drop-shadow-sm">
            Acesso a um protocolo completo para desinchar e <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">perder até 10 kg em 30 dias</span> com alimentação estratégica e receitas detox
          </h1>
          <p className="text-lg sm:text-[22px] text-slate-500 font-medium max-w-3xl mx-auto leading-snug">
            O <strong className="text-slate-900">SECA APP</strong> assume o "trabalho sujo" de analisar sua comida por foto e calcular tudo no piloto automático para você voltar a ter resultados rápidos e práticos em sua vida.
          </p>
          <div className="pt-6 pb-6 w-full flex flex-col items-center">
            {primaryBtn("QUERO PERDER 10KG AGORA")}
            <p className="text-xs text-slate-400 mt-4 font-semibold flex items-center gap-1 justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acesso ao pacote unificado (Dietas + Scanner IA).</p>
          </div>

          <div className="relative w-full max-w-md mx-auto mt-6">
             <PhoneMockup>
                {/* Vídeo/Imagem mostrando o App em uso logo de cara */}
                <img 
                  src="/app-dashboard.png" 
                  alt="Dashboard App" 
                  className="w-full h-full object-cover object-top rounded-[32px] absolute inset-0 z-0 bg-slate-100" 
                />

                {/* DYNAMIC NOTIFICATIONS OVERLAY (Evolução Contínua) */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90%] z-20 h-20">
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
                          className={`w-full bg-white/95 backdrop-blur-md rounded-[20px] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex gap-3 items-center border ${notif.border} ${notif.glow} absolute top-0 left-0`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-tr ${notif.color} flex items-center justify-center rounded-full text-white shrink-0 shadow-inner animate-pulse`}>
                            <IconTag className="w-5 h-5" />
                          </div>
                          <div className="text-left w-full overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">{notif.title}</p>
                            <p className="text-[13px] font-black text-slate-800 leading-tight truncate">{notif.text}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
             </PhoneMockup>
             
             {/* Stats Card Overlapping */}
             <div className="absolute -bottom-16 sm:-bottom-20 left-1/2 -translate-x-1/2 w-[90%] sm:w-[580px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 p-6 sm:p-8 flex justify-between items-center z-30 transform hover:scale-[1.02] transition-transform">
                <div className="text-center flex-1">
                  <p className="text-indigo-600 font-black text-2xl sm:text-[42px] tracking-tighter leading-none">-10kg</p>
                  <p className="text-[10px] sm:text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-2">Meta Central (30 dias)</p>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center flex-1">
                  <p className="text-indigo-600 font-black text-2xl sm:text-[42px] tracking-tighter leading-none">Instant</p>
                  <p className="text-[10px] sm:text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-2">Scanner (Zero Cálculo)</p>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center flex-1">
                  <p className="text-indigo-600 font-black text-2xl sm:text-[42px] tracking-tighter leading-none">Zero</p>
                  <p className="text-[10px] sm:text-[12px] text-slate-500 font-bold uppercase tracking-widest mt-2">Receitas Complexas</p>
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
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="w-full px-6 py-10 rounded-3xl bg-red-950/20 border border-red-500/20 flex flex-col items-center justify-center text-center relative shadow-2xl shadow-black">
                  <RefreshCcw className="w-12 h-12 text-red-500 mb-4 animate-spin-slow" />
                  <p className="font-bold text-red-400">Dieta Restritiva</p>
                  <p className="text-sm text-red-300/60 font-medium">Você desiste no 3º dia.</p>
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

      {/* Block 2 (O Mecanismo Mágico - Light com Vídeo) */}
      <section className="bg-white py-24 sm:py-36 px-6 relative">
        <div className="absolute top-0 right-0 w-[40%] h-[400px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full"></div>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-12 sm:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 text-center sm:text-left order-2 sm:order-1">
            <span className="text-emerald-500 font-black tracking-widest uppercase text-sm">O ATALHO TECNOLÓGICO</span>
            <h2 className="text-[34px] sm:text-[48px] leading-[1.1] font-black tracking-tight text-slate-900">
              Tire uma foto, tenha a resposta em dois segundos.
            </h2>
            <p className="text-slate-500 text-lg sm:text-[22px] font-medium leading-relaxed">
              Dúvida se aquele doce estraga seus resultados? Literalmente: aponte o celular e tire foto. Nossa IA lê a matriz do prato, calcula e devolve as calorias ajustadas para você não quebrar o processo.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 sm:order-2 flex justify-center">
             <div className="relative w-full max-w-[280px] sm:max-w-[340px] rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-white bg-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="/scanner-pov.png" alt="POV Tirar Foto" className="w-full h-auto object-cover aspect-[9/16]" />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-2 shadow-lg animate-bounce hidden sm:block">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[24px] pointer-events-none"></div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-16">
            {[
              { icon: ShoppingCart, title: 'Lista de Compras Automática', desc: 'Chegue na feira sabendo tudo que precisa pro protocolo de 30 dias sem faltar nada.', color: 'text-indigo-500 bg-indigo-50' },
              { icon: Repeat, title: 'Variações Imediatas', desc: 'Não tem frango? Deslize e substitua na mesma hora por ovos ou peixe com exatidão.', color: 'text-sky-500 bg-sky-50' },
              { icon: Camera, title: 'Scanner IA Visual', desc: 'Tire fotos e jogue fora o trabalho robótico de digitar calorias manualmente.', color: 'text-emerald-500 bg-emerald-50' },
              { icon: Droplets, title: 'Receitas Detox Turbo', desc: 'Sucos exatos e chás que funcionam limpando e desinchando o corpo em 48h.', color: 'text-purple-500 bg-purple-50' },
              { icon: Activity, title: 'Cardápios Semanais IA', desc: 'Sua rotina programada pra semana. O seu único trabalho é consumir e ver secar.', color: 'text-red-500 bg-red-50' },
              { icon: ShieldCheck, title: 'Escudo Protetivo 24h', desc: 'Avisos amigáveis e flexibilidade diária pra você aguentar e criar foco constante.', color: 'text-teal-500 bg-teal-50' },
              { icon: Clock, title: 'Desbloqueio de Janelas', desc: 'Ajuste fácil de hidratação e horários pra esmagar a falsa fome mental do meio dia.', color: 'text-orange-500 bg-orange-50' },
              { icon: Award, title: 'Prêmios Secretos', desc: 'Receba recompensas reais ao atingir suas micrometas ao longo desse mês.', color: 'text-yellow-600 bg-yellow-50' },
            ].map((f, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} key={i} className="flex flex-col items-center text-center space-y-4 group">
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

      {/* Autoridade Médica/Nutricional (Dark mode bonitinho) */}
      <section className="bg-[#050505] text-white py-24 px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-center relative z-10">
           <div className="w-full aspect-square bg-[#111] rounded-[36px] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center p-2 relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
             <img src="/dra.png" alt="Dra. Validação" className="w-full h-full object-cover object-top rounded-[28px] opacity-90" />
           </div>
           
           <div className="space-y-6 text-center md:text-left">
             <div className="inline-block bg-indigo-500/20 text-indigo-400 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-widest border border-indigo-500/30">
                Endosso Clínico do App
             </div>
             <h2 className="text-[32px] md:text-[42px] font-black leading-tight tracking-tight">
               "Emagrecer não é fome, é sobre organizar a confusão alimentar de forma mecânica e simples."
             </h2>
             <p className="text-lg text-slate-400">
               "Minha experiência de 8 anos validou que fornecer um cardápio complexo afasta os pacientes dos primeiros 10kg de meta. Com as listas automáticas do SECA APP e a clareza nas substituições da rotina, a tecnologia vira o 'nutricionista de controle' morando no seu bolso."
             </p>
             <div className="pt-4 mt-4 border-t border-slate-800">
               <p className="font-bold text-xl text-white">Dra. Nome da Nutricionista</p>
               <p className="text-indigo-400 font-medium text-sm mt-1">Nutricionista Especialista — Pós Graduada (Substitua no app pelo seu perfil)</p>
             </div>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 sm:py-32 px-6 text-center border-b border-slate-100">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-[34px] sm:text-[46px] font-black text-slate-900 tracking-tight leading-[1.1]">Perder 10kg virou realidade palpável</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch h-full">
            <div className="w-full md:w-1/3 min-h-[420px] bg-slate-50 rounded-[32px] overflow-hidden relative group flex flex-col p-10 shadow-sm border border-slate-200 justify-between items-start text-left flex-shrink-0 transition-transform hover:-translate-y-2">
               <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /></div>
               <p className="font-bold text-slate-700 text-[18px] leading-relaxed italic border-t border-slate-200 pt-6 my-6 flex-1">"Fui pro mercado, abri a lista das minhas compras no app. Resolvido. Em 4 semanas já estava com -6kg bebendo as receitas certas."</p>
               <div className="w-full">
                  <div className="font-black text-slate-900 text-lg">Bruna T.</div>
                  <div className="text-emerald-500 font-bold text-xs uppercase pt-1">-6 KG (MÊS 1)</div>
               </div>
            </div>

            <div className="w-full md:w-1/3 min-h-[420px] bg-slate-50 rounded-[32px] overflow-hidden relative group flex flex-col p-10 shadow-sm border border-slate-200 justify-between items-start text-left flex-shrink-0 transition-transform hover:-translate-y-2">
               <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /><Star className="fill-yellow-400 w-5 h-5" /></div>
               <p className="font-bold text-slate-700 text-[18px] leading-relaxed italic border-t border-slate-200 pt-6 my-6 flex-1">"A facilidade brutal do Scanner apagou meu medo de falhar ao sair num sábado à noite."</p>
               <div className="w-full">
                  <div className="font-black text-slate-900 text-lg">Amanda F.</div>
                  <div className="text-emerald-500 font-bold text-xs uppercase pt-1">CONTROLE TOTAL MANTIDO</div>
               </div>
            </div>

             <div className="w-full md:w-1/3 min-h-[420px] bg-slate-100 rounded-[32px] overflow-hidden relative group flex flex-col p-10 shadow-lg border-2 border-slate-50 justify-between items-start text-left bg-gradient-to-br from-indigo-950 to-slate-900 flex-shrink-0 transition-transform hover:-translate-y-2">
               <div className="text-yellow-400 flex gap-1"><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /><Star className="fill-yellow-400 w-6 h-6" /></div>
               <p className="font-bold text-white/95 text-[20px] leading-relaxed flex-1 mt-6">"É tipo colocar um 'cheat mode' ativado na vida. Muito prático saber só fazer substituições quando falta frango. Emagreci."</p>
               <div className="w-full">
                  <div className="font-black text-white text-xl">Mariana Lopes</div>
                  <div className="text-indigo-400 font-bold text-sm">-11 KG EM 35 DIAS</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Oferta Irresistível unificada */}
      <section className="bg-slate-50 py-24 sm:py-32 px-6 border-b border-slate-200 relative">
        <div className="absolute left-[10%] top-[20%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
        <div className="max-w-[500px] mx-auto space-y-12 text-center relative z-10">
          <div className="space-y-4">
            <span className="text-indigo-600 font-black uppercase tracking-widest text-[14px]">O ÚLTIMO PASSO</span>
            <h2 className="text-[36px] sm:text-[46px] font-black text-slate-900 tracking-tight leading-[1.05]">Pacote Detox Inclusivo I.A</h2>
          </div>

          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-8 sm:p-14 rounded-[36px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border-2 border-slate-100/80 text-center relative overflow-hidden">
             
             <div className="absolute top-0 left-0 w-full bg-red-600 text-white font-black text-[12px] uppercase tracking-widest py-2 animate-pulse">
                Oferta Limitada Unificada Hoje
             </div>

             <div className="pt-8 pb-8 mb-8 border-b border-slate-100 flex flex-col items-center">
               <p className="text-slate-400 text-lg font-medium line-through mb-1">R$ 500 (Nutricionista + App Gringo)</p>
               <h3 className="text-[56px] font-black text-slate-900 tracking-tighter leading-none mt-2">R$ 29,90<span className="text-2xl text-slate-400 font-bold tracking-normal inline-block ml-1">/mês</span></h3>
               <p className="text-emerald-500 font-bold uppercase text-[13px] tracking-widest mt-4 bg-emerald-50 px-4 py-1.5 rounded-full inline-block border border-emerald-100/50">MENOS DE R$ 1 POR DIA</p>
             </div>

             <div className="space-y-5 mb-10 text-left w-full mx-auto px-1">
               {[
                 'Acesso Protocolo 30 Dias (Perder 10kg)', 
                 'Scanner Nutricional Ilimitado por IA', 
                 'Receitas Poderosas Detox + Chás', 
                 'Lista de Compras Atualizada na Aba', 
                 'Acesso Pacote Único (Tudo Liberado)'
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-4 text-[16px] text-slate-700 font-bold leading-snug">
                   <div className="w-6 h-6 bg-emerald-500 shadow-sm shadow-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                   </div>
                   {item}
                 </div>
               ))}
             </div>

             <div className="mb-6"><CountdownTimer /></div>

             <button 
               onClick={() => router.push('/onboarding')}
               className="w-full bg-[#21C55D] hover:bg-[#16A34A] text-white py-5 px-6 rounded-2xl font-black text-[19px] uppercase tracking-wide transition-all shadow-[0_15px_30px_-5px_rgba(34,197,94,0.4)] hover:scale-[1.03] active:scale-[0.98] border-b-4 border-[#15803d]"
             >
               CONCLUIR MEU ACESSO AQUI
             </button>
          </motion.div>
        </div>
      </section>

      {/* Garantia Apsoluta (Estilizada bonita) */}
      <section className="bg-[#111] py-20 px-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0,transparent_100%)]"></div>
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-600 to-amber-500 rounded-[32px] p-[3px] shadow-2xl relative z-10">
           <div className="bg-[#0A0A0A] rounded-[29px] p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-10 text-center sm:text-left">
             <div className="w-28 h-28 flex-shrink-0 from-amber-400 bg-gradient-to-tr to-yellow-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20">
               <Lock className="w-12 h-12 text-black" />
             </div>
             <div className="space-y-4">
               <h3 className="text-[28px] sm:text-[36px] font-black text-white tracking-tight leading-tight">Garantia de Queima Ouro — 7 Dias</h3>
               <p className="text-slate-300 text-lg leading-relaxed font-medium">
                 Abra sua lista de supermercado. Siga nossa biologia. Teste o scanner visual em tempo real. Se nos primeiros dias o seu corpo continuar o mesmo ou você odiar, com um botão você recebe todo o reembolso. Sem estresse. 
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* Footer Bonitinho */}
      <footer className="bg-[#111] py-16 px-6 border-t border-white/10 text-center flex flex-col items-center">
        <p className="font-black text-[26px] text-white tracking-tighter mb-8">SECA<span className="text-[#21C55D]">APP</span></p>
        
        <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm font-bold mb-10">
           <a href="#" className="hover:text-slate-300 transition-colors">Termos de Uso</a>
           <a href="#" className="hover:text-slate-300 transition-colors">Política Absoluta de Privacidade</a>
        </div>
        
        <p className="text-[13px] text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
          Este produto orienta via IA. Casos médicos isolados requerem liberação médica específica.<br/><br/>
          © 2026 SECA APP INT'L. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}
