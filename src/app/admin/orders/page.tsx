import { createClient } from '@/lib/supabase/server';
import OrdersTable from '@/components/admin/OrdersTable';
import OrdersFilter from '@/components/admin/OrdersFilter';
import type { Order } from '@/types/database';

const ITEMS_PER_PAGE = 20;

interface SearchParams {
  page?: string;
  status?: string;
  search?: string;
}

async function getOrders(searchParams: SearchParams) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1', 10);
  const status = searchParams.status;
  const search = searchParams.search;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `customer_email.ilike.%${search}%,customer_name.ilike.%${search}%,order_reference.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], totalPages: 1, currentPage: page };
  }

  return {
    orders: (data || []) as Order[],
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    currentPage: page,
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { orders, totalPages, currentPage } = await getOrders(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Замовлення</h1>
        <p className="text-gray-400 mt-1">
          Перегляд та фільтрація всіх замовлень
        </p>
      </div>

      <OrdersFilter
        currentStatus={params.status || 'all'}
        currentSearch={params.search || ''}
      />

      <OrdersTable
        orders={orders}
        showPagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
