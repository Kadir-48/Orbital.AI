import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as satellite from '../utils/sgp4';
import { VERIFIED_SATELLITES } from '../data/spaceData';
import { SatelliteItem } from '../types';
import { Radio, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/ui';

type Tle = { line1: string; line2: string };

interface LivePosition {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  speedKmS: number;
}

const EARTH_RADIUS_KM = 6371;
const EARTH_UNITS = 4; // radius of the globe in scene units

function toScene(latDeg: number, lonDeg: number, altKm: number) {
  const r = EARTH_UNITS * (1 + altKm / EARTH_RADIUS_KM);
  const polar = ((90 - latDeg) * Math.PI) / 180;
  const az = ((lonDeg + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(polar) * Math.cos(az), r * Math.cos(polar), r * Math.sin(polar) * Math.sin(az));
}

function propagateAt(satrec: satellite.SatRec, date: Date): LivePosition | null {
  const pv = satellite.propagate(satrec, date);
  if (!pv || !pv.position || typeof pv.position === 'boolean') return null;
  const gmst = satellite.gstime(date);
  const geo = satellite.eciToGeodetic(pv.position as satellite.EciVec3<number>, gmst);
  const v = pv.velocity as satellite.EciVec3<number>;
  return {
    latitude: satellite.degreesLat(geo.latitude),
    longitude: satellite.degreesLong(geo.longitude),
    altitudeKm: geo.height,
    speedKmS: Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  };
}

function tleEpoch(satrec: satellite.SatRec): Date {
  // jdsatepoch is the Julian date of the element set epoch
  const jd = satrec.jdsatepoch;
  return new Date((jd - 2440587.5) * 86400000);
}

export const SatelliteTrackerView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, THREE.Mesh>>({});
  const orbitsRef = useRef<Record<string, THREE.Line>>({});
  const globeRef = useRef<THREE.Group | null>(null);

  const [tles, setTles] = useState<Record<string, Tle> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(VERIFIED_SATELLITES[0].id);
  const [positions, setPositions] = useState<Record<string, LivePosition>>({});

  const loadTles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/satellites/tle');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unavailable');
      setTles(data.tles);
    } catch (err) {
      setError((err as Error).message || 'Orbital data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTles();
  }, []);

  const satrecs = useMemo(() => {
    const out: Record<string, satellite.SatRec> = {};
    if (!tles) return out;
    for (const s of VERIFIED_SATELLITES) {
      const t = tles[String(s.noradId)];
      if (t) {
        try {
          out[s.id] = satellite.twoline2satrec(t.line1, t.line2);
        } catch {
          /* skip malformed element set */
        }
      }
    }
    return out;
  }, [tles]);

  // Build the 3D scene once.
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    globeRef.current = globe;
    scene.add(globe);

    const texture = new THREE.TextureLoader().load('/textures/earth.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_UNITS, 64, 64),
      new THREE.MeshPhongMaterial({ map: texture, shininess: 8 })
    );
    globe.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_UNITS * 1.03, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 8, 12);
    scene.add(light);

    // Tilt so the northern hemisphere is visible
    globe.rotation.x = 0.35;

    let dragging = false;
    let last = { x: 0, y: 0 };
    let idle = true;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      idle = false;
      last = { x: e.clientX, y: e.clientY };
      container.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      globe.rotation.y += (e.clientX - last.x) * 0.006;
      globe.rotation.x = Math.max(-1.2, Math.min(1.2, globe.rotation.x + (e.clientY - last.y) * 0.006));
      last = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(7, Math.min(30, camera.position.z + e.deltaY * 0.01));
    };
    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (idle) globe.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      globeRef.current = null;
      markersRef.current = {};
      orbitsRef.current = {};
    };
  }, []);

  // Add markers and one-orbit paths when element sets arrive.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    Object.values(markersRef.current).forEach((m) => globe.remove(m));
    Object.values(orbitsRef.current).forEach((o) => globe.remove(o));
    markersRef.current = {};
    orbitsRef.current = {};

    const now = new Date();
    for (const s of VERIFIED_SATELLITES) {
      const rec = satrecs[s.id];
      if (!rec) continue;
      const periodMin = (2 * Math.PI) / rec.no;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 120; i++) {
        const p = propagateAt(rec, new Date(now.getTime() + (i / 120) * periodMin * 60000));
        if (p) pts.push(toScene(p.latitude, p.longitude, p.altitudeKm));
      }
      const orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 })
      );
      globe.add(orbit);
      orbitsRef.current[s.id] = orbit;

      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      globe.add(marker);
      markersRef.current[s.id] = marker;
    }
  }, [satrecs]);

  // Live position updates every second.
  useEffect(() => {
    if (Object.keys(satrecs).length === 0) return;
    const tick = () => {
      const now = new Date();
      const next: Record<string, LivePosition> = {};
      for (const [id, rec] of Object.entries(satrecs)) {
        const p = propagateAt(rec, now);
        if (!p) continue;
        next[id] = p;
        markersRef.current[id]?.position.copy(toScene(p.latitude, p.longitude, p.altitudeKm));
      }
      setPositions(next);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [satrecs]);

  // Highlight the selected satellite.
  useEffect(() => {
    for (const [id, m] of Object.entries(markersRef.current)) {
      const sel = id === selectedId;
      (m.material as THREE.MeshBasicMaterial).color.set(sel ? 0xfacc15 : 0x38bdf8);
      m.scale.setScalar(sel ? 1.8 : 1);
    }
    for (const [id, o] of Object.entries(orbitsRef.current)) {
      const mat = o.material as THREE.LineBasicMaterial;
      const sel = id === selectedId;
      mat.color.set(sel ? 0xfacc15 : 0x64748b);
      mat.opacity = sel ? 0.9 : 0.35;
    }
  }, [selectedId, satrecs, positions]);

  const selected: SatelliteItem = VERIFIED_SATELLITES.find((s) => s.id === selectedId)!;
  const rec = satrecs[selectedId];
  const pos = positions[selectedId];
  const periodMin = rec ? (2 * Math.PI) / rec.no : null;
  const inclination = rec ? (rec.inclo * 180) / Math.PI : null;
  const epoch = rec ? tleEpoch(rec) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="Satellite tracker"
        subtitle="Where the ISS, Tiangong, Hubble and other satellites are right now. Positions update every second; the globe and orbits are to scale."
        right={
        <button
          onClick={loadTles}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-slate-900 text-xs flex items-center gap-2 transition-colors self-start md:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Loading…' : 'Reload orbital data'}</span>
        </button>
        }
      />

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-700" />
          <span>Couldn’t load orbital data: {error} Please try again shortly.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl bg-[#040814] border border-slate-200 overflow-hidden relative flex flex-col min-h-[420px] sm:min-h-[520px]">
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-amber-400/40 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
              <Radio className="w-3 h-3" /> {selected.name}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Drag to rotate · scroll to zoom
          </div>
          <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing touch-none" aria-label="3D globe showing satellite positions" />
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-500 whitespace-nowrap pl-1">Select:</span>
            {VERIFIED_SATELLITES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedId === s.id ? 'bg-amber-400 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-700">{selected.type}</span>
              <span className="text-xs text-slate-500">NORAD {selected.noradId}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              {selected.operator} · {selected.country}
            </div>

            <dl className="mt-5 space-y-2 text-xs">
              {[
                ['Latitude', pos ? `${pos.latitude.toFixed(3)}°` : '—'],
                ['Longitude', pos ? `${pos.longitude.toFixed(3)}°` : '—'],
                ['Altitude', pos ? `${pos.altitudeKm.toFixed(1)} km` : '—'],
                ['Orbital speed', pos ? `${pos.speedKmS.toFixed(2)} km/s (${Math.round(pos.speedKmS * 3600).toLocaleString()} km/h)` : '—'],
                ['Orbital period', periodMin ? `${periodMin.toFixed(1)} min (${(1440 / periodMin).toFixed(1)} orbits/day)` : '—'],
                ['Inclination', inclination != null ? `${inclination.toFixed(2)}°` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-mono font-semibold text-slate-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">{selected.description}</p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            {epoch && <div>Orbit data from {epoch.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>}
            <div className="flex items-center justify-between">
              <span />
              <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-700 flex items-center gap-1">
                About <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
