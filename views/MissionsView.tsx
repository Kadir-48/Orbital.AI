import React, { useEffect, useState } from 'react';
import type { Launch } from '../types/ll2';
import { useCatalog, useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, Pills, Select, Pagination, CardGridSkeleton, EmptyState, ErrorState, Drawer, useDebounced } from '../components/ui';
import { LaunchCard, LaunchDetail } from '../components/launch';

interface Props {
  selectedId?: string;
  onSelect: (id?: string) => void;
}

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 2 - 1957 }, (_, i) => String(thisYear + 1 - i));

export const MissionsView: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [when, setWhen] = useState<'all' | 'past' | 'upcoming'>('past');
  const [year, setYear] = useState('all');
  const [outcome, setOutcome] = useState('all');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [q, when, year, outcome]);

  const { data, loading, error, reload } = useCatalog<Launch>('/api/missions', { q, when, year, outcome: when === 'upcoming' ? undefined : outcome, page, limit: 24 });
  const selected = useSelected<Launch>('/api/missions', selectedId, data?.items);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Missions"
        subtitle={data ? `${data.total.toLocaleString()} missions${year !== 'all' ? ` in ${year}` : ''} — every orbital launch since Sputnik in 1957.` : 'Every orbital launch since Sputnik in 1957.'}
      />

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search mission, rocket or provider" className="lg:w-80" />
        <Pills value={when} onChange={setWhen} options={[{ value: 'past', label: 'Flown' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'all', label: 'All' }]} />
        <div className="flex gap-3 lg:ml-auto">
          <Select label="Year" value={year} onChange={setYear} options={[{ value: 'all', label: 'All years' }, ...YEARS.map((y) => ({ value: y, label: y }))]} />
          {when !== 'upcoming' && (
            <Select label="Outcome" value={outcome} onChange={setOutcome} options={[{ value: 'all', label: 'Any outcome' }, { value: 'success', label: 'Successful' }, { value: 'failure', label: 'Failed' }]} />
          )}
        </div>
      </div>

      {data?.syncing && (
        <p className="mb-4 text-sm text-slate-500">The full mission archive is still being loaded — older missions will appear over the next few hours.</p>
      )}

      {error && !data ? (
        <ErrorState text="Missions couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={12} aspect="aspect-[16/10]" />
      ) : data && data.items.length === 0 ? (
        <EmptyState title="No missions found" text="Try a different search, year or filter." />
      ) : data ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((l) => (
              <LaunchCard key={l.id} launch={l} onClick={() => onSelect(l.id)} showCountdown={when === 'upcoming'} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} noun="missions" />
        </>
      ) : null}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Mission'}>
        {selected ? <LaunchDetail launch={selected} /> : <div className="p-6 text-slate-500">Loading…</div>}
      </Drawer>
    </div>
  );
};
