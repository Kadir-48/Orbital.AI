import React, { useEffect, useState } from 'react';
import type { Launch } from '../types/ll2';
import { Img, Badge, Stat, launchStatusColor, fmt } from './ui';
import { calculateCountdown } from '../utils/orbitalCalculations';
import { MapPin, PlayCircle } from 'lucide-react';

export function useCountdown(net?: string) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!net) return;
    const tick = () => {
      const c = calculateCountdown(net);
      if (c.isPast) return setText('');
      const pad = (n: number) => String(n).padStart(2, '0');
      setText(c.days > 0 ? `${c.days}d ${pad(c.hours)}h ${pad(c.minutes)}m ${pad(c.seconds)}s` : `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [net]);
  return text;
}

/** Human date that respects LL2's precision (e.g. "November 2026" when only the month is known). */
export function launchDate(l: Pick<Launch, 'net' | 'netPrecision'>) {
  const d = new Date(l.net);
  const p = (l.netPrecision || '').toLowerCase();
  if (p.includes('year')) return String(d.getUTCFullYear());
  if (p.includes('quarter') || p.includes('half')) return `${l.netPrecision?.replace(/\s*\(.*\)/, '')} ${d.getUTCFullYear()}`;
  if (p.includes('month')) return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  if (p.includes('day') || p.includes('week')) return d.toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
  return fmt.dateTime(l.net);
}

const isExact = (l: Launch) => !l.netPrecision || /second|minute|hour/i.test(l.netPrecision);

export const LaunchCard: React.FC<{ launch: Launch; onClick: () => void; showCountdown?: boolean }> = ({ launch: l, onClick, showCountdown }) => {
  const countdown = useCountdown(showCountdown && isExact(l) ? l.net : undefined);
  return (
    <button onClick={onClick} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Img src={l.image} alt={l.name} w={640} className="w-full h-full group-hover:scale-[1.03] transition-transform duration-500" fallbackText={l.rocket} />
        <div className="absolute top-3 left-3">
          <Badge color={launchStatusColor(l.status)} className="bg-white/95">{l.status}</Badge>
        </div>
        {countdown && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-sm font-medium tabular-nums backdrop-blur">T− {countdown}</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs font-medium text-blue-700">{launchDate(l)}</p>
        <h3 className="mt-1 font-semibold text-slate-900 leading-snug line-clamp-2">{l.missionName || l.name}</h3>
        <p className="text-sm text-slate-500 truncate">{l.rocket} · {l.providerAbbrev || l.provider}</p>
        <p className="mt-auto pt-3 text-xs text-slate-500 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" /> {l.location || l.pad}
        </p>
      </div>
    </button>
  );
};

export const LaunchDetail: React.FC<{ launch: Launch }> = ({ launch: l }) => {
  const countdown = useCountdown(isExact(l) ? l.net : undefined);
  return (
    <div>
      <Img src={l.image} alt={l.name} w={1200} className="w-full h-72" fallbackText={l.rocket} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={launchStatusColor(l.status)}>{l.status}</Badge>
          {l.missionType && <Badge>{l.missionType}</Badge>}
          {l.orbit && <Badge>{l.orbit}</Badge>}
        </div>
        <div>
          <p className="text-sm text-blue-700 font-medium">{launchDate(l)}</p>
          {countdown && <p className="text-3xl font-semibold text-slate-900 tabular-nums mt-1">T− {countdown}</p>}
          {l.statusDescription && !/success/i.test(l.status) && <p className="text-sm text-slate-500 mt-1">{l.statusDescription}</p>}
        </div>
        {l.missionDescription && <p className="text-slate-700 leading-relaxed">{l.missionDescription}</p>}
        {l.failReason && (
          <p className="p-3 rounded-xl bg-red-50 text-sm text-red-800">
            <strong>What went wrong:</strong> {l.failReason}
          </p>
        )}
        <dl className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50">
          <Stat label="Rocket" value={<span className="text-sm">{l.rocket || '—'}</span>} />
          <Stat label="Launch provider" value={<span className="text-sm">{l.provider}</span>} />
          <Stat label="Launch pad" value={<span className="text-sm">{l.pad || '—'}</span>} />
          <Stat label="Location" value={<span className="text-sm">{l.location || '—'}</span>} />
          {l.programs.length > 0 && <Stat label="Programme" value={<span className="text-sm">{l.programs.join(', ')}</span>} />}
        </dl>
        {l.webcast && (
          <a href={l.webcast} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
            <PlayCircle className="w-4 h-4" /> {l.webcastLive ? 'Watch live' : 'Watch webcast'}
          </a>
        )}
      </div>
    </div>
  );
};
