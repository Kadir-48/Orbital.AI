import { PageHeader } from '../components/ui';
import React, { useState } from 'react';
import { VERIFIED_GLOSSARY } from '../data/spaceData';
import { GlossaryTerm } from '../types';
import {
  calculateHohmannTransferDeltaV,
  calculateOrbitalPeriodMinutes,
  calculateOrbitalVelocity,
  calculateEscapeVelocity,
} from '../utils/orbitalCalculations';
import {
  BookOpen,
  Search,
  Calculator,
  Compass,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const EncyclopediaView: React.FC = () => {
  const [terms] = useState<GlossaryTerm[]>(VERIFIED_GLOSSARY);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // Interactive Calculator state
  const [initialAlt, setInitialAlt] = useState<number>(300); // 300 km LEO
  const [targetAlt, setTargetAlt] = useState<number>(35786); // 35,786 km GEO

  const hohmannResult = calculateHohmannTransferDeltaV(initialAlt, targetAlt);
  const leoPeriod = calculateOrbitalPeriodMinutes(initialAlt);
  const leoVel = calculateOrbitalVelocity(initialAlt);
  const escVel = calculateEscapeVelocity(initialAlt);

  const filtered = terms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      (t.acronymFor && t.acronymFor.toLowerCase().includes(search.toLowerCase())) ||
      t.definition.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader title="Glossary" subtitle="Plain-language explanations of common spaceflight terms, plus a quick orbit calculator." />

      {/* Interactive Astrodynamics Calculator Tool */}
      <section className="p-6 rounded-2xl bg-white border border-blue-200  space-y-4">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-5 h-5 text-blue-700" />
          <h2 className="text-base font-bold text-slate-900">
            Orbital Mechanics & Hohmann Transfer Calculator
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Compute required velocity change (Δv), transfer ellipse flight time, and orbital velocities between two circular orbits around Earth.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs text-blue-700 block">
              Initial Orbit Altitude (r1) — km
            </label>
            <input
              type="number"
              value={initialAlt}
              onChange={(e) => setInitialAlt(Math.max(100, Number(e.target.value)))}
              className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
            />
            <div className="text-[11px] text-slate-500">
              E.g. 300 km (Low Earth Orbit / Space Station)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs text-blue-700 block">
              Destination Orbit Altitude (r2) — km
            </label>
            <input
              type="number"
              value={targetAlt}
              onChange={(e) => setTargetAlt(Math.max(200, Number(e.target.value)))}
              className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded text-slate-900 text-sm focus:outline-none focus:border-cyan-400"
            />
            <div className="text-[11px] text-slate-500">
              E.g. 35,786 km (Geostationary Equatorial Orbit - GEO)
            </div>
          </div>
        </div>

        {/* Calculation Output Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-[10px] text-slate-500">Transfer Total Δv</span>
            <div className="text-base font-bold text-blue-700 mt-0.5">
              {hohmannResult.totalDeltaV} km/s
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500">Transfer Duration</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {(hohmannResult.transferTimeMinutes / 60).toFixed(2)} hours
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500">LEO Orbital Speed</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5">
              {leoVel.kmPerSec} km/s
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500">LEO Escape Speed</span>
            <div className="text-base font-bold text-amber-700 mt-0.5">
              {escVel} km/s
            </div>
          </div>
        </div>
      </section>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search aerospace concepts (Max-Q, MECO, TLI, Delta-v...)"
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Orbital Mechanics', 'Rocket Propulsion', 'Flight Operations', 'Astrodynamics'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Glossary Items List */}
      <div className="space-y-4">
        {filtered.map((term) => {
          const isExpanded = expandedTerm === term.term;
          return (
            <div
              key={term.term}
              className="rounded-2xl bg-white border border-slate-200 hover:border-blue-200 transition-all overflow-hidden"
            >
              <div
                onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                className="p-5 flex items-start justify-between cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {term.term}
                    </h3>
                    {term.acronymFor && (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {term.acronymFor}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {term.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {term.definition}
                  </p>
                </div>

                <button
                  className="p-1 text-slate-500 group-hover:text-blue-700 transition-colors ml-4 shrink-0"
                  aria-label="Toggle details"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-200 bg-slate-50 space-y-3 text-xs leading-relaxed animate-fadeIn">
                  <div>
                    <h5 className="font-mono text-blue-700 font-semibold mb-1">
                      In-Depth Engineering Explanation
                    </h5>
                    <p className="text-slate-600">{term.detailedExplanation}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                    <span className="font-mono text-emerald-700 font-semibold block mb-0.5">
                      Aerospace Example:
                    </span>
                    <p className="text-slate-600 italic">{term.example}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
