import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X, ImageOff, AlertCircle } from 'lucide-react';

/** Route remote images through Netlify Image CDN for resizing + modern formats. */
export function cdn(url: string | undefined, w: number): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('https://assets.science.nasa.gov/dynamicimage/')) return `${url.split('?')[0]}?w=${w}`;
  if (/thespacedevs-(prod|dev)\.nyc3\.digitaloceanspaces\.com|apod\.nasa\.gov|img\.youtube\.com/.test(url)) {
    return `/.netlify/images?url=${encodeURIComponent(url)}&w=${w}&q=75`;
  }
  return url;
}

export const Img: React.FC<{
  src?: string;
  alt: string;
  w?: number;
  className?: string;
  fit?: 'cover' | 'contain';
  fallbackText?: string;
}> = ({ src, alt, w = 640, className = '', fit = 'cover', fallbackText }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        {fallbackText ? (
          <span className="text-2xl font-semibold tracking-tight text-slate-300 px-3 text-center">{fallbackText}</span>
        ) : (
          <ImageOff className="w-6 h-6" aria-hidden="true" />
        )}
      </div>
    );
  }
  return (
    <img
      src={cdn(src, w)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} bg-slate-100 ${className}`}
    />
  );
};

export const PageHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
    <div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-500 max-w-2xl">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string; className?: string }> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
    {value && (
      <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700" aria-label="Clear search">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

export function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === o.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
}> = ({ value, onChange, options, label }) => (
  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
    <span className="sr-only sm:not-sr-only">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export const Pagination: React.FC<{ page: number; pages: number; total: number; onChange: (p: number) => void; noun: string }> = ({
  page,
  pages,
  total,
  onChange,
  noun,
}) => {
  if (pages <= 1) return <p className="text-sm text-slate-500 pt-6">{total.toLocaleString()} {noun}</p>;
  return (
    <div className="flex items-center justify-between gap-3 pt-8">
      <p className="text-sm text-slate-500">
        {total.toLocaleString()} {noun} · page {page} of {pages.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number; aspect?: string }> = ({ count = 8, aspect = 'aspect-[4/3]' }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className={`${aspect} bg-slate-100 animate-pulse`} />
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState: React.FC<{ title: string; text?: string; action?: React.ReactNode }> = ({ title, text, action }) => (
  <div className="py-16 text-center">
    <p className="text-slate-900 font-medium">{title}</p>
    {text && <p className="text-sm text-slate-500 mt-1">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState: React.FC<{ text: string; onRetry?: () => void }> = ({ text, onRetry }) => (
  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
    <div className="flex-1">
      {text}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 font-medium underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  </div>
);

const BADGE: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
};

export const Badge: React.FC<{ color?: keyof typeof BADGE; children: React.ReactNode; className?: string }> = ({ color = 'slate', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${BADGE[color]} ${className}`}>{children}</span>
);

export function launchStatusColor(status: string): keyof typeof BADGE {
  const s = status.toLowerCase();
  if (s.includes('success') || s.includes('go for')) return 'green';
  if (s.includes('partial')) return 'amber';
  if (s.includes('fail')) return 'red';
  if (s.includes('flight')) return 'blue';
  if (s.includes('hold')) return 'amber';
  return 'slate';
}

export const Stat: React.FC<{ label: string; value: React.ReactNode; sub?: React.ReactNode }> = ({ label, value, sub }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="mt-0.5 text-base font-semibold text-slate-900 tabular-nums">{value}</dd>
    {sub && <dd className="text-xs text-slate-500">{sub}</dd>}
  </div>
);

/** Side drawer for detail views. Closes with Escape or a click outside. */
export const Drawer: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto animate-slideIn"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ExtLink: React.FC<{ href?: string; children: React.ReactNode }> = ({ href, children }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline underline-offset-2">
      {children} ↗
    </a>
  ) : null;

/** Debounce a fast-changing value (e.g. a search box). */
export function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const fmt = {
  num: (n: number | null | undefined, unit = '') => (n == null || n === 0 ? '—' : `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}`),
  date: (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
  dateTime: (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
  pct: (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '—'),
  money: (n: number | null) => (n ? (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${Math.round(n / 1e6).toLocaleString()}M`) : '—'),
};
