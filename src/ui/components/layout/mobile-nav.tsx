'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { TransactionTypeModal } from './transaction-type-modal';

const navItems = [
  {
    href: '/',
    label: 'Início',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/diagnostico',
    label: 'Análise',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/meus-diagnosticos',
    label: 'Histórico',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/documentos',
    label: 'Docs',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '/diagnostico') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/20 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-orange-50' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <TransactionTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}