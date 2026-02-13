'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Order } from '@/types/database';
import GlassCard from './GlassCard';
import StatusPill from './StatusPill';

interface OrdersTableProps {
  orders: Order[];
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
}

const ITEMS_PER_PAGE = 20;

export default function OrdersTable({
  orders,
  showPagination,
  currentPage = 1,
  totalPages = 1,
  totalCount,
}: OrdersTableProps) {
  const searchParams = useSearchParams();

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/admin/orders?${params.toString()}`;
  };

  const rangeStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount || orders.length);

  if (orders.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-gray-400">Замовлень поки немає</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0">
      {showPagination && totalCount && (
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            Показано <span className="text-white font-bold">{rangeStart}-{rangeEnd}</span> з{' '}
            <span className="text-white font-bold">{totalCount}</span> замовлень
          </p>
          <div className="flex gap-1">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Link>
            ) : (
              <span className="p-2 rounded-lg bg-white/5 opacity-50 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </span>
            )}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-2 rounded-lg bg-rose-500/50 text-white/50 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Дата та час</th>
              <th className="px-6 py-4 font-semibold">ID Замовлення</th>
              <th className="px-6 py-4 font-semibold">Клієнт</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Продукт</th>
              <th className="px-6 py-4 font-semibold">Сума</th>
              <th className="px-6 py-4 font-semibold text-center">Статус</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 divide-y divide-white/5">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-white/[0.02] transition-all cursor-pointer"
              >
                <td className="px-6 py-5 text-sm">
                  {format(new Date(order.created_at), 'dd.MM.yyyy, HH:mm', {
                    locale: uk,
                  })}
                </td>
                <td className="px-6 py-5 font-mono text-xs text-rose-400">
                  #{order.order_reference}
                </td>
                <td className="px-6 py-5 font-medium text-white">
                  {order.customer_name || 'Невідомо'}
                </td>
                <td className="px-6 py-5 text-sm text-gray-500">
                  {order.customer_email || '—'}
                </td>
                <td className="px-6 py-5 text-sm">
                  {order.product_name || '—'}
                </td>
                <td className="px-6 py-5 font-bold text-white whitespace-nowrap">
                  ₴ {Number(order.amount).toLocaleString('uk-UA')}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    <StatusPill status={order.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
