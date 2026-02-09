'use client';

import { Order } from '@/types/database';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface OrdersTableProps {
  orders: Order[];
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const statusColors: Record<string, string> = {
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Declined: 'bg-red-500/20 text-red-400 border-red-500/30',
  Refunded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  InProcessing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  Approved: 'Оплачено',
  Declined: 'Відхилено',
  Refunded: 'Повернено',
  InProcessing: 'В обробці',
  Expired: 'Прострочено',
};

export default function OrdersTable({
  orders,
  showPagination,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: uk });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('uk-UA')} ${currency}`;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8 text-center">
        <p className="text-gray-400">Замовлень поки немає</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                Дата
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                Клієнт
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                Продукт
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                Сума
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
              >
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-300">
                    {formatDate(order.created_at)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="text-sm text-white">
                      {order.customer_name || 'Невідомо'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.customer_email || order.customer_phone || '—'}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-300">
                    {order.product_name || '—'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-white">
                    {formatAmount(Number(order.amount), order.currency)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusColors[order.status] || statusColors.Expired
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Сторінка {currentPage} з {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Назад
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
