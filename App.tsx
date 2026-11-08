import React, { useCallback, useEffect, useState } from 'react';
import { NavigationSection } from './types';
import { Header, PRIMARY_NAV, MORE_NAV } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './views/HomeView';
import { AssistantView } from './views/AssistantView';
import { LaunchesView } from './views/LaunchesView';
import { MissionsView } from './views/MissionsView';
import { RocketsView } from './views/RocketsView';
import { SpacecraftView } from './views/SpacecraftView';
import { SatelliteTrackerView } from './views/SatelliteTrackerView';
import { AstronautsView } from './views/AstronautsView';
import { AgenciesView } from './views/AgenciesView';
import { AstronomyView } from './views/AstronomyView';
import { NewsView } from './views/NewsView';
import { EncyclopediaView } from './views/EncyclopediaView';
import { ComparisonsView } from './views/ComparisonsView';
import { SpaceWeatherView } from './views/SpaceWeatherView';

const SECTIONS: NavigationSection[] = ['home', ...PRIMARY_NAV.map((n) => n.id), ...MORE_NAV.map((n) => n.id)];

const TITLES: Partial<Record<NavigationSection, string>> = Object.fromEntries(
  [...PRIMARY_NAV, ...MORE_NAV].map((n) => [n.id, n.label])
);

interface Route {
  section: NavigationSection;
  id?: string;
  query?: string;
}

function parseHash(): Route {
  const [path, qs] = window.location.hash.replace(/^#\/?/, '').split('?');
  const [section, id] = path.split('/');
  const query = new URLSearchParams(qs || '').get('q') || undefined;
  return SECTIONS.includes(section as NavigationSection)
    ? { section: section as NavigationSection, id: id ? decodeURIComponent(id) : undefined, query }
    : { section: 'home' };
}

function toHash(r: Route) {
  if (r.section === 'home') return '#/';
  return `#/${r.section}${r.id ? `/${encodeURIComponent(r.id)}` : ''}${r.query ? `?q=${encodeURIComponent(r.query)}` : ''}`;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = useCallback((section: NavigationSection, id?: string, query?: string) => {
    const next = { section, id, query };
    const sameSection = section === parseHash().section;
    window.location.hash = toHash(next);
    setRoute(next);
    if (!sameSection || !id) window.scrollTo({ top: 0 });
  }, []);

  /** Open or close a detail item without scrolling the list. */
  const openItem = useCallback((section: NavigationSection) => (id?: string | number) => {
    const next = { section, id: id == null ? undefined : String(id) };
    history.replaceState(null, '', toHash(next));
    setRoute(next);
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const t = TITLES[route.section];
    document.title = t ? `${t} · Orbital` : 'Orbital — Launches, rockets, astronauts and missions';
  }, [route.section]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const askAI = (q: string) => navigate('assistant', undefined, q);
  const { section, id } = route;

  return (
    <div className="min-h-screen flex flex-col">
      <Header current={section} onNavigate={(s) => navigate(s)} onOpenSearch={() => setSearchOpen(true)} />

      <main className="flex-1 w-full">
        {section === 'home' && <HomeView onNavigate={navigate} onAskAI={askAI} />}
        {section === 'launches' && <LaunchesView selectedId={id} onSelect={openItem('launches')} />}
        {section === 'missions' && <MissionsView selectedId={id} onSelect={openItem('missions')} />}
        {section === 'rockets' && <RocketsView selectedId={id} onSelect={openItem('rockets')} onCompare={(rid) => navigate('comparisons', String(rid))} />}
        {section === 'spacecraft' && <SpacecraftView selectedId={id} onSelect={openItem('spacecraft')} />}
        {section === 'astronauts' && <AstronautsView selectedId={id} onSelect={openItem('astronauts')} />}
        {section === 'agencies' && <AgenciesView selectedId={id} onSelect={openItem('agencies')} />}
        {section === 'comparisons' && <ComparisonsView initialRocketId={id} />}
        {section === 'astronomy' && <AstronomyView />}
        {section === 'news' && <NewsView />}
        {section === 'spaceweather' && <SpaceWeatherView />}
        {section === 'satellites' && <SatelliteTrackerView />}
        {section === 'encyclopedia' && <EncyclopediaView />}
        {section === 'assistant' && <AssistantView initialPrompt={route.query} />}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </span>
              <span className="font-semibold text-slate-900">Orbital</span>
            </div>
            <p className="mt-3 text-slate-500">Launches, missions, rockets and the people who fly them.</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Explore</h3>
            <ul className="mt-3 space-y-2">
              {PRIMARY_NAV.slice(0, 5).map((n) => (
                <li key={n.id}><button onClick={() => navigate(n.id)} className="text-slate-500 hover:text-slate-900">{n.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Discover</h3>
            <ul className="mt-3 space-y-2">
              {PRIMARY_NAV.slice(5).map((n) => (
                <li key={n.id}><button onClick={() => navigate(n.id)} className="text-slate-500 hover:text-slate-900">{n.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Tools</h3>
            <ul className="mt-3 space-y-2">
              {MORE_NAV.map((n) => (
                <li key={n.id}><button onClick={() => navigate(n.id)} className="text-slate-500 hover:text-slate-900">{n.label}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-slate-400">© {new Date().getFullYear()} Orbital</p>
        </div>
      </footer>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(s, itemId) => navigate(s, itemId)}
        onAskAI={askAI}
      />
    </div>
  );
}
