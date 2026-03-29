'use client';

import { Home, ClipboardList, Droplets, Camera, LineChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const hiddenOn = ['/', '/onboarding', '/paywall', '/login', '/auth/verify', '/auth/create-password', '/dashboard-preview', '/plan-preview', '/plan-preview-2'];
  
  if (hiddenOn.includes(pathname)) return null;

  const tabs = [
    { href: '/dashboard', icon: Home, label: 'Início' },
    { href: '/plan', icon: ClipboardList, label: 'Plano' },
    { href: '/scanner', icon: Camera, label: '', isCenter: true },
    { href: '/water', icon: Droplets, label: 'Água' },
    { href: '/progress', icon: LineChart, label: 'Evolução' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] pb-safe z-50 rounded-t-[2.5rem] border-t border-slate-100">
      <div className="flex justify-around items-end h-[88px] px-6 max-w-md mx-auto pb-6 relative">
        {tabs.map((tab, idx) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          
          if (tab.isCenter) {
            return (
              <div key={tab.href} className="absolute left-1/2 -ml-8 -top-8 bg-white p-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <Link href={tab.href} className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 hover:scale-105 transition-transform active:scale-95">
                  <Icon className="w-6 h-6 text-white" />
                </Link>
              </div>
            );
          }

          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center gap-1.5 transition-colors ${active ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
