'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Goal, Clock, Trophy } from 'lucide-react';

interface MockNotification {
  id: string;
  icon: typeof Goal;
  text: string;
  time: string;
  read: boolean;
}

// ⚠️ DEMO DATA. Real push notifications (goal alerts, match-start alerts)
// need a service worker + a push provider (Appwrite Messaging or Web
// Push) wired up server-side — planned for the Appwrite phase.
const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: '1', icon: Goal, text: 'هدف! الهلال 1 - 0 النصر', time: 'قبل 3 دقائق', read: false },
  { id: '2', icon: Clock, text: 'بدأت مباراة الاتحاد ضد الأهلي', time: 'قبل 20 دقيقة', read: false },
  { id: '3', icon: Trophy, text: 'ملخص الجولة الأخيرة من دوري روشن متاح الآن', time: 'أمس', read: true },
];

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen((v) => !v)} className="relative group cursor-pointer hidden sm:block" title="الإشعارات">
        <Bell size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-slate-800 font-bold text-white text-sm">الإشعارات</div>
          <div className="max-h-80 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 border-b border-slate-800/50 last:border-0 ${!n.read ? 'bg-slate-800/30' : ''}`}>
                <n.icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">{n.text}</p>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-950">إشعارات تجريبية — سيتم تفعيل الإشعارات الحقيقية لاحقًا</div>
        </div>
      )}
    </div>
  );
}
