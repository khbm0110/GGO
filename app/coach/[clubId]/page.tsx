'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowRight, Award, ListChecks } from 'lucide-react';
import TeamLogo from '@/components/TeamLogo';
import { data } from '@/lib/data';
import type { ClubProfile } from '@/types';

export default function CoachPage() {
  const params = useParams<{ clubId: string }>();
  const [club, setClub] = useState<ClubProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!params?.clubId) return;
    data.getClubById(params.clubId).then(setClub);
  }, [params?.clubId]);

  if (club === undefined) {
    return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--fg-faint)]">جارٍ التحميل...</div>;
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--fg)]">
        <div className="text-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <h2 className="text-2xl font-bold mb-2">عذراً</h2>
          <p className="text-[var(--fg-subtle)]">بيانات هذا الفريق غير متوفرة حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/club/${club.id}`} className="flex items-center gap-1 text-[var(--fg-subtle)] hover:text-[var(--fg)] text-sm mb-6 w-fit">
        <ArrowRight size={16} /> العودة لصفحة {club.name}
      </Link>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[var(--bg-surface-2)] border-2 border-[var(--border)] flex items-center justify-center">
          <User size={40} className="text-[var(--fg-faint)]" />
        </div>
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-black text-[var(--fg)]">{club.coach}</h1>
          <p className="text-[var(--fg-subtle)] flex items-center justify-center sm:justify-start gap-2 mt-1">
            <TeamLogo src={club.logo} alt={club.name} className="w-5 h-5" /> المدير الفني لـ{club.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] border border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center text-[var(--fg-faint)]">
          <ListChecks size={22} className="mx-auto mb-2" />
          <span className="text-sm font-bold">السجل التدريبي</span>
          <p className="text-xs mt-1">قريبًا</p>
        </div>
        <div className="bg-[color-mix(in_srgb,var(--bg-surface)_50%,transparent)] border border-dashed border-[var(--border-subtle)] rounded-xl p-6 text-center text-[var(--fg-faint)]">
          <Award size={22} className="mx-auto mb-2" />
          <span className="text-sm font-bold">الإنجازات</span>
          <p className="text-xs mt-1">قريبًا</p>
        </div>
      </div>
    </div>
  );
}
