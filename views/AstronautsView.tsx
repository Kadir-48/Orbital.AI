import React, { useEffect, useState } from 'react';
import type { Astronaut, Paged } from '../types/ll2';
import { useCatalog, useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, Pills, Select, Pagination, CardGridSkeleton, EmptyState, ErrorState, Badge, Img, Drawer, Stat, ExtLink, useDebounced, fmt } from '../components/ui';

interface Props {
  selectedId?: string;
  onSelect: (id?: number) => void;
}

type Status = 'all' | 'in_space' | 'active' | 'retired' | 'deceased';

const statusColor = (a: Astronaut) => (a.inSpace ? 'blue' : /active/i.test(a.status) ? 'green' : a.died ? 'slate' : 'slate');
const statusLabel = (a: Astronaut) => (a.inSpace ? 'In space now' : a.died ? 'Deceased' : a.status);

export const AstronautsView: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [status, setStatus] = useState<Status>('all');
  const [nationality, setNationality] = useState('all');
  const [sort, setSort] = useState('time');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [q, status, nationality, sort]);

  const { data, loading, error, reload } = useCatalog<Astronaut>('/api/astronauts', { q, status, nationality, sort, page, limit: 24 });
  const selected = useSelected<Astronaut>('/api/astronauts', selectedId, data?.items);
  const nationalities = (data as (Paged<Astronaut> & { nationalities?: string[] }) | null)?.nationalities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Astronauts" subtitle={data ? `${data.total.toLocaleString()} people who have flown, or trained to fly, in space.` : 'Everyone who has flown, or trained to fly, in space.'} />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or agency" className="lg:w-72" />
        <Pills
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'in_space', label: 'In space now' },
            { value: 'active', label: 'Active' },
            { value: 'retired', label: 'Retired' },
            { value: 'deceased', label: 'Deceased' },
          ]}
        />
        <div className="flex gap-3 lg:ml-auto">
          <Select label="Country" value={nationality} onChange={setNationality} options={[{ value: 'all', label: 'All countries' }, ...nationalities.map((n) => ({ value: n, label: n }))]} />
          <Select
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'time', label: 'Most time in space' },
              { value: 'flights', label: 'Most flights' },
              { value: 'spacewalks', label: 'Most spacewalks' },
              { value: 'name', label: 'A–Z' },
            ]}
          />
        </div>
      </div>

      {error && !data ? (
        <ErrorState text="Astronauts couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={12} aspect="aspect-square" />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="No astronauts found" text="Try a different search or filter." />
      ) : data ? (
        <>
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((a) => (
              <button key={a.id} onClick={() => onSelect(a.id)} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="relative aspect-square overflow-hidden">
                  <Img src={a.image} alt={a.name} w={400} className="w-full h-full object-top group-hover:scale-[1.03] transition-transform duration-500" />
                  {a.inSpace && (
                    <div className="absolute top-3 left-3">
                      <Badge color="blue" className="bg-white/90">In space now</Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 leading-snug truncate">{a.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{[a.nationality, a.agencyAbbrev || a.agency].filter(Boolean).join(' · ')}</p>
                  <p className="mt-2 text-xs text-slate-600 tabular-nums">
                    {a.daysInSpace ? `${a.daysInSpace.toLocaleString(undefined, { maximumFractionDigits: 0 })} days in space` : 'Not yet flown'}
                    {a.flights ? ` · ${a.flights} flight${a.flights === 1 ? '' : 's'}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} noun="astronauts" />
        </>
      ) : null}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Astronaut'}>
        {selected ? (
          <div>
            <div className="flex flex-col sm:flex-row gap-6 p-6">
              <Img src={selected.image} alt={selected.name} w={600} className="w-full sm:w-56 aspect-[4/5] rounded-2xl object-top shrink-0" />
              <div className="space-y-3">
                <Badge color={statusColor(selected) as 'blue' | 'green' | 'slate'}>{statusLabel(selected)}</Badge>
                <p className="text-sm text-slate-500">{[selected.nationality, selected.agency].filter(Boolean).join(' · ')}</p>
                <dl className="grid grid-cols-2 gap-4">
                  <Stat label="Time in space" value={selected.daysInSpace ? `${selected.daysInSpace.toLocaleString(undefined, { maximumFractionDigits: 1 })} days` : '—'} />
                  <Stat label="Flights" value={selected.flights || '—'} />
                  <Stat label="Spacewalks" value={selected.spacewalks || '—'} sub={selected.evaHours ? `${selected.evaHours} h total` : undefined} />
                  <Stat label={selected.died ? 'Lived' : 'Age'} value={selected.died ? `${fmt.date(selected.born)} – ${fmt.date(selected.died)}` : selected.age ?? '—'} />
                  <Stat label="First flight" value={fmt.date(selected.firstFlight)} />
                  <Stat label="Latest flight" value={fmt.date(selected.lastFlight)} />
                </dl>
              </div>
            </div>
            {selected.bio && <p className="px-6 text-slate-700 leading-relaxed">{selected.bio}</p>}
            <div className="p-6">
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
