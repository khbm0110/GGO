'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, CalendarDays, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { currentUser, isAdmin } = useAuth();

  const navItems = [
    {
      label: 'الأخبار',
      path: '/',
      icon: Newspaper,
    },
    {
      label: 'مركز المباريات',
      path: '/scores',
      icon: CalendarDays,
    },
    {
      label: 'الحساب',
      path: isAdmin ? '/admin' : (currentUser ? '/profile' : '/login'),
      icon: User,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? pathname === '/' : pathname?.startsWith(item.path);
          
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              <Icon size={24} className={isActive ? 'fill-primary/20' : ''} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
