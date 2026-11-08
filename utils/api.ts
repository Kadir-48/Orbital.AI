import { useCallback, useEffect, useState } from 'react';

const memory = new Map<string, { data: unknown; at: number }>();

/**
 * Small fetch hook with loading / error state and a short in-memory cache,
 * so switching between pages doesn't refetch the same live feed.
 */
export function useApi<T>(url: string, maxAgeMs = 5 * 60 * 1000) {
  const cached = memory.get(url);
  const [data, setData] = useState<T | null>(cached ? (cached.data as T) : null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      const hit = memory.get(url);
      if (!force && hit && Date.now() - hit.at < maxAgeMs) {
        setData(hit.data as T);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
        memory.set(url, { data: body, at: Date.now() });
        setData(body as T);
      } catch (err) {
        setError((err as Error).message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [url, maxAgeMs]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: () => load(true) };
}
