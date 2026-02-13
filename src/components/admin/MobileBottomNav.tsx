'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Mail, Star, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard },
  { href: '/admin/orders', icon: ShoppingBag },
  { href: '/admin/emails', icon: Mail },
  { href: '/admin/reviews', icon: Star },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex justify-center">
      <div className="bg-[rgba(26,13,46,0.9)] backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between w-full shadow-2xl">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded-xl transition-all ${
              isActive(item.href) ? 'text-rose-500 bg-rose-500/10' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
        <button className="p-2 rounded-xl text-gray-500">
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
