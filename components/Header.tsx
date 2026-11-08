import React, { useEffect, useRef, useState } from 'react';
import { NavigationSection } from '../types';
import { Search, Menu, X, ChevronDown, Sparkles } from 'lucide-react';

export const PRIMARY_NAV: Array<{ id: NavigationSection; label: string }> = [
  { id: 'launches', label: 'Launches' },
  { id: 'missions', label: 'Missions' },
  { id: 'rockets', label: 'Rockets' },
  { id: 'spacecraft', label: 'Spacecraft' },
  { id: 'astronauts', label: 'Astronauts' },
  { id: 'agencies', label: 'Agencies' },
  { id: 'comparisons', label: 'Compare' },
  { id: 'astronomy', label: 'Astronomy' },
  { id: 'news', label: 'News' },
];

export const MORE_NAV: Array<{ id: NavigationSection; label: string; desc: string }> = [
  { id: 'satellites', label: 'Satellite tracker', desc: 'ISS, Hubble and more on a 3D globe' },
  { id: 'spaceweather', label: 'Space weather', desc: 'Solar wind, flares and aurora activity' },
  { id: 'encyclopedia', label: 'Glossary', desc: 'Spaceflight terms explained' },
  { id: 'assistant', label: 'Ask AI', desc: 'Questions answered with web sources' },
];

interface HeaderProps {
  current: NavigationSection;
  onNavigate: (s: NavigationSection) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ current, onNavigate, onOpenSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (s: NavigationSection) => {
    onNavigate(s);
    setMobileOpen(false);
    setMoreOpen(false);
  };

  const linkClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
      active ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const moreActive = MORE_NAV.some((m) => m.id === current);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 shrink-0" aria-label="Home">
          <span className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
          </span>
          <span className="font-semibold text-slate-900 tracking-tight text-lg">Orbital</span>
        </button>

        <nav className="hidden lg:flex items-center gap-0.5 ml-4" aria-label="Main">
          {PRIMARY_NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={linkClass(current === n.id)} aria-current={current === n.id ? 'page' : undefined}>
              {n.label}
            </button>
          ))}
          <div className="relative" ref={moreRef}>
            <button onClick={() => setMoreOpen((o) => !o)} className={`${linkClass(moreActive)} inline-flex items-center gap-1`} aria-expanded={moreOpen}>
              More <ChevronDown className="w-4 h-4" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-2 animate-fadeIn">
                {MORE_NAV.map((m) => (
                  <button key={m.id} onClick={() => go(m.id)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50">
                    <div className="text-sm font-medium text-slate-900">{m.label}</div>
                    <div className="text-xs text-slate-500">{m.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1" />

        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-2 w-56 rounded-xl bg-slate-100 text-slate-500 text-sm hover:bg-slate-200/70"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-[11px] font-sans px-1.5 py-0.5 rounded-md bg-white text-slate-500 ring-1 ring-slate-200">⌘K</kbd>
        </button>
        <button onClick={onOpenSearch} className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={() => go('assistant')}
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          <Sparkles className="w-4 h-4" /> Ask AI
        </button>
        <button onClick={() => setMobileOpen((o) => !o)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1" aria-label="Mobile">
            {[{ id: 'home' as NavigationSection, label: 'Home' }, ...PRIMARY_NAV, ...MORE_NAV].map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className={`text-left ${linkClass(current === n.id)}`}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
