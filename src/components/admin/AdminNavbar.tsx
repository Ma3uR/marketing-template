'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, ShoppingBag, Mail, LogOut, Menu, X } from 'lucide-react';
import GlassCard from './GlassCard';

const NAV_ITEMS = [
  { id: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { id: '/admin/orders', label: 'Замовлення', icon: ShoppingBag },
  { id: '/admin/emails', label: 'Шаблони листів', icon: Mail },
] as const;

interface AdminNavbarProps {
  userEmail: string;
}

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl pointer-events-auto">
          <div className="bg-[rgba(26,13,46,0.7)] backdrop-blur-2xl border border-white/10 rounded-3xl px-6 py-3 flex items-center justify-between shadow-2xl">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg tracking-tight text-white">
                STUDIO.<span className="text-rose-500">ADMIN</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-black/20 p-1.5 rounded-2xl border border-white/5">
              {NAV_ITEMS.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.id}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative ${
                    isActive(tab.id) ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isActive(tab.id) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 shadow-inner"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-white/10">
                <div className="text-right">
                  <p className="text-xs font-bold text-white leading-none">Адміністратор</p>
                  <p className="text-[10px] text-gray-500 font-medium">{userEmail}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 relative">
                  <Image
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all border border-white/5"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-white/5 text-gray-400"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 lg:inset-x-6 top-24 z-40 md:hidden"
          >
            <GlassCard className="p-4 space-y-2">
              {NAV_ITEMS.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.id}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${
                    isActive(tab.id)
                      ? 'bg-rose-500 text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
