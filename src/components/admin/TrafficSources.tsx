'use client';

import { useState, useEffect } from 'react';
import type { TrafficSource, Period } from '@/lib/google-analytics';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7д' },
  { value: '30d', label: '30д' },
  { value: '90d', label: '90д' },
];

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': 'bg-blue-500',
  'Paid Search': 'bg-sky-500',
  'Direct': 'bg-emerald-500',
  'Referral': 'bg-amber-500',
  'Organic Social': 'bg-violet-500',
  'Paid Social': 'bg-rose-500',
  'Email': 'bg-cyan-500',
  'Display': 'bg-orange-500',
  'Affiliates': 'bg-lime-500',
  'Cross-network': 'bg-indigo-500',
  'Others': 'bg-gray-500',
};

const FALLBACK_COLORS = ['bg-pink-500', 'bg-teal-500', 'bg-red-500'];

function getColor(source: string, index: number): string {
  return (
    CHANNEL_COLORS[source] ||
    FALLBACK_COLORS[index % FALLBACK_COLORS.length] ||
    'bg-gray-500'
  );
}

function SkeletonBars() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-10 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/10 rounded-full animate-pulse"
              style={{ width: `${70 - i * 12}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrafficSources() {
  const [period, setPeriod] = useState<Period>('7d');
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/traffic-sources?period=${period}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setSources(json.sources);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Не вдалося завантажити дані');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [period, retryKey]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Джерела трафіку</h3>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                period === p.value
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <SkeletonBars />}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-3 text-rose-400 text-xs hover:text-rose-300 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      )}

      {!loading && !error && sources.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-sm">
            Дані за цей період відсутні
          </p>
        </div>
      )}

      {!loading && !error && sources.length > 0 && (
        <div className="space-y-6">
          {sources.map((source, i) => (
            <div key={source.source} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{source.source}</span>
                <span className="text-white font-medium">
                  {source.percent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getColor(source.source, i)} rounded-full transition-all duration-500`}
                  style={{ width: `${source.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
