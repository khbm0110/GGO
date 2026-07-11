'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Trophy, Youtube, Calendar, User as UserIcon, LogIn, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SearchModal from './SearchModal';
import NotificationsPanel from './NotificationsPanel';
import { data } from '@/lib/data';
import type { Article } from '@/types';

const NAV_ITEMS = [
  { label: 'الرئيسية', path: '/' },
  { label: 'الأندية', path: '/clubs' },
  { label: 'دوري الأبطال', path: '/country/champions-league' },
  { label: 'الدوري الإنجليزي', path: '/country/england' },
  { label: 'الدوري الإسباني', path: '/country/spain' },
  { label: 'الدوري السعودي', path: '/country/saudi' },
  { label: 'الدوري الإماراتي', path: '/country/uae' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const pathname = usePathname();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    data.getArticles().then(setArticles);
  }, []);

  return (
    <header className="bg-secondary border-b border-slate-800 sticky top-0 z-50 shadow-lg shadow-slate-950/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button */}
          <button className="lg:hidden text-slate-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-700 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform relative">
              <Trophy className="text-white" size={20} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white leading-none">
                gool<span className="text-primary">zon</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest font-bold">نبض الكرة العالمية</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-4 space-x-reverse overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
                  pathname === item.path
                    ? 'text-primary border-b-2 border-primary py-5'
                    : 'text-slate-300 hover:text-white py-5 border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-bold whitespace-nowrap transition-colors duration-200 flex items-center gap-1 ${
                  pathname?.startsWith('/admin')
                    ? 'text-red-500 border-b-2 border-red-500 py-5'
                    : 'text-slate-300 hover:text-red-400 py-5 border-b-2 border-transparent'
                }`}
              >
                <Shield size={14} /> لوحة التحكم
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <NotificationsPanel />

            <Link href="/matches" className="text-slate-300 hover:text-primary transition-colors hidden sm:block" title="المباريات">
              <Calendar size={20} />
            </Link>

            <Link href="/videos" className="text-slate-300 hover:text-red-500 transition-colors hidden sm:block" title="فيديو">
              <Youtube size={20} />
            </Link>

            <button onClick={() => setIsSearchOpen(true)} className="text-slate-300 hover:text-primary transition-colors" title="بحث">
              <Search size={20} />
            </button>

            {currentUser ? (
              <Link
                href={isAdmin ? '/admin' : '/profile'}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 overflow-hidden"
                title={isAdmin ? 'لوحة التحكم' : 'الملف الشخصي'}
              >
                {currentUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={16} />
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-bold transition-colors border border-primary/30"
              >
                <LogIn size={14} className="ml-1" />
                دخول
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-slate-800 my-2 pt-2">
              {currentUser ? (
                <Link href={isAdmin ? '/admin' : '/profile'} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-primary font-bold">
                  مرحباً، {currentUser.name}
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white font-bold flex items-center gap-2">
                  <LogIn size={16} className="text-primary" />
                  تسجيل الدخول
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-red-400 hover:text-red-300 font-bold flex items-center gap-2">
                  <Shield size={16} /> لوحة التحكم
                </Link>
              )}
              <Link href="/matches" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white">مباريات اليوم</Link>
              <Link href="/videos" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white">فيديو</Link>
              <Link href="/clubs" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-slate-300 hover:text-white">الأندية</Link>
            </div>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} articles={articles} />
    </header>
  );
}
