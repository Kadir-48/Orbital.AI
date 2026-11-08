import React, { useEffect, useState } from 'react';
import type { Agency, Paged } from '../types/ll2';
import { useCatalog, useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, Pills, Select, Pagination, CardGridSkeleton, EmptyState, ErrorState, Badge, Img, Drawer, Stat, ExtLink, useDebounced, fmt } from '../components/ui';

interface Props {
  selectedId?: string;
  onSelect: (id?: number) => void;
}

export const AgenciesView: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('launches');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [q, type, sort]);

  const { data, loading, error, reload } = useCatalog<Agency>('/api/agencies', { q, type, sort, page, limit: 24 });
  const selected = useSelected<Agency>('/api/agencies', selectedId, data?.items);
  const types = (data as (Paged<Agency> & { types?: string[] }) | null)?.types || ['Government', 'Commercial'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Agencies & companies" subtitle={data ? `${data.total.toLocaleString()} space agencies, launch providers and manufacturers.` : 'Space agencies, launch providers and manufacturers.'} />

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search agencies or countries" className="md:w-80" />
        <Pills value={type} onChange={setType} options={[{ value: 'all', label: 'All' }, ...types.slice(0, 5).map((t) => ({ value: t, label: t }))]} />
        <div className="md:ml-auto">
          <Select
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'launches', label: 'Most launches' },
              { value: 'featured', label: 'Featured' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'name', label: 'A–Z' },
            ]}
          />
        </div>
      </div>

      {error && !data ? (
        <ErrorState text="Agencies couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={12} aspect="aspect-[16/9]" />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="No agencies found" text="Try a different search or filter." />
      ) : data ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((a) => (
              <button key={a.id} onClick={() => onSelect(a.id)} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all flex flex-col">
                <div className="aspect-[16/9] bg-white flex items-center justify-center p-6 border-b border-slate-100">
                  <Img src={a.logo || a.image} alt={a.name} w={480} fit="contain" className="w-full h-full bg-white" fallbackText={a.abbrev || a.name} />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 leading-snug">{a.name}</h3>
                    {a.type && <Badge>{a.type}</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{[a.country, a.founded && `founded ${a.founded}`].filter(Boolean).join(' · ')}</p>
                  {a.total > 0 && (
                    <p className="mt-2 text-xs text-slate-600 tabular-nums">
                      {a.total.toLocaleString()} launches · {fmt.pct(a.success, a.success + a.failed)} success
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} noun="agencies" />
        </>
      ) : null}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Agency'}>
        {selected ? (
          <div>
            {selected.image ? (
              <Img src={selected.image} alt={selected.name} w={1200} className="w-full h-64" />
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-50 p-8">
                <Img src={selected.logo} alt={selected.name} w={600} fit="contain" className="h-full w-full bg-transparent" fallbackText={selected.abbrev} />
              </div>
            )}
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                {selected.type && <Badge>{selected.type}</Badge>}
                {selected.country && <Badge>{selected.country}</Badge>}
              </div>
              {selected.description && <p className="text-slate-700 leading-relaxed">{selected.description}</p>}
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50">
                <Stat label="Founded" value={selected.founded ?? '—'} />
                <Stat label="Leadership" value={<span className="text-sm font-medium">{selected.administrator || '—'}</span>} />
                <Stat label="Launches" value={selected.total.toLocaleString()} sub={selected.pending ? `${selected.pending} upcoming` : undefined} />
                <Stat label="Successful" value={selected.success.toLocaleString()} sub={fmt.pct(selected.success, selected.success + selected.failed)} />
                <Stat label="Failed" value={selected.failed.toLocaleString()} />
                {selected.landingsSuccess > 0 && <Stat label="Booster landings" value={selected.landingsSuccess.toLocaleString()} />}
              </dl>
              {selected.launchers && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Rockets</h3>
                  <p className="text-sm text-slate-600 mt-1">{selected.launchers.split('|').map((s) => s.trim()).join(', ')}</p>
                </div>
              )}
              {selected.spacecraft && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Spacecraft</h3>
                  <p className="text-sm text-slate-600 mt-1">{selected.spacecraft.split('|').map((s) => s.trim()).join(', ')}</p>
                </div>
              )}
              <div className="flex gap-4">
                <ExtLink href={selected.info}>Official website</ExtLink>
                <ExtLink href={selected.wiki}>Wikipedia</ExtLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-slate-500">Loading…</div>
        )}
      </Drawer>
    </div>
  );
};
