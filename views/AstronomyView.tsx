import React, { useState } from 'react';
import { APODData } from '../types';
import { useApi } from '../utils/api';
import { PageHeader, Img, ErrorState, Stat } from '../components/ui';

interface CelestialBody {
  id: string;
  name: string;
  type: 'Star' | 'Terrestrial Planet' | 'Gas Giant' | 'Ice Giant' | 'Ocean Moon' | 'Dwarf Planet';
  distanceFromSunAU: number;
  diameterKm: number;
  rotationPeriodHours: number;
  orbitalPeriodDays: number;
  moonsCount: number;
  atmosphere: string;
  description: string;
  color: string;
}

const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'Star',
    distanceFromSunAU: 0,
    diameterKm: 1392700,
    rotationPeriodHours: 609,
    orbitalPeriodDays: 0,
    moonsCount: 0,
    atmosphere: 'Hydrogen (73%), Helium (25%), Plasma',
    description: 'A G-type main-sequence star (G2V) holding about 99.86% of the Solar System’s mass. Its activity drives space weather. (Rotation shown is at the equator, ~25 days.)',
    color: 'from-amber-300 to-orange-500',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    distanceFromSunAU: 0.39,
    diameterKm: 4879,
    rotationPeriodHours: 1407.6,
    orbitalPeriodDays: 88,
    moonsCount: 0,
    atmosphere: 'Surface-bound exosphere: Oxygen, Sodium, Hydrogen',
    description: 'Innermost and smallest planet, experiencing extreme temperature swings from -180°C to 430°C.',
    color: 'from-slate-400 to-zinc-600',
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    distanceFromSunAU: 0.72,
    diameterKm: 12104,
    rotationPeriodHours: -5832.5, // Retrograde
    orbitalPeriodDays: 224.7,
    moonsCount: 0,
    atmosphere: '96.5% Carbon Dioxide, Sulfuric Acid clouds (92 bar pressure)',
    description: 'Runaway greenhouse world with surface temperature of 465°C—hot enough to melt lead.',
    color: 'from-amber-300 to-orange-500',
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet',
    distanceFromSunAU: 1.0,
    diameterKm: 12742,
    rotationPeriodHours: 23.93,
    orbitalPeriodDays: 365.25,
    moonsCount: 1,
    atmosphere: '78% Nitrogen, 21% Oxygen, 1% Argon / Trace CO2',
    description: 'The only known world harboring life, with vast liquid oceans and active plate tectonics.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    distanceFromSunAU: 1.52,
    diameterKm: 6779,
    rotationPeriodHours: 24.62,
    orbitalPeriodDays: 687,
    moonsCount: 2,
    atmosphere: '95% CO2, 2.6% N2, 1.9% Argon (6 millibar pressure)',
    description: 'The Red Planet. Home to Olympus Mons (tallest volcano in solar system) and ancient dried riverbeds.',
    color: 'from-red-500 to-orange-700',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    distanceFromSunAU: 5.2,
    diameterKm: 139820,
    rotationPeriodHours: 9.93,
    orbitalPeriodDays: 4333,
    moonsCount: 97,
    atmosphere: '90% Hydrogen, 10% Helium with ammonia cloud bands',
    description: 'Largest planet in solar system, featuring the Great Red Spot storm and intense magnetic radiation belts.',
    color: 'from-amber-600 to-orange-800',
  },
  {
    id: 'europa',
    name: 'Europa (Jovian Moon)',
    type: 'Ocean Moon',
    distanceFromSunAU: 5.2,
    diameterKm: 3121,
    rotationPeriodHours: 85.2,
    orbitalPeriodDays: 3.55,
    moonsCount: 0,
    atmosphere: 'Thin molecular oxygen exosphere',
    description: 'Smooth icy crust concealing a global liquid saltwater ocean twice the volume of Earth oceans.',
    color: 'from-cyan-300 to-blue-400',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant',
    distanceFromSunAU: 9.58,
    diameterKm: 116460,
    rotationPeriodHours: 10.7,
    orbitalPeriodDays: 10759,
    moonsCount: 274,
    atmosphere: '96% Hydrogen, 3% Helium, methane & ammonia',
    description: 'Famous for its icy rings, which span about 282,000 km but are typically only about 10 m to 1 km thick.',
    color: 'from-amber-200 to-yellow-600',
  },
  {
    id: 'titan',
    name: 'Titan (Saturnian Moon)',
    type: 'Ocean Moon',
    distanceFromSunAU: 9.58,
    diameterKm: 5149,
    rotationPeriodHours: 382,
    orbitalPeriodDays: 15.9,
    moonsCount: 0,
    atmosphere: '95% Nitrogen, 5% Methane (1.5x Earth sea level pressure)',
    description: 'Only moon with a dense atmosphere and stable surface lakes of liquid ethane and methane.',
    color: 'from-amber-500 to-orange-600',
  },
];

// Checked November 2026. Past events are removed automatically below.
const UPCOMING_ASTRONOMICAL_EVENTS = [
  {
    name: 'Leonids Meteor Shower Peak',
    date: 'November 17–18, 2026',
    endsOn: '2026-11-19',
    type: 'Meteor Shower',
    description: 'Typically 10–15 meteors per hour from dark skies, produced by debris from Comet Tempel–Tuttle.',
  },
  {
    name: 'Geminids Meteor Shower Peak',
    date: 'December 13–14, 2026',
    endsOn: '2026-12-15',
    type: 'Meteor Shower',
    description: 'Often the strongest shower of the year — up to about 120 meteors per hour under ideal skies — from debris of asteroid 3200 Phaethon.',
  },
  {
    name: 'Quadrantids Meteor Shower Peak',
    date: 'January 3–4, 2027',
    endsOn: '2027-01-05',
    type: 'Meteor Shower',
    description: 'A short, sharp peak that can produce dozens of meteors per hour for observers in the Northern Hemisphere.',
  },
  {
    name: 'Annular Solar Eclipse',
    date: 'February 6, 2027',
    endsOn: '2027-02-07',
    type: 'Solar Eclipse',
    description: 'A “ring of fire” eclipse visible along a path across southern South America, the Atlantic Ocean and West Africa.',
  },
  {
    name: 'Total Solar Eclipse',
    date: 'August 2, 2027',
    endsOn: '2027-08-03',
    type: 'Solar Eclipse',
    description: 'Path of totality crosses southern Spain, North Africa and the Middle East; up to about 6 minutes 23 seconds of totality near Luxor, Egypt.',
  },
].filter((e) => new Date(e.endsOn).getTime() > Date.now());


export const AstronomyView: React.FC = () => {
  const { data, loading, error, reload } = useApi<{ items: APODData[] }>('/api/apod?all=1', 60 * 60 * 1000);
  const items = data?.items ?? [];
  const [index, setIndex] = useState(0);
  const current = items[index];
  const [body, setBody] = useState<CelestialBody>(CELESTIAL_BODIES[3]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageHeader title="Astronomy" subtitle="NASA’s Astronomy Picture of the Day, the worlds of our Solar System, and what to look for in the sky." />

      <section className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
        {error && !data ? (
          <div className="p-6"><ErrorState text="NASA’s picture of the day couldn’t be loaded right now." onRetry={reload} /></div>
        ) : loading && !data ? (
          <div className="aspect-[16/9] bg-slate-100 animate-pulse" />
        ) : current ? (
          <div className="grid lg:grid-cols-5">
            <div className="lg:col-span-3 bg-slate-950 flex items-center justify-center min-h-[320px]">
              {current.media_type === 'video' && current.url ? (
                <iframe src={current.url} title={current.title} className="w-full aspect-video" allowFullScreen />
              ) : (
                <a href={current.hdurl || current.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <Img src={current.media_type === 'image' ? current.url : current.thumbnail_url} alt={current.title} w={1400} fit="contain" className="w-full h-full max-h-[640px] bg-slate-950" />
                </a>
              )}
            </div>
            <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col">
              <p className="text-sm text-slate-500">{new Date(current.date + 'T12:00:00Z').toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{current.title}</h2>
              <p className="mt-4 text-slate-700 leading-relaxed text-[15px] overflow-y-auto max-h-[360px] pr-1">{current.explanation}</p>
              {current.copyright && <p className="mt-4 text-xs text-slate-400">© {current.copyright.trim()}</p>}
              <div className="mt-auto pt-6 flex gap-2">
                <button onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))} disabled={index >= items.length - 1} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40">← Previous day</button>
                <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40">Next day →</button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {items.length > 1 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent pictures</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((a, i) => (
              <button key={a.date} onClick={() => { setIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`group text-left rounded-2xl overflow-hidden bg-white border ${i === index ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`}>
                <Img src={a.media_type === 'image' ? a.url : a.thumbnail_url} alt={a.title} w={320} className="w-full aspect-square group-hover:opacity-90" />
                <div className="p-2.5">
                  <div className="text-xs text-slate-500">{new Date(a.date + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                  <div className="text-sm font-medium text-slate-900 line-clamp-1">{a.title}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Solar System</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {CELESTIAL_BODIES.map((b) => (
            <button key={b.id} onClick={() => setBody(b)} className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${body.id === b.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}`}>
              {b.name}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 grid md:grid-cols-3 gap-8">
          <div>
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${body.color}`} aria-hidden="true" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">{body.name}</h3>
            <p className="text-sm text-slate-500">{body.type}</p>
          </div>
          <div className="md:col-span-2 space-y-5">
            <p className="text-slate-700 leading-relaxed">{body.description}</p>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50">
              <Stat label="Diameter" value={`${body.diameterKm.toLocaleString()} km`} />
              <Stat label="Distance from Sun" value={body.distanceFromSunAU ? `${body.distanceFromSunAU} AU` : '—'} />
              <Stat label="Day length" value={`${Math.abs(body.rotationPeriodHours).toLocaleString()} h${body.rotationPeriodHours < 0 ? ' (retrograde)' : ''}`} />
              <Stat label="Year length" value={body.orbitalPeriodDays ? `${body.orbitalPeriodDays.toLocaleString()} days` : '—'} />
              <Stat label="Moons" value={body.id === 'sun' ? '—' : body.moonsCount} />
            </dl>
            <p className="text-sm text-slate-600"><span className="font-medium text-slate-900">Atmosphere:</span> {body.atmosphere}</p>
          </div>
        </div>
      </section>

      {UPCOMING_ASTRONOMICAL_EVENTS.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">In the sky soon</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UPCOMING_ASTRONOMICAL_EVENTS.map((e) => (
              <div key={e.name} className="rounded-2xl bg-white border border-slate-200 p-5">
                <p className="text-sm font-medium text-blue-700">{e.date}</p>
                <h3 className="mt-1 font-semibold text-slate-900">{e.name}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
