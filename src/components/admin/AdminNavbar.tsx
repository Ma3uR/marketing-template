'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, ShoppingBag, Mail, Star, CreditCard, Settings, LogOut, Menu, X, MoreHorizontal } from 'lucide-react';
import GlassCard from './GlassCard';

const PRIMARY_NAV_ITEMS = [
  { id: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { id: '/admin/orders', label: 'Замовлення', icon: ShoppingBag },
  { id: '/admin/reviews', label: 'Відгуки', icon: Star },
] as const;

const SECONDARY_NAV_ITEMS = [
  { id: '/admin/emails', label: 'Шаблони листів', icon: Mail },
  { id: '/admin/pricing', label: 'Тарифи', icon: CreditCard },
  { id: '/admin/settings', label: 'Налаштування', icon: Settings },
] as const;

const ALL_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

interface AdminNavbarProps {
  userEmail: string;
}

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isSecondaryActive = SECONDARY_NAV_ITEMS.some((item) => isActive(item.id));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
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
              {PRIMARY_NAV_ITEMS.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.id}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative ${
                    isActive(tab.id) ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isActive(tab.id) && (
                    <motion.div
                      layoutId="activeNavTab"
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

              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 relative ${
                    isSecondaryActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isSecondaryActive && (
                    <motion.div
                      layoutId="activeMoreTab"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 shadow-inner"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <MoreHorizontal className="w-4 h-4" />
                    Ще
                  </span>
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[rgba(26,13,46,0.95)] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {SECONDARY_NAV_ITEMS.map((item) => (
                        <Link
                          key={item.id}
                          href={item.id}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all ${
                            isActive(item.id)
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              {ALL_NAV_ITEMS.map((tab) => (
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
