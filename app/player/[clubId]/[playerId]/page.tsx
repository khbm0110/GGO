'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, ArrowRight, TrendingUp, ShieldAlert, Award, Repeat } from 'lucide-react';
import TeamLogo from '@/components/TeamLogo';
import { data } from '@/lib/data';
import type { Player, ClubProfile } from '@/types';

export default function PlayerDetailPage() {
  const params = useParams<{ clubId: string; playerId: string }>();
  const [result, setResult] = useState<{ player: Player; club: ClubProfile } | null | undefined>(undefined);

  useEffect(() => {
    if (!params?.clubId || !params?.playerId) return;
    data.getPlayerById(params.clubId, params.playerId).then(setResult);
  }, [params?.clubId, params?.playerId]);

  if (result === undefined) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">جارٍ التحميل...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center p-8 bg-slate-900 rounded-xl border border-slate-800">
          <h2 className="text-2xl font-bold mb-2">عذراً</h2>
          <p className="text-slate-400">بيانات هذا اللاعب غير متوفرة حالياً.</p>
          <Link href="/clubs" className="text-primary mt-4 inline-block font-bold hover:underline">العودة للأندية</Link>
        </div>
      </div>
    );
  }

  const { player, club } = result;
  const primaryColor = club.colors?.primary || '#10b981';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href={`/club/${club.id}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 w-fit">
        <ArrowRight size={16} /> العودة لصفحة {club.name}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div
            className="relative w-full max-w-[260px] aspect-[2/3] rounded-t-3xl rounded-b-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: primaryColor, background: `linear-gradient(160deg, ${primaryColor}33, #0f172a 60%)` }}
          >
            <div className="absolute top-6 right-5 flex flex-col items-center gap-1 z-20">
              <span className="text-4xl font-black leading-none text-white">{player.rating}</span>
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
          <h1 className="text-2xl font-black text-white mt-4 text-center">{player.name}</h1>
          <p className="text-slate-400 text-sm">#{player.number} • {club.name}</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 text-lg border-b border-slate-800 pb-2 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> الإحصائيات الفنية
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {(['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const).map((key) => (
                <div key={key} className="text-center">
                  <span className="block text-2xl font-black text-white">{player.stats?.[key] ?? '-'}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {player.seasonStats && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 text-lg border-b border-slate-800 pb-2">أداء الموسم الحالي</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="المباريات" value={player.seasonStats.matches} />
                <Stat label="الأهداف" value={player.seasonStats.goals} />
                <Stat label="التمريرات الحاسمة" value={player.seasonStats.assists} />
                <Stat label="متوسط التقييم" value={player.seasonStats.rating} />
              </div>
            </div>
          )}

          {player.marketValue !== undefined && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
              <span className="text-slate-400 font-bold">القيمة السوقية التقديرية</span>
              <span className="text-2xl font-black text-emerald-400">€{player.marketValue.toLocaleString()}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ComingSoonCard icon={Repeat} label="سجل الانتقالات" />
            <ComingSoonCard icon={ShieldAlert} label="الإصابات والعقوبات" />
            <ComingSoonCard icon={Award} label="الجوائز" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 text-center">
      <span className="block text-xl font-black text-white">{value}</span>
      <span className="text-[10px] text-slate-500 font-bold">{label}</span>
    </div>
  );
}

function ComingSoonCard({ icon: Icon, label }: { icon: typeof Repeat; label: string }) {
  return (
    <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500">
      <Icon size={20} className="mx-auto mb-2" />
      <span className="text-xs font-bold">{label}</span>
      <p className="text-[10px] mt-1">قريبًا</p>
    </div>
  );
}
