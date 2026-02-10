import { createClient } from '@/lib/supabase/server';
import StatsCard from '@/components/admin/StatsCard';
import OrdersTable from '@/components/admin/OrdersTable';
import { DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import type { Order } from '@/types/database';

async function getStats() {
  const supabase = await createClient();

  const [totalResult, approvedResult, recentOrders] = await Promise.all([
    supabase.from('orders').select('amount', { count: 'exact' }),
    supabase
      .from('orders')
      .select('amount')
      .eq('status', 'Approved'),
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalOrders = totalResult.count || 0;
  const approvedOrders = (approvedResult.data || []) as { amount: number }[];
  const totalRevenue = approvedOrders.reduce(
    (sum, order) => sum + Number(order.amount),
    0
  );
  const successRate =
    totalOrders > 0
      ? Math.round((approvedOrders.length / totalOrders) * 100)
      : 0;

  return {
    totalRevenue,
    totalOrders,
    approvedCount: approvedOrders.length,
    successRate,
    recentOrders: (recentOrders.data || []) as Order[],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-gray-400 mt-1">
          Огляд статистики та останніх замовлень
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Загальний дохід"
          value={stats.totalRevenue}
          icon={DollarSign}
          suffix=" ₴"
        />
        <StatsCard
          label="Всього замовлень"
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <StatsCard
          label="Успішних оплат"
          value={stats.approvedCount}
          icon={TrendingUp}
        />
        <StatsCard
          label="Конверсія"
          value={stats.successRate}
          icon={Clock}
          suffix="%"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Останні замовлення</h2>
          <a
            href="/admin/orders"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Переглянути всі →
          </a>
        </div>
        <OrdersTable orders={stats.recentOrders} />
      </div>
    </div>
  );
}
