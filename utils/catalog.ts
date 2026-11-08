import { useEffect, useState } from 'react';
import { useApi } from './api';
import type { Paged } from '../types/ll2';

export function buildUrl(endpoint: string, params: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '' && v !== 'all') qs.set(k, String(v));
  const s = qs.toString();
  return s ? `${endpoint}?${s}` : endpoint;
}

export function useCatalog<T>(endpoint: string, params: Record<string, string | number | undefined | null>) {
  return useApi<Paged<T>>(buildUrl(endpoint, params), 10 * 60 * 1000);
}

/** Resolve the selected item from the current page, or fetch it by id (deep links). */
export function useSelected<T extends { id: string | number }>(endpoint: string, id: string | undefined, items: T[] | undefined) {
  const [item, setItem] = useState<T | null>(null);
  useEffect(() => {
    if (!id) return setItem(null);
    const local = items?.find((x) => String(x.id) === id);
    if (local) return setItem(local);
    let cancelled = false;
    fetch(`${endpoint}?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setItem(d.items?.[0] ?? null))
      .catch(() => !cancelled && setItem(null));
    return () => {
      cancelled = true;
    };
  }, [endpoint, id, items]);
  return item;
}
