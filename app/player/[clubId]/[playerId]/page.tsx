'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowRight, TrendingUp, Award, Repeat, HeartPulse } from 'lucide-react';
import TeamLogo from '@/components/TeamLogo';
import { data } from '@/lib/data';
import type { Player, ClubProfile } from '@/types';
import type { TransferRecord, InjuryRecord, AwardRecord } from '@/types/community';

export default function PlayerDetailPage() {
  const params = useParams<{ clubId: string; playerId: string }>();
  const [result, setResult] = useState<{ player: Player; club: ClubProfile } | null | undefined>(undefined);
  const [career, setCareer] = useState<{ transfers: TransferRecord[]; injuries: InjuryRecord[]; awards: AwardRecord[] } | null>(null);

  useEffect(() => {
    if (!params?.clubId || !params?.playerId) return;
    data.getPlayerById(params.clubId, params.playerId).then(setResult);
    data.getPlayerCareerData(params.clubId, params.playerId).then(setCareer);
  }, [params?.clubId, params?.playerId]);

  if (result === undefined) {
    return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--fg-faint)]">جارٍ التحميل...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center text-[var(--fg)]">
        <div className="text-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <h2 className="text-2xl font-bold mb-2">عذراً</h2>
          <p className="text-[var(--fg-subtle)]">بيانات هذا اللاعب غير متوفرة حالياً.</p>
          <Link href="/clubs" className="text-primary mt-4 inline-block font-bold hover:underline">العودة للأندية</Link>
        </div>
      </div>
    );
  }

  const { player, club } = result;
  const primaryColor = club.colors?.primary || '#10b981';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href={`/club/${club.id}`} className="flex items-center gap-1 text-[var(--fg-subtle)] hover:text-[var(--fg)] text-sm mb-6 w-fit">
        <ArrowRight size={16} /> العودة لصفحة {club.name}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div
            className="relative w-full max-w-[260px] aspect-[2/3] rounded-t-3xl rounded-b-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: primaryColor, background: `linear-gradient(160deg, ${primaryColor}33, #0f172a 60%)` }}
          >
            <div className="absolute top-6 right-5 flex flex-col items-center gap-1 z-20">
              <span className="text-4xl font-black leading-none text-[var(--fg)]">{player.rating}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">{player.position}</span>
              <div className="w-8 h-8 mt-2">
                <TeamLogo src={club.logo} alt={club.name} className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full flex items-end justify-center h-4/5">
              {player.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.image} alt={player.name} className="w-full h-auto object-contain drop-shadow-2xl" />
              ) : (
                <User size={160} className="text-white/20" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-black text-[var(--fg)] mt-4 text-center">{player.name}</h1>
          {player.englishName && <p className="text-[var(--fg-faint)] text-xs">{player.englishName}</p>}
          <p className="text-[var(--fg-subtle)] text-sm">#{player.number} • {club.name}{player.age ? ` • ${player.age} سنة` : ''}</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6">
            <h3 className="font-bold text-[var(--fg)] mb-4 text-lg border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> الإحصائيات الفنية
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {(['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const).map((key) => (
                <div key={key} className="text-center">
                  <span className="block text-2xl font-black text-[var(--fg)]">{player.stats?.[key] ?? '-'}</span>
                  <span className="text-[10px] text-[var(--fg-faint)] font-bold uppercase tracking-widest">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {player.seasonStats && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--fg)] mb-4 text-lg border-b border-[var(--border-subtle)] pb-2">أداء الموسم الحالي</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="المباريات" value={player.seasonStats.matches} />
                <Stat label="الأهداف" value={player.seasonStats.goals} />
                <Stat label="التمريرات الحاسمة" value={player.seasonStats.assists} />
                <Stat label="متوسط التقييم" value={player.seasonStats.rating} />
              </div>
            </div>
          )}

          {player.marketValue !== undefined && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 flex items-center justify-between">
              <span className="text-[var(--fg-subtle)] font-bold">القيمة السوقية التقديرية</span>
              <span className="text-2xl font-black text-emerald-400">€{player.marketValue.toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <CareerSection icon={Repeat} label="سجل الانتقالات" isEmpty={!career || career.transfers.length === 0}>
              {career?.transfers.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-3 bg-[var(--bg-base)] rounded-lg">
                  <span className="text-[var(--fg-muted)]">{t.from} ← {t.to}</span>
                  <span className="text-[var(--fg-faint)] text-xs">{t.season} • {t.type === 'loan' ? 'إعارة' : t.type === 'free' ? 'انتقال حر' : 'انتقال نهائي'}</span>
                </div>
              ))}
            </CareerSection>

            <CareerSection icon={HeartPulse} label="الإصابات" isEmpty={!career || career.injuries.length === 0}>
              {career?.injuries.map((inj, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-3 bg-[var(--bg-base)] rounded-lg">
                  <span className="text-[var(--fg-muted)]">{inj.type}</span>
                  <span className={`text-xs font-bold ${inj.status === 'active' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {inj.status === 'active' ? 'مستمرة' : 'تعافى'}
                  </span>
                </div>
              ))}
            </CareerSection>

            <CareerSection icon={Award} label="الجوائز" isEmpty={!career || career.awards.length === 0}>
              {career?.awards.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-3 bg-[var(--bg-base)] rounded-lg">
                  <span className="text-[var(--fg-muted)]">{a.title}</span>
                  <span className="text-[var(--fg-faint)] text-xs">{a.season}</span>
                </div>
              ))}
            </CareerSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] p-3 text-center">
      <span className="block text-xl font-black text-[var(--fg)]">{value}</span>
      <span className="text-[10px] text-[var(--fg-faint)] font-bold">{label}</span>
    </div>
  );
}

function CareerSection({
  icon: Icon,
  label,
  isEmpty,
  children,
}: {
  icon: typeof Repeat;
  label: string;
  isEmpty: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6">
      <h3 className="font-bold text-[var(--fg)] mb-4 text-lg border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
        <Icon size={18} className="text-primary" /> {label}
      </h3>
      {isEmpty ? (
        <p className="text-[var(--fg-faint)] text-sm text-center py-4">لا توجد بيانات مسجلة حاليًا — تحتاج ربط مزود بيانات حي (مثل API-Football).</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}
