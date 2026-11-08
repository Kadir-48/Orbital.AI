import React, { useEffect, useRef, useState } from 'react';
import { NavigationSection } from '../types';
import { Search, Sparkles, X } from 'lucide-react';
import { Img, useDebounced } from './ui';

interface Hit {
  id: string | number;
  name: string;
  sub: string;
  thumb?: string;
}
type Results = Record<'rockets' | 'astronauts' | 'agencies' | 'spacecraft' | 'missions', Hit[]>;

const GROUPS: Array<{ key: keyof Results; label: string; section: NavigationSection }> = [
  { key: 'rockets', label: 'Rockets', section: 'rockets' },
  { key: 'missions', label: 'Missions', section: 'missions' },
  { key: 'astronauts', label: 'Astronauts', section: 'astronauts' },
  { key: 'spacecraft', label: 'Spacecraft', section: 'spacecraft' },
  { key: 'agencies', label: 'Agencies', section: 'agencies' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavigationSection, id?: string) => void;
  onAskAI: (q: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate, onAskAI }) => {
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim(), 200);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 30);
    else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setResults(d))
      .catch(() => !cancelled && setResults(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q]);

  if (!isOpen) return null;

  const total = results ? GROUPS.reduce((n, g) => n + (results[g.key]?.length || 0), 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rockets, missions, astronauts, agencies…"
            className="flex-1 py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            aria-label="Search"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.length < 2 ? (
            <p className="px-3 py-6 text-sm text-slate-500 text-center">Type at least two letters — for example “Falcon”, “Apollo” or “Koch”.</p>
          ) : loading && !results ? (
            <p className="px-3 py-6 text-sm text-slate-500 text-center">Searching…</p>
          ) : (
            <>
              {results &&
                GROUPS.map((g) =>
                  results[g.key]?.length ? (
                    <div key={g.key} className="py-1">
                      <div className="px-3 pt-2 pb-1 text-xs font-medium text-slate-500">{g.label}</div>
                      {results[g.key].map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            onNavigate(g.section, String(h.id));
                            onClose();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left"
                        >
                          <Img src={h.thumb} alt="" w={96} className="w-10 h-10 rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{h.name}</div>
                            <div className="text-xs text-slate-500 truncate">{h.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null
                )}
              {results && total === 0 && <p className="px-3 py-6 text-sm text-slate-500 text-center">No matches for “{q}”.</p>}
              <button
                onClick={() => {
                  onAskAI(q);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 mt-1 rounded-xl hover:bg-slate-50 text-left border-t border-slate-100"
              >
                <span className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-sm text-slate-700">
                  Ask AI about “<span className="font-medium text-slate-900">{q}</span>”
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
