import React, { useEffect, useState } from 'react';
import type { Rocket } from '../types/ll2';
import { useCatalog, useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, Pills, Select, Pagination, CardGridSkeleton, EmptyState, ErrorState, Badge, Img, Drawer, Stat, ExtLink, useDebounced, fmt } from '../components/ui';
import { Scale } from 'lucide-react';

interface Props {
  selectedId?: string;
  onSelect: (id?: number) => void;
  onCompare: (id: number) => void;
}

const SORTS = [
  { value: 'launches', label: 'Most launches' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'payload', label: 'Largest payload' },
  { value: 'height', label: 'Tallest' },
  { value: 'name', label: 'A–Z' },
];

export const RocketsView: React.FC<Props> = ({ selectedId, onSelect, onCompare }) => {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [status, setStatus] = useState<'all' | 'active' | 'retired'>('all');
  const [sort, setSort] = useState('launches');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [q, status, sort]);

  const { data, loading, error, reload } = useCatalog<Rocket>('/api/rockets', { q, status, sort, page, limit: 24 });
  const selected = useSelected<Rocket>('/api/rockets', selectedId, data?.items);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Rockets" subtitle={data ? `${data.total.toLocaleString()} launch vehicles, past and present.` : 'Every launch vehicle, past and present.'} />

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search rockets or manufacturers" className="md:w-80" />
        <Pills
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'retired', label: 'Retired' },
          ]}
        />
        <div className="md:ml-auto">
          <Select label="Sort" value={sort} onChange={setSort} options={SORTS} />
        </div>
      </div>

      {error && !data ? (
        <ErrorState text="Rockets couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={12} aspect="aspect-[4/5]" />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="No rockets found" text="Try a different search or filter." />
      ) : data ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((r) => (
              <RocketCard key={r.id} rocket={r} onClick={() => onSelect(r.id)} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} noun="rockets" />
        </>
      ) : null}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Rocket'}>
        {selected ? <RocketDetail rocket={selected} onCompare={() => onCompare(selected.id)} /> : <div className="p-6 text-slate-500">Loading…</div>}
      </Drawer>
    </div>
  );
};

const RocketCard: React.FC<{ rocket: Rocket; onClick: () => void }> = ({ rocket: r, onClick }) => (
  <button onClick={onClick} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all">
    <div className="relative aspect-[4/5] overflow-hidden">
      <Img src={r.image} alt={r.name} w={480} className="w-full h-full group-hover:scale-[1.03] transition-transform duration-500" fallbackText={r.shortName} />
      <div className="absolute top-3 left-3">
        <Badge color={r.active ? 'green' : 'slate'} className="bg-white/90 backdrop-blur">{r.active ? 'Active' : 'Retired'}</Badge>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-slate-900 leading-snug">{r.name}</h3>
      <p className="text-sm text-slate-500 truncate">{r.manufacturer}</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 py-1.5">
          <dt className="text-[11px] text-slate-500">Launches</dt>
          <dd className="text-sm font-semibold text-slate-900 tabular-nums">{r.total.toLocaleString()}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <dt className="text-[11px] text-slate-500">Success</dt>
          <dd className="text-sm font-semibold text-slate-900 tabular-nums">{fmt.pct(r.success, r.success + r.failed)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <dt className="text-[11px] text-slate-500">To LEO</dt>
          <dd className="text-sm font-semibold text-slate-900 tabular-nums">{r.leo ? `${(r.leo / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} t` : '—'}</dd>
        </div>
      </dl>
    </div>
  </button>
);

export const RocketDetail: React.FC<{ rocket: Rocket; onCompare?: () => void }> = ({ rocket: r, onCompare }) => (
  <div>
    <Img src={r.image} alt={r.name} w={1200} fit="contain" className="w-full h-80 bg-slate-50" fallbackText={r.shortName} />
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge color={r.active ? 'green' : 'slate'}>{r.active ? 'Active' : 'Retired'}</Badge>
        {r.reusable && <Badge color="blue">Reusable</Badge>}
        {r.families.map((f) => (
          <Badge key={f}>{f} family</Badge>
        ))}
      </div>
      <div>
        <p className="text-sm text-slate-500">
          {r.manufacturer}
          {r.country ? ` · ${r.country}` : ''}
        </p>
        {r.description && <p className="mt-2 text-slate-700 leading-relaxed">{r.description}</p>}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Specifications</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50">
          <Stat label="Height" value={fmt.num(r.length, ' m')} />
          <Stat label="Diameter" value={fmt.num(r.diameter, ' m')} />
          <Stat label="Lift-off mass" value={fmt.num(r.launchMass, ' t')} />
          <Stat label="Stages" value={r.maxStage ? (r.minStage && r.minStage !== r.maxStage ? `${r.minStage}–${r.maxStage}` : r.maxStage) : '—'} />
          <Stat label="Lift-off thrust" value={fmt.num(r.thrust, ' kN')} />
          <Stat label="Launch cost" value={fmt.money(r.launchCost)} />
          <Stat label="Payload to LEO" value={fmt.num(r.leo, ' kg')} />
          <Stat label="Payload to GTO" value={fmt.num(r.gto, ' kg')} />
          <Stat label="Payload to SSO" value={fmt.num(r.sso, ' kg')} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Flight record</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50">
          <Stat label="First flight" value={fmt.date(r.maidenFlight)} />
          <Stat label="Launches" value={r.total.toLocaleString()} sub={r.pending ? `${r.pending} upcoming` : undefined} />
          <Stat label="Successful" value={r.success.toLocaleString()} sub={fmt.pct(r.success, r.success + r.failed)} />
          <Stat label="Failed" value={r.failed.toLocaleString()} />
          {r.landingsAttempted > 0 && <Stat label="Booster landings" value={`${r.landingsSuccess} / ${r.landingsAttempted}`} />}
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        {onCompare && (
          <button onClick={onCompare} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
            <Scale className="w-4 h-4" /> Compare with other rockets
          </button>
        )}
        <ExtLink href={r.wiki}>Wikipedia</ExtLink>
        <ExtLink href={r.info}>Official page</ExtLink>
      </div>
    </div>
  </div>
);
