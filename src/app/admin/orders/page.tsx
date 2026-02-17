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
    const sanitized = search.replace(/[%_,().*]/g, '');
    if (sanitized) {
      query = query.or(
        `customer_email.ilike.%${sanitized}%,customer_name.ilike.%${sanitized}%,order_reference.ilike.%${sanitized}%`
      );
    }
  }

  const { data, count, error } = await query
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], totalPages: 1, currentPage: page, totalCount: 0 };
  }

  return {
    orders: (data || []) as Order[],
    totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
    currentPage: page,
    totalCount: count || 0,
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { orders, totalPages, currentPage, totalCount } = await getOrders(params);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Замовлення</h1>
        <p className="text-gray-500">Перегляд та фільтрація всіх замовлень</p>
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
        totalCount={totalCount}
      />
    </div>
  );
}
