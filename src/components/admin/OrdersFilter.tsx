'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface OrdersFilterProps {
  currentStatus: string;
  currentSearch: string;
}

const statusOptions = [
  { value: 'all', label: 'Всі статуси' },
  { value: 'Approved', label: 'Оплачено' },
  { value: 'Declined', label: 'Відхилено' },
  { value: 'Refunded', label: 'Повернено' },
  { value: 'InProcessing', label: 'В обробці' },
];

export default function OrdersFilter({
  currentStatus,
  currentSearch,
}: OrdersFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`/admin/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== currentSearch) {
        updateParams({ search, page: '1' });
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [search, currentSearch, updateParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук замовлення, імені або email..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
        />
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={currentStatus}
            onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
            className="w-full appearance-none pl-10 pr-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#1a0d2e] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-colors">
          Експорт CSV
        </button>
      </div>
    </div>
  );
}
