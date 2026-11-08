import React, { useEffect, useState } from 'react';
import { NavigationSection, NewsArticleItem, APODData } from '../types';
import type { Launch, Rocket, Astronaut, Spacecraft, Agency, Paged } from '../types/ll2';
import { useApi } from '../utils/api';
import { timeAgo } from '../utils/format';
import { Img, Badge, ErrorState, launchStatusColor } from '../components/ui';
import { useCountdown, launchDate } from '../components/launch';
import { ArrowRight, MapPin, Sparkles, PlayCircle } from 'lucide-react';

interface Props {
  onNavigate: (s: NavigationSection, id?: string) => void;
  onAskAI: (q: string) => void;
}

interface Stats {
  inSpace: Array<{ id: number; name: string; agency: string; thumb?: string }>;
  year: string;
  launchesThisYear: number | null;
  successesThisYear: number | null;
}

const SectionTitle: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="flex items-end justify-between mb-4">
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    {action && (
      <button onClick={onAction} className="text-sm font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1">
        {action} <ArrowRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

export const HomeView: React.FC<Props> = ({ onNavigate, onAskAI }) => {
  const launches = useApi<{ launches: Launch[] }>('/api/launches');
  const stats = useApi<Stats>('/api/stats');
  const apod = useApi<APODData>('/api/apod', 60 * 60 * 1000);
  const news = useApi<NewsArticleItem[]>('/api/news');
  const rocket = useApi<Paged<Rocket>>('/api/rockets?limit=1&sort=launches&status=active', 60 * 60 * 1000);
  const astro = useApi<Paged<Astronaut>>('/api/astronauts?limit=1&sort=time', 60 * 60 * 1000);
  const craft = useApi<Paged<Spacecraft>>('/api/spacecraft?limit=1&sort=launches&status=active', 60 * 60 * 1000);
  const agency = useApi<Paged<Agency>>('/api/agencies?limit=1&sort=launches', 60 * 60 * 1000);

  const [iss, setIss] = useState<{ latitude: number; longitude: number; altitudeKm: number; velocityKmH: number } | null>(null);
  useEffect(() => {
    const load = () => fetch('/api/satellites/iss').then((r) => (r.ok ? r.json() : null)).then((d) => d && setIss(d)).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const upcoming = (launches.data?.launches ?? []).filter((l) => new Date(l.net).getTime() > Date.now() - 30 * 60 * 1000);
  const next = upcoming[0];
  const countdown = useCountdown(next?.net);
  const [ask, setAsk] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero: next launch + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 min-h-[420px] flex">
          {next ? (
            <>
              <Img src={next.image} alt={next.name} w={1400} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
              <div className="relative mt-auto p-6 sm:p-8 text-white w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/80">Next launch</span>
                  <Badge color={launchStatusColor(next.status)}>{next.status}</Badge>
                </div>
                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{next.missionName || next.name}</h1>
                <p className="mt-1 text-white/80">{next.rocket} · {next.provider}</p>
                <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
                  {countdown ? (
                    <div>
                      <div className="text-xs text-white/60">Lift-off in</div>
                      <div className="text-3xl sm:text-4xl font-semibold tabular-nums">{countdown}</div>
                    </div>
                  ) : null}
                  <div>
                    <div className="text-xs text-white/60">Scheduled</div>
                    <div className="font-medium">{launchDate(next)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm"><MapPin className="w-4 h-4" /> {next.location}</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => onNavigate('launches', next.id)} className="px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-slate-100">
                    Mission details
                  </button>
                  {next.webcast && (
                    <a href={next.webcast} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-medium hover:bg-white/25 inline-flex items-center gap-2 backdrop-blur">
                      <PlayCircle className="w-4 h-4" /> Webcast
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : launches.error ? (
            <div className="m-auto p-8 text-white/80 text-center">
              The launch schedule is unavailable right now.{' '}
              <button onClick={launches.reload} className="underline">Retry</button>
            </div>
          ) : (
            <div className="absolute inset-0 animate-pulse bg-slate-800" />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl bg-white border border-slate-200 p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold text-slate-900">People in space</h2>
              <span className="text-3xl font-semibold text-slate-900 tabular-nums">{stats.data ? stats.data.inSpace.length : '–'}</span>
            </div>
            {stats.data && stats.data.inSpace.length > 0 ? (
              <ul className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {stats.data.inSpace.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => onNavigate('astronauts', String(p.id))} className="w-full flex items-center gap-3 text-left group">
                      <Img src={p.thumb} alt="" w={96} className="w-9 h-9 rounded-full shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900 truncate group-hover:text-blue-700">{p.name}</span>
                        <span className="block text-xs text-slate-500">{p.agency}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{stats.loading ? 'Loading…' : 'Crew list unavailable right now.'}</p>
            )}
          </div>

          <button onClick={() => onNavigate('satellites')} className="rounded-3xl bg-white border border-slate-200 p-6 text-left hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">ISS right now</h2>
              {iss && <span className="flex items-center gap-1.5 text-xs text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>}
            </div>
            {iss ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-slate-500">Latitude</dt><dd className="font-semibold tabular-nums">{iss.latitude.toFixed(2)}°</dd></div>
                <div><dt className="text-xs text-slate-500">Longitude</dt><dd className="font-semibold tabular-nums">{iss.longitude.toFixed(2)}°</dd></div>
                <div><dt className="text-xs text-slate-500">Altitude</dt><dd className="font-semibold tabular-nums">{iss.altitudeKm} km</dd></div>
                <div><dt className="text-xs text-slate-500">Speed</dt><dd className="font-semibold tabular-nums">{iss.velocityKmH.toLocaleString()} km/h</dd></div>
              </dl>
            ) : (
              <div className="mt-4 h-16 rounded-xl bg-slate-100 animate-pulse" />
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700">Open tracker <ArrowRight className="w-4 h-4" /></span>
          </button>
        </div>
      </div>

      {/* Coming up */}
      {upcoming.length > 1 && (
        <section>
          <SectionTitle title="Coming up" action="All launches" onAction={() => onNavigate('launches')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcoming.slice(1, 5).map((l) => (
              <button key={l.id} onClick={() => onNavigate('launches', l.id)} className="group text-left rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <Img src={l.image} alt={l.name} w={600} className="w-full aspect-[16/10] group-hover:scale-[1.02] transition-transform duration-500" fallbackText={l.rocket} />
                <div className="p-4">
                  <p className="text-xs font-medium text-blue-700">{launchDate(l)}</p>
                  <h3 className="mt-1 font-semibold text-slate-900 line-clamp-1">{l.missionName || l.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{l.rocket}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Year stats */}
      {stats.data?.launchesThisYear != null && (
        <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-slate-500">Launches in {stats.data.year}</div>
            <div className="text-3xl font-semibold tabular-nums">{stats.data.launchesThisYear.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Successful</div>
            <div className="text-3xl font-semibold tabular-nums">{(stats.data.successesThisYear ?? 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Scheduled ahead</div>
            <div className="text-3xl font-semibold tabular-nums">{upcoming.length.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">People in orbit</div>
            <div className="text-3xl font-semibold tabular-nums">{stats.data.inSpace.length}</div>
          </div>
        </section>
      )}

      {/* Explore */}
      <section>
        <SectionTitle title="Explore" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { id: 'rockets' as const, label: 'Rockets', sub: rocket.data ? `${rocket.data.total.toLocaleString()} launch vehicles` : 'Every launch vehicle', img: rocket.data?.items[0]?.image },
            { id: 'astronauts' as const, label: 'Astronauts', sub: astro.data ? `${astro.data.total.toLocaleString()} people` : 'Everyone who has flown', img: astro.data?.items[0]?.image, top: true },
            { id: 'spacecraft' as const, label: 'Spacecraft', sub: 'Capsules, shuttles and cargo ships', img: craft.data?.items[0]?.image },
            { id: 'agencies' as const, label: 'Agencies', sub: agency.data ? `${agency.data.total.toLocaleString()} organisations` : 'Agencies and companies', img: agency.data?.items[0]?.image || agency.data?.items[0]?.logo },
          ].map((t) => (
            <button key={t.id} onClick={() => onNavigate(t.id)} className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[4/3] lg:aspect-[3/4] text-left bg-slate-200">
              <Img src={t.img} alt="" w={600} className={`absolute inset-0 w-full h-full group-hover:scale-[1.04] transition-transform duration-700 ${t.top ? 'object-top' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <div className="text-lg font-semibold">{t.label}</div>
                <div className="text-sm text-white/80">{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* APOD + News */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section className="lg:col-span-3 rounded-3xl bg-white border border-slate-200 overflow-hidden">
          {apod.data ? (
            <button onClick={() => onNavigate('astronomy')} className="block w-full text-left group">
              <Img
                src={apod.data.media_type === 'image' ? apod.data.url : apod.data.thumbnail_url}
                alt={apod.data.title}
                w={1200}
                className="w-full aspect-[16/9] group-hover:opacity-95"
              />
              <div className="p-6">
                <p className="text-sm text-slate-500">Astronomy picture of the day · {new Date(apod.data.date + 'T12:00:00Z').toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{apod.data.title}</h2>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">{apod.data.explanation}</p>
              </div>
            </button>
          ) : apod.error ? (
            <div className="p-6"><ErrorState text="Today’s astronomy picture couldn’t be loaded." onRetry={apod.reload} /></div>
          ) : (
            <div className="aspect-[16/9] bg-slate-100 animate-pulse" />
          )}
        </section>

        <section className="lg:col-span-2">
          <SectionTitle title="Latest news" action="More" onAction={() => onNavigate('news')} />
          {Array.isArray(news.data) ? (
            <ul className="space-y-3">
              {news.data.slice(0, 5).map((n) => (
                <li key={n.id}>
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-3 -mx-3 rounded-2xl hover:bg-white group">
                    <img src={n.imageUrl} alt="" loading="lazy" className="w-24 h-20 rounded-xl object-cover bg-slate-100 shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700">{n.title}</span>
                      <span className="block text-xs text-slate-500 mt-1">{n.newsSite} · {timeAgo(n.publishedAt)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : news.error ? (
            <ErrorState text="News couldn’t be loaded." onRetry={news.reload} />
          ) : (
            <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
          )}
        </section>
      </div>

      {/* Ask AI */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10">
        <h2 className="text-2xl font-semibold">Have a question about space?</h2>
        <p className="text-white/70 mt-1">Ask anything — answers come with links to where they were found.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (ask.trim()) onAskAI(ask.trim());
          }}
          className="mt-5 flex flex-col sm:flex-row gap-3"
        >
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="e.g. How does a rocket reach orbit?"
            aria-label="Ask a question"
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button className="px-5 py-3 rounded-xl bg-white text-slate-900 font-medium inline-flex items-center justify-center gap-2 hover:bg-slate-100">
            <Sparkles className="w-4 h-4" /> Ask
          </button>
        </form>
      </section>
    </div>
  );
};
