import React, { useState, useEffect } from 'react';
import { SpaceWeatherMetric } from '../types';
import { Sun, Activity, RefreshCw, ExternalLink, Shield, Flame, AlertTriangle, ChevronDown } from 'lucide-react';
import { timeAgo } from '../utils/format';
import { PageHeader } from '../components/ui';

export function useSpaceWeather() {
  const [weather, setWeather] = useState<SpaceWeatherMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/space-weather');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unavailable');
      setWeather(data);
    } catch (err) {
      setError((err as Error).message || 'Space weather data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { weather, loading, error, reload: load };
}

const kpColour = (kp: number) => (kp >= 5 ? 'text-red-700' : kp >= 4 ? 'text-amber-700' : 'text-emerald-700');
const kpBar = (kp: number) => (kp >= 5 ? 'bg-rose-500' : kp >= 4 ? 'bg-amber-500' : 'bg-emerald-500');

const SCALE_LABELS = ['None', 'Minor', 'Moderate', 'Strong', 'Severe', 'Extreme'];

export const SpaceWeatherView: React.FC = () => {
  const { weather, loading, error, reload } = useSpaceWeather();
  const [openAlert, setOpenAlert] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Space weather"
        subtitle="What the Sun is doing right now — geomagnetic activity, solar wind, flares and the chance of aurora."
        right={
        <button
          onClick={reload}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-2 transition-colors self-start md:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading…' : 'Refresh'}</span>
        </button>
        }
      />

      {error && !weather && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
          <div>
            <p className="font-semibold">Couldn’t load space weather data.</p>
            <p className="text-red-700/80 mt-1">{error} You can check the source directly at{' '}
              <a className="underline" href="https://www.swpc.noaa.gov/" target="_blank" rel="noopener noreferrer">swpc.noaa.gov</a>.
            </p>
          </div>
        </div>
      )}

      {loading && !weather && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {weather && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 uppercase">Planetary Kp index</span>
                  <Activity className="w-4 h-4 text-amber-700" />
                </div>
                {weather.kp ? (
                  <>
                    <div className={`text-3xl font-bold ${kpColour(weather.kp.value)}`}>Kp {weather.kp.value.toFixed(2)}</div>
                    <div className="text-xs text-slate-600 font-medium mt-1">{weather.kp.status}</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Scale 0–9. Kp 5 or more is a geomagnetic storm.
                {weather.kp && <> Measured {timeAgo(weather.kp.time)}.</>}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 uppercase">Solar wind speed</span>
                  <Flame className="w-4 h-4 text-blue-700" />
                </div>
                {weather.solarWind ? (
                  <>
                    <div className="text-3xl font-bold text-blue-700">
                      {weather.solarWind.speedKmS} <span className="text-base text-slate-500">km/s</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1">
                      Density: {weather.solarWind.densityPcm3 ?? '—'} protons/cm³
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Typical: ~300–500 km/s.
                {weather.solarWind && <> {weather.solarWind.spacecraft} spacecraft, {timeAgo(weather.solarWind.time)}.</>}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 uppercase">Latest solar flare</span>
                  <Sun className="w-4 h-4 text-red-700" />
                </div>
                {weather.xray?.latestFlareClass ? (
                  <>
                    <div className="text-3xl font-bold text-red-700">{weather.xray.latestFlareClass}</div>
                    <div className="text-xs text-slate-600 font-medium mt-1">
                      Peaked {weather.xray.latestFlareTime ? timeAgo(weather.xray.latestFlareTime) : ''} • X-ray now: {weather.xray.currentClass}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Classes A, B, C, M, X — each 10× stronger. {weather.xray?.satellite && `Measured by ${weather.xray.satellite}.`}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 uppercase">Tomorrow’s outlook</span>
                  <Shield className="w-4 h-4 text-emerald-700" />
                </div>
                {weather.scales?.forecast ? (
                  <ul className="text-xs text-slate-600 space-y-1 mt-1">
                    <li>Minor radio blackout (R1–R2): <strong className="text-slate-900">{weather.scales.forecast.radioBlackoutMinorProb ?? '—'}%</strong></li>
                    <li>Major radio blackout (R3+): <strong className="text-slate-900">{weather.scales.forecast.radioBlackoutMajorProb ?? '—'}%</strong></li>
                    <li>Radiation storm (S1+): <strong className="text-slate-900">{weather.scales.forecast.radiationStormProb ?? '—'}%</strong></li>
                    <li>Expected geomagnetic level: <strong className="text-slate-900">G{weather.scales.forecast.geomagneticScale ?? 0}</strong></li>
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">Not available</div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                Forecast probabilities{weather.scales?.forecast ? ` for ${weather.scales.forecast.date}` : ''}.
              </div>
            </div>
          </div>

          {weather.scales && (
            <section className="p-5 rounded-2xl bg-white border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-3">Current conditions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {([
                  ['R', 'Radio blackouts', 'Caused by solar flares; affects HF radio on the sunlit side of Earth.'],
                  ['S', 'Solar radiation storms', 'Energetic protons; a hazard to astronauts and satellites.'],
                  ['G', 'Geomagnetic storms', 'Caused by CMEs and fast solar wind; produces aurora and can affect power grids.'],
                ] as const).map(([key, label, desc]) => {
                  const level = weather.scales!.current[key];
                  return (
                    <div key={key} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{label}</span>
                        <span className={`font-mono font-bold ${level > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {key}{level} · {SCALE_LABELS[level] ?? '—'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1.5">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {weather.kpHistory && weather.kpHistory.length > 0 && (
            <section className="p-5 rounded-2xl bg-white border border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Kp index — last 3 days</h2>
              <p className="text-xs text-slate-500 mt-0.5">Each bar is a 3-hour period (UTC). Dashed line marks storm level (Kp 5).</p>
              <div className="relative mt-4 h-32 flex items-end gap-[3px]" role="img" aria-label="Bar chart of Kp index over the last 3 days">
                <div className="absolute left-0 right-0 border-t border-dashed border-rose-500/50" style={{ bottom: `${(5 / 9) * 100}%` }} />
                {weather.kpHistory.map((p) => (
                  <div key={p.time} className="flex-1 h-full flex items-end group relative">
                    <div className={`w-full rounded-t ${kpBar(p.kp)}`} style={{ height: `${Math.max(2, (p.kp / 9) * 100)}%` }} />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap text-[10px] bg-slate-100 text-slate-900 px-1.5 py-0.5 rounded z-10">
                      Kp {p.kp} · {new Date(p.time).toUTCString().slice(5, 22)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>{new Date(weather.kpHistory[0].time).toUTCString().slice(5, 16)}</span>
                <span>Now</span>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Recent alerts & warnings</h2>
              <a
                href="https://www.swpc.noaa.gov/products/alerts-watches-and-warnings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-700 hover:text-blue-700 flex items-center gap-1"
              >
                All alerts <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {weather.alerts && weather.alerts.length > 0 ? (
              <div className="space-y-2">
                {weather.alerts.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-white border border-slate-200">
                    <button
                      onClick={() => setOpenAlert(openAlert === a.id ? null : a.id)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-left"
                      aria-expanded={openAlert === a.id}
                    >
                      <div>
                        <p className="text-sm text-slate-800">{a.headline}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(a.issued).toUTCString().replace('GMT', 'UTC')} · {timeAgo(a.issued)}
                        </p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openAlert === a.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openAlert === a.id && (
                      <pre className="px-4 pb-4 text-[11px] text-slate-500 whitespace-pre-wrap">{a.message}</pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recent alerts.</p>
            )}
          </section>

          <p className="text-xs text-slate-400">Updated {timeAgo(weather.fetchedAt)}</p>
        </>
      )}
    </div>
  );
};
