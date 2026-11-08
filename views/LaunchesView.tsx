import React, { useEffect, useMemo, useState } from 'react';
import type { Launch } from '../types/ll2';
import { useApi } from '../utils/api';
import { useSelected } from '../utils/catalog';
import { PageHeader, SearchBox, CardGridSkeleton, EmptyState, ErrorState, Drawer, useDebounced, Select } from '../components/ui';
import { LaunchCard, LaunchDetail } from '../components/launch';

interface Props {
  selectedId?: string;
  onSelect: (id?: string) => void;
}

export const LaunchesView: React.FC<Props> = ({ selectedId, onSelect }) => {
  const { data, loading, error, reload } = useApi<{ launches: Launch[] }>('/api/launches');
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 150).toLowerCase();
  const [provider, setProvider] = useState('all');
  const [, force] = useState(0);

  // Drop launches that lift off while the page is open.
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const launches = data?.launches ?? [];
  const providers = useMemo(() => [...new Set(launches.map((l) => l.provider))].sort(), [launches]);
  const list = launches.filter(
    (l) =>
      new Date(l.net).getTime() > Date.now() - 2 * 3600 * 1000 &&
      (provider === 'all' || l.provider === provider) &&
      (!q || `${l.name} ${l.rocket} ${l.provider} ${l.location} ${l.missionType}`.toLowerCase().includes(q))
  );
  const selected = useSelected<Launch>('/api/missions', selectedId, launches);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="Upcoming launches" subtitle="Every scheduled orbital launch worldwide, soonest first. Dates often move — exact countdowns appear once a time is confirmed." />

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search rocket, mission or site" className="md:w-80" />
        <Select label="Provider" value={provider} onChange={setProvider} options={[{ value: 'all', label: 'All providers' }, ...providers.map((p) => ({ value: p, label: p }))]} />
      </div>

      {error && !data ? (
        <ErrorState text="The launch schedule couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !data ? (
        <CardGridSkeleton count={8} aspect="aspect-[16/10]" />
      ) : list.length === 0 ? (
        <EmptyState title="No upcoming launches match" action={<button onClick={() => { setSearch(''); setProvider('all'); }} className="text-sm font-medium text-blue-700">Clear filters</button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {list.map((l) => (
              <LaunchCard key={l.id} launch={l} onClick={() => onSelect(l.id)} showCountdown />
            ))}
          </div>
          <p className="text-sm text-slate-500 pt-6">{list.length} upcoming launches</p>
        </>
      )}

      <Drawer open={!!selectedId} onClose={() => onSelect(undefined)} title={selected?.name || 'Launch'}>
        {selected ? <LaunchDetail launch={selected} /> : <div className="p-6 text-slate-500">Loading…</div>}
      </Drawer>
    </div>
  );
};
