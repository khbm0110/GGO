'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Radio } from 'lucide-react';
import TeamLogo from '@/components/TeamLogo';
import { data } from '@/lib/data';
import { Category, type Match } from '@/types';
import { isSameCalendarDay, addDays } from '@/lib/services/dateService';

const ARAB_LEAGUES = [
  Category.SAUDI, Category.UAE, Category.QATAR, Category.KUWAIT, Category.OMAN, Category.BAHRAIN,
  Category.EGYPT, Category.ALGERIA, Category.TUNISIA, Category.MOROCCO, Category.JORDAN,
  Category.IRAQ, Category.LEBANON, Category.LIBYA, Category.SUDAN, Category.YEMEN, Category.PALESTINE,
];
const EURO_LEAGUES = [Category.ENGLAND, Category.SPAIN, Category.ITALY, Category.GERMANY, Category.CHAMPIONS_LEAGUE];

type Region = 'ALL' | 'ARAB' | 'EURO';
type DayKey = 'YESTERDAY' | 'TODAY' | 'TOMORROW';

const DAYS: { key: DayKey; label: string; offset: number }[] = [
  { key: 'YESTERDAY', label: 'أمس', offset: -1 },
  { key: 'TODAY', label: 'اليوم', offset: 0 },
  { key: 'TOMORROW', label: 'غدًا', offset: 1 },
];

function MatchLine({ match }: { match: Match }) {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  return (
    <Link href={`/match/${match.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-surface-2)] transition-colors">
      <div className="w-12 flex-shrink-0 text-center">
        {isLive ? (
          <span className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold">
            <Radio size={10} className="animate-pulse" /> {match.time}
          </span>
        ) : (
          <span className="text-xs font-mono text-[var(--fg-faint)]">{isFinished ? 'إنتهت' : match.time}</span>
        )}
      </div>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <TeamLogo src={match.homeLogo} alt={match.homeTeam} className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-bold text-[var(--fg)] truncate">{match.homeTeam}</span>
      </div>

      <div className="flex-shrink-0 px-2">
        {match.status === 'UPCOMING' ? (
          <span className="text-[var(--fg-faint)] text-xs font-bold">VS</span>
        ) : (
          <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${isLive ? 'bg-red-500/10 text-red-500' : 'bg-[var(--bg-surface-2)] text-[var(--fg)]'}`}>
            {match.scoreHome} - {match.scoreAway}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
        <span className="text-sm font-bold text-[var(--fg)] truncate">{match.awayTeam}</span>
        <TeamLogo src={match.awayLogo} alt={match.awayTeam} className="w-5 h-5 flex-shrink-0" />
      </div>
    </Link>
  );
}

function LeagueGroup({ league, matches, defaultOpen }: { league: string; matches: Match[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasLive = matches.some((m) => m.status === 'LIVE');

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-surface-2)]">
        <div className="flex items-center gap-2">
          {hasLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <span className="font-black text-sm text-[var(--fg)]">{league}</span>
          <span className="text-xs text-[var(--fg-faint)]">({matches.length})</span>
        </div>
        <ChevronDown size={16} className={`text-[var(--fg-faint)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="divide-y divide-[var(--border-subtle)]">{matches.map((m) => <MatchLine key={m.id} match={m} />)}</div>}
    </div>
  );
}

export default function ScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [region, setRegion] = useState<Region>('ALL');
  const [day, setDay] = useState<DayKey>('TODAY');

  useEffect(() => {
    data.getMatches().then(setMatches);
  }, []);

  const grouped = useMemo(() => {
    const selectedDate = addDays(new Date(), DAYS.find((d) => d.key === day)!.offset);

    const filtered = matches
      .filter((m) => (m.date ? isSameCalendarDay(new Date(m.date), selectedDate) : false))
      .filter((m) => {
        if (region === 'ARAB') return (ARAB_LEAGUES as string[]).includes(m.country);
        if (region === 'EURO') return (EURO_LEAGUES as string[]).includes(m.country);
        return true;
      });

    const map = new Map<string, Match[]>();
    filtered.forEach((m) => {
      const key = m.league || 'مباريات أخرى';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });

    // Leagues with a live match float to the top.
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const aLive = a.some((m) => m.status === 'LIVE') ? 1 : 0;
      const bLive = b.some((m) => m.status === 'LIVE') ? 1 : 0;
      return bLive - aLive;
    });
  }, [matches, region, day]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-black text-[var(--fg)] mb-6 flex items-center border-r-4 border-primary pr-4">مركز النتائج</h1>

      <div className="flex gap-2 mb-4">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDay(d.key)}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
              day === d.key ? 'bg-[var(--bg-surface-2)] text-primary border border-primary' : 'bg-[var(--bg-surface-2)] text-[var(--fg-subtle)] border border-transparent'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setRegion('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold ${region === 'ALL' ? 'bg-primary text-white' : 'bg-[var(--bg-surface-2)] text-[var(--fg-subtle)]'}`}>الكل</button>
        <button onClick={() => setRegion('ARAB')} className={`px-4 py-2 rounded-lg text-sm font-bold ${region === 'ARAB' ? 'bg-primary text-white' : 'bg-[var(--bg-surface-2)] text-[var(--fg-subtle)]'}`}>الدوريات العربية</button>
        <button onClick={() => setRegion('EURO')} className={`px-4 py-2 rounded-lg text-sm font-bold ${region === 'EURO' ? 'bg-primary text-white' : 'bg-[var(--bg-surface-2)] text-[var(--fg-subtle)]'}`}>الدوريات الأوروبية</button>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] border-dashed text-[var(--fg-faint)]">
          لا توجد مباريات مسجلة حاليًا في هذا القسم.
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([league, leagueMatches], idx) => (
            <LeagueGroup key={league} league={league} matches={leagueMatches} defaultOpen={idx < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
