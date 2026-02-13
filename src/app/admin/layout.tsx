import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/admin/AdminNavbar';
import MobileBottomNav from '@/components/admin/MobileBottomNav';

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

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0f0a1f] text-white selection:bg-rose-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-600/10 blur-[150px] rounded-full" />
      </div>

      <AdminNavbar userEmail={user.email || ''} />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 pt-28 lg:pt-32 pb-24 md:pb-20 relative z-10">
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
