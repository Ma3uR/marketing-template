import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Адмін-панель | Курс Маркетингу',
  description: 'Панель управління замовленнями та email шаблонами',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if this is the login page
  const isLoginPage =
    typeof window === 'undefined'
      ? false
      : window.location.pathname === '/admin/login';

  // If not authenticated and not on login page, the middleware will handle redirect
  // If authenticated, verify admin status
  if (user && user.email) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', user.email as string)
      .single();

    if (!adminUser) {
      redirect('/admin/login?error=not_admin');
    }
  }

  // For login page, render without sidebar
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar userEmail={user.email || ''} />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
