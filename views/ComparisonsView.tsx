import React, { useEffect, useRef, useState } from 'react';
import type { Rocket, Spacecraft } from '../types/ll2';
import { PageHeader, Pills, Img, useDebounced, fmt } from '../components/ui';
import { Plus, X, Search } from 'lucide-react';

const DEFAULT_ROCKETS = [164, 143, 172];
const MAX = 4;

type Row<T> = { label: string; get: (x: T) => string | number | null; best?: 'max' | 'min'; numeric?: (x: T) => number | null };

const ROCKET_ROWS: Row<Rocket>[] = [
  { label: 'Manufacturer', get: (r) => r.manufacturer || '—' },
  { label: 'Country', get: (r) => r.country || '—' },
  { label: 'Status', get: (r) => (r.active ? 'Active' : 'Retired') },
  { label: 'First flight', get: (r) => fmt.date(r.maidenFlight) },
  { label: 'Height', get: (r) => fmt.num(r.length, ' m'), numeric: (r) => r.length, best: 'max' },
  { label: 'Diameter', get: (r) => fmt.num(r.diameter, ' m'), numeric: (r) => r.diameter, best: 'max' },
  { label: 'Lift-off mass', get: (r) => fmt.num(r.launchMass, ' t'), numeric: (r) => r.launchMass, best: 'max' },
  { label: 'Lift-off thrust', get: (r) => fmt.num(r.thrust, ' kN'), numeric: (r) => r.thrust, best: 'max' },
  { label: 'Stages', get: (r) => r.maxStage ?? '—' },
  { label: 'Payload to LEO', get: (r) => fmt.num(r.leo, ' kg'), numeric: (r) => r.leo, best: 'max' },
  { label: 'Payload to GTO', get: (r) => fmt.num(r.gto, ' kg'), numeric: (r) => r.gto, best: 'max' },
  { label: 'Payload to SSO', get: (r) => fmt.num(r.sso, ' kg'), numeric: (r) => r.sso, best: 'max' },
  { label: 'Launch cost', get: (r) => fmt.money(r.launchCost), numeric: (r) => r.launchCost, best: 'min' },
  { label: 'Reusable', get: (r) => (r.reusable ? 'Yes' : 'No') },
  { label: 'Launches', get: (r) => r.total.toLocaleString(), numeric: (r) => r.total, best: 'max' },
  { label: 'Success rate', get: (r) => fmt.pct(r.success, r.success + r.failed), numeric: (r) => (r.success + r.failed ? r.success / (r.success + r.failed) : null), best: 'max' },
  { label: 'Booster landings', get: (r) => (r.landingsAttempted ? `${r.landingsSuccess} / ${r.landingsAttempted}` : '—'), numeric: (r) => r.landingsSuccess, best: 'max' },
];

const CRAFT_ROWS: Row<Spacecraft>[] = [
  { label: 'Operator', get: (s) => s.agency || '—' },
  { label: 'Type', get: (s) => s.type || '—' },
  { label: 'Status', get: (s) => (s.inUse ? 'In service' : 'Retired') },
  { label: 'First flight', get: (s) => fmt.date(s.maidenFlight) },
  { label: 'Crewed', get: (s) => (s.humanRated ? 'Yes' : 'No') },
  { label: 'Crew capacity', get: (s) => s.crewCapacity ?? '—', numeric: (s) => s.crewCapacity, best: 'max' },
  { label: 'Height', get: (s) => fmt.num(s.height, ' m'), numeric: (s) => s.height, best: 'max' },
  { label: 'Diameter', get: (s) => fmt.num(s.diameter, ' m'), numeric: (s) => s.diameter, best: 'max' },
  { label: 'Payload up', get: (s) => fmt.num(s.payloadCapacity, ' kg'), numeric: (s) => s.payloadCapacity, best: 'max' },
  { label: 'Payload down', get: (s) => fmt.num(s.payloadReturn, ' kg'), numeric: (s) => s.payloadReturn, best: 'max' },
  { label: 'Mission duration', get: (s) => s.flightLife || '—' },
  { label: 'Missions', get: (s) => s.total.toLocaleString(), numeric: (s) => s.total, best: 'max' },
  { label: 'Success rate', get: (s) => fmt.pct(s.success, s.success + s.failed), numeric: (s) => (s.success + s.failed ? s.success / (s.success + s.failed) : null), best: 'max' },
];

export const ComparisonsView: React.FC<{ initialRocketId?: string }> = ({ initialRocketId }) => {
  const [tab, setTab] = useState<'rockets' | 'spacecraft'>('rockets');
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [crafts, setCrafts] = useState<Spacecraft[]>([]);
  const [allCraft, setAllCraft] = useState<Spacecraft[]>([]);

  useEffect(() => {
    const ids = initialRocketId ? [Number(initialRocketId), ...DEFAULT_ROCKETS.filter((d) => d !== Number(initialRocketId))].slice(0, 3) : DEFAULT_ROCKETS;
    fetch(`/api/rockets?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((d) => setRockets(d.items || []))
      .catch(() => {});
    fetch('/api/spacecraft?limit=100&sort=launches')
      .then((r) => r.json())
      .then((d) => {
        setAllCraft(d.items || []);
        setCrafts((d.items || []).filter((s: Spacecraft) => /dragon|soyuz|orion/i.test(s.name)).slice(0, 3));
      })
      .catch(() => {});
  }, [initialRocketId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Compare" subtitle="Put up to four vehicles side by side. The best value in each row is highlighted." right={<Pills value={tab} onChange={setTab} options={[{ value: 'rockets', label: 'Rockets' }, { value: 'spacecraft', label: 'Spacecraft' }]} />} />

      {tab === 'rockets' ? (
        <CompareTable
          items={rockets}
          rows={ROCKET_ROWS}
          onRemove={(id) => setRockets((r) => r.filter((x) => x.id !== id))}
          picker={
            rockets.length < MAX && (
              <RocketPicker exclude={rockets.map((r) => r.id)} onPick={(r) => setRockets((cur) => [...cur, r].slice(0, MAX))} />
            )
          }
        />
      ) : (
        <CompareTable
          items={crafts}
          rows={CRAFT_ROWS}
          onRemove={(id) => setCrafts((r) => r.filter((x) => x.id !== id))}
          picker={
            crafts.length < MAX && (
              <LocalPicker
                options={allCraft.filter((s) => !crafts.some((c) => c.id === s.id))}
                onPick={(s) => setCrafts((cur) => [...cur, s].slice(0, MAX))}
              />
            )
          }
        />
      )}
    </div>
  );
};

function CompareTable<T extends { id: number; name: string; image?: string }>({
  items,
  rows,
  onRemove,
  picker,
}: {
  items: T[];
  rows: Row<T>[];
  onRemove: (id: number) => void;
  picker: React.ReactNode;
}) {
  const cols = items.length + (picker ? 1 : 0);
  const bestIdx = (row: Row<T>) => {
    if (!row.numeric || !row.best || items.length < 2) return -1;
    const vals = items.map((x) => row.numeric!(x));
    const valid = vals.filter((v): v is number => v != null && v > 0);
    if (valid.length < 2) return -1;
    const target = row.best === 'max' ? Math.max(...valid) : Math.min(...valid);
    return vals.indexOf(target);
  };

  return (
    <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200">
      <table className="w-full min-w-[640px] text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '170px' }} />
          {Array.from({ length: cols }).map((_, i) => (
            <col key={i} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="p-4" />
            {items.map((x) => (
              <th key={x.id} className="p-4 align-top text-left font-normal">
                <div className="relative">
                  <Img src={x.image} alt={x.name} w={400} className="w-full aspect-[4/3] rounded-xl" fallbackText={x.name} />
                  <button onClick={() => onRemove(x.id)} className="absolute top-2 right-2 p-1 rounded-lg bg-white/90 text-slate-600 hover:text-slate-900 shadow-sm" aria-label={`Remove ${x.name}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 font-semibold text-slate-900 leading-snug">{x.name}</div>
              </th>
            ))}
            {picker && <th className="p-4 align-top">{picker}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const b = bestIdx(row);
            return (
              <tr key={row.label} className="border-t border-slate-100">
                <th className="px-4 py-3 text-left font-medium text-slate-500">{row.label}</th>
                {items.map((x, i) => (
                  <td key={x.id} className={`px-4 py-3 tabular-nums ${i === b ? 'text-emerald-700 font-semibold' : 'text-slate-900'}`}>
                    {row.get(x)}
                  </td>
                ))}
                {picker && <td />}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PickerShell: React.FC<{ children: (close: () => void) => React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-700 flex flex-col items-center justify-center gap-1 text-sm font-medium">
        <Plus className="w-5 h-5" /> Add to compare
      </button>
      {open && <div className="absolute z-20 right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-2 text-left">{children(() => setOpen(false))}</div>}
    </div>
  );
};

const RocketPicker: React.FC<{ exclude: number[]; onPick: (r: Rocket) => void }> = ({ exclude, onPick }) => (
  <PickerShell>{(close) => <RocketSearch exclude={exclude} onPick={(r) => { onPick(r); close(); }} />}</PickerShell>
);

const RocketSearch: React.FC<{ exclude: number[]; onPick: (r: Rocket) => void }> = ({ exclude, onPick }) => {
  const [text, setText] = useState('');
  const q = useDebounced(text, 200);
  const [list, setList] = useState<Rocket[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rockets?limit=12&sort=launches${q ? `&q=${encodeURIComponent(q)}` : ''}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setList(d.items || []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [q]);
  return (
    <>
      <div className="relative mb-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Search any rocket" className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>
      <ul className="max-h-72 overflow-y-auto">
        {list.filter((r) => !exclude.includes(r.id)).map((r) => (
          <li key={r.id}>
            <button onClick={() => onPick(r)} className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 text-left">
              <Img src={r.thumb} alt="" w={96} className="w-9 h-9 rounded-lg shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900 truncate">{r.name}</span>
                <span className="block text-xs text-slate-500 truncate">{r.manufacturer}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const LocalPicker: React.FC<{ options: Spacecraft[]; onPick: (s: Spacecraft) => void }> = ({ options, onPick }) => (
  <PickerShell>
    {(close) => <LocalSearch options={options} onPick={(s) => { onPick(s); close(); }} />}
  </PickerShell>
);

const LocalSearch: React.FC<{ options: Spacecraft[]; onPick: (s: Spacecraft) => void }> = ({ options, onPick }) => {
  const [text, setText] = useState('');
  const list = options.filter((o) => `${o.name} ${o.agency}`.toLowerCase().includes(text.toLowerCase()));
  return (
    <>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Search spacecraft" className="w-full mb-1 px-3 py-2 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      <ul className="max-h-72 overflow-y-auto">
        {list.map((s) => (
          <li key={s.id}>
            <button onClick={() => onPick(s)} className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 text-left">
              <Img src={s.thumb} alt="" w={96} className="w-9 h-9 rounded-lg shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900 truncate">{s.name}</span>
                <span className="block text-xs text-slate-500 truncate">{s.agency}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
