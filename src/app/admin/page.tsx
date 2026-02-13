import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import type { Order } from '@/types/database';
import GlassCard from '@/components/admin/GlassCard';
import KPICard from '@/components/admin/KPICard';
import StatusPill from '@/components/admin/StatusPill';
import SalesChart from '@/components/admin/SalesChart';
import TrafficSources from '@/components/admin/TrafficSources';
import Link from 'next/link';

async function getDashboardData() {
  const supabase = await createClient();

  const [totalResult, approvedResult, recentOrders, chartRaw] = await Promise.all([
    supabase.from('orders').select('amount', { count: 'exact' }),
    supabase.from('orders').select('amount').eq('status', 'Approved'),
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orders')
      .select('amount, created_at')
      .eq('status', 'Approved')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true }),
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

  // Aggregate chart data by day
  const chartMap = new Map<string, number>();
  for (const row of (chartRaw.data || []) as { amount: number; created_at: string }[]) {
    const day = format(new Date(row.created_at), 'EEE', { locale: uk });
    const capitalized = day.charAt(0).toUpperCase() + day.slice(1);
    chartMap.set(capitalized, (chartMap.get(capitalized) || 0) + Number(row.amount));
  }
  const chartData = Array.from(chartMap.entries()).map(([name, value]) => ({ name, value }));

  return {
    totalRevenue,
    totalOrders,
    approvedCount: approvedOrders.length,
    successRate,
    recentOrders: (recentOrders.data || []) as Order[],
    chartData,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardData();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-6">
        <KPICard
          title="Загальний дохід"
          value={`₴ ${stats.totalRevenue.toLocaleString('uk-UA')}`}
          trend="+12.5%"
          trendUp
          icon="DollarSign"
          color="from-emerald-400 to-teal-500"
        />
        <KPICard
          title="Замовлення"
          value={stats.totalOrders.toLocaleString('uk-UA')}
          trend="+5.2%"
          trendUp
          icon="ShoppingCart"
          color="from-rose-500 to-pink-500"
        />
        <KPICard
          title="Конверсія"
          value={`${stats.successRate}%`}
          trend="-0.4%"
          trendUp={false}
          icon="TrendingUp"
          color="from-amber-400 to-orange-500"
        />
        <KPICard
          title="Успішних оплат"
          value={stats.approvedCount.toLocaleString('uk-UA')}
          trend="+22.1%"
          trendUp
          icon="User"
          color="from-purple-500 to-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Статистика продажів</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                Тиждень
              </span>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs cursor-pointer">
                Місяць
              </span>
            </div>
          </div>
          <SalesChart data={stats.chartData} />
        </GlassCard>

        <GlassCard className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-6">Джерела трафіку</h3>
          <TrafficSources />
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Останні замовлення</h3>
          <Link
            href="/admin/orders"
            className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors"
          >
            Дивитись всі
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-white/5">
                <th className="pb-4 font-medium">Дата</th>
                <th className="pb-4 font-medium">Клієнт</th>
                <th className="pb-4 font-medium">Продукт</th>
                <th className="pb-4 font-medium">Сума</th>
                <th className="pb-4 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-white/5">
              {stats.recentOrders.map((order) => {
                const initials = order.customer_name
                  ? order.customer_name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                  : '??';
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 text-sm">
                      {format(new Date(order.created_at), 'dd MMM, HH:mm', {
                        locale: uk,
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {initials}
                        </div>
                        <span className="font-medium text-white">
                          {order.customer_name || 'Невідомо'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm">{order.product_name || '—'}</td>
                    <td className="py-4 font-bold text-white">
                      ₴ {Number(order.amount).toLocaleString('uk-UA')}
                    </td>
                    <td className="py-4">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                );
              })}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Замовлень поки немає
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
