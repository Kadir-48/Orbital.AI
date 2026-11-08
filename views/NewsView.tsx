import React, { useState } from 'react';
import { NewsArticleItem } from '../types';
import { useApi } from '../utils/api';
import { timeAgo } from '../utils/format';
import { PageHeader, SearchBox, Pills, ErrorState, EmptyState, CardGridSkeleton } from '../components/ui';

const CATS = ['All', 'NASA', 'SpaceX', 'ISRO', 'Launches', 'Astronomy', 'Science', 'Industry'] as const;

export const NewsView: React.FC = () => {
  const { data, loading, error, reload } = useApi<NewsArticleItem[]>('/api/news');
  const articles = Array.isArray(data) ? data : [];
  const [category, setCategory] = useState<(typeof CATS)[number]>('All');
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();
  const list = articles.filter(
    (a) => (category === 'All' || a.category === category) && `${a.title} ${a.summary} ${a.newsSite}`.toLowerCase().includes(q)
  );
  const [lead, ...rest] = list;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader title="News" subtitle="The latest stories from across spaceflight and astronomy." />
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <SearchBox value={search} onChange={setSearch} placeholder="Search news" className="md:w-72" />
        <div className="overflow-x-auto no-scrollbar">
          <Pills value={category} onChange={setCategory} options={CATS.map((c) => ({ value: c, label: c }))} />
        </div>
      </div>

      {error && !articles.length ? (
        <ErrorState text="News couldn’t be loaded right now." onRetry={reload} />
      ) : loading && !articles.length ? (
        <CardGridSkeleton count={8} aspect="aspect-[16/10]" />
      ) : !list.length ? (
        <EmptyState title="No stories match" action={<button onClick={() => { setCategory('All'); setSearch(''); }} className="text-sm font-medium text-blue-700">Show all news</button>} />
      ) : (
        <div className="space-y-8">
          {lead && (
            <a href={lead.url} target="_blank" rel="noopener noreferrer" className="group grid md:grid-cols-2 gap-6 rounded-3xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
              <img src={lead.imageUrl} alt="" className="w-full h-full min-h-[260px] object-cover bg-slate-100" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <p className="text-sm text-slate-500">{lead.newsSite} · {timeAgo(lead.publishedAt)}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 leading-snug group-hover:text-blue-700">{lead.title}</h2>
                <p className="mt-3 text-slate-600 leading-relaxed line-clamp-4">{lead.summary}</p>
                <span className="mt-5 text-sm font-medium text-blue-700">Read the story ↗</span>
              </div>
            </a>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((a) => (
              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                <img src={a.imageUrl} alt="" loading="lazy" className="w-full aspect-[16/10] object-cover bg-slate-100" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-slate-500">{a.newsSite} · {timeAgo(a.publishedAt)}</p>
                  <h3 className="mt-1 font-semibold text-slate-900 leading-snug line-clamp-3 group-hover:text-blue-700">{a.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{a.summary}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
