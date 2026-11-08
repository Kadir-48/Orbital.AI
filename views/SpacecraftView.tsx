import React, { useState } from 'react';
import type { Spacecraft } from '../types/ll2';
import { useCatalog, useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, Pills, CardGridSkeleton, EmptyState, ErrorState, Badge, Img, Drawer, Stat, ExtLink, useDebounced, fmt } from '../components/ui';

interface Props {
  selectedId?: string;
  onSelect: (id?: number) => void;
}

export const SpacecraftView: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [status, setStatus] = useState<'all' | 'active' | 'retired'>('all');
  const [crewed, setCrewed] = useState<'all' | 'yes' | 'no'>('all');

  const { data, loading, error, reload } = useCatalog<Spacecraft>('/api/spacecraft', { q, status, crewed, limit: 100 });
  const selected = useSelected<Spacecraft>('/api/spacecraft', selectedId, data?.items);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Spacecraft" subtitle="Capsules, spaceplanes and cargo ships that have carried crews and supplies to orbit and beyond." />

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search spacecraft" className="md:w-72" />
        <Pills value={status} onChange={setStatus} options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'In service' }, { value: 'retired', label: 'Retired' }]} />
        <Pills value={crewed} onChange={setCrewed} options={[{ value: 'all', label: 'Crewed & uncrewed' }, { value: 'yes', label: 'Crewed' }, { value: 'no', label: 'Uncrewed' }]} />
      </div>

      {error && !data ? (
        <ErrorState text="Spacecraft couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={9} />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="No spacecraft found" />
      ) : data ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((s) => (
              <button key={s.id} onClick={() => onSelect(s.id)} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Img src={s.image} alt={s.name} w={600} className="w-full h-full group-hover:scale-[1.03] transition-transform duration-500" fallbackText={s.name} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge color={s.inUse ? 'green' : 'slate'} className="bg-white/90">{s.inUse ? 'In service' : 'Retired'}</Badge>
                    {s.humanRated && <Badge color="blue" className="bg-white/90">Crewed</Badge>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{[s.type, s.agency].filter(Boolean).join(' · ')}</p>
                  <p className="mt-2 text-xs text-slate-600 tabular-nums">
                    {s.total ? `${s.total.toLocaleString()} missions` : 'No missions yet'}
                    {s.maidenFlight ? ` · since ${new Date(s.maidenFlight).getFullYear()}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 pt-6">{data.total} spacecraft</p>
        </>
      ) : null}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Spacecraft'}>
        {selected ? (
          <div>
            <Img src={selected.image} alt={selected.name} w={1200} className="w-full h-72" fallbackText={selected.name} />
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge color={selected.inUse ? 'green' : 'slate'}>{selected.inUse ? 'In service' : 'Retired'}</Badge>
                {selected.humanRated && <Badge color="blue">Crewed</Badge>}
                {selected.type && <Badge>{selected.type}</Badge>}
              </div>
              <p className="text-sm text-slate-500">{selected.agency}</p>
              {selected.capability && <p className="font-medium text-slate-900">{selected.capability}</p>}
              {selected.description && <p className="text-slate-700 leading-relaxed whitespace-pre-line">{selected.description}</p>}
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50">
                <Stat label="First flight" value={fmt.date(selected.maidenFlight)} />
                <Stat label="Height" value={fmt.num(selected.height, ' m')} />
                <Stat label="Diameter" value={fmt.num(selected.diameter, ' m')} />
                <Stat label="Crew" value={selected.crewCapacity ?? '—'} />
                <Stat label="Payload up" value={fmt.num(selected.payloadCapacity, ' kg')} />
                <Stat label="Payload down" value={fmt.num(selected.payloadReturn, ' kg')} />
                <Stat label="Mission duration" value={<span className="text-sm">{selected.flightLife || '—'}</span>} />
                <Stat label="Missions" value={selected.total.toLocaleString()} sub={selected.total ? `${fmt.pct(selected.success, selected.success + selected.failed)} successful` : undefined} />
                <Stat label="Vehicles built/flown" value={selected.flown || '—'} />
              </dl>
              <ExtLink href={selected.wiki}>Wikipedia</ExtLink>
            </div>
          </div>
        ) : (
          <div className="p-6 text-slate-500">Loading…</div>
        )}
      </Drawer>
    </div>
  );
};
