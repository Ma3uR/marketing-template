'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== currentSearch) {
        updateParams({ search, page: '1' });
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [search]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за email, ім'ям або номером..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        />
      </div>

      <select
        value={currentStatus}
        onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
        className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition cursor-pointer"
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
