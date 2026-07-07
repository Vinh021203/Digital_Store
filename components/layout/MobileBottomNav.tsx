'use client';

import React, { useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, User, Heart, type LucideIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// ============================================
// NavItem Component
// ============================================
interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  isActive: boolean;
}

const NavItem = memo<NavItemProps>(({ to, icon: Icon, label, badge = 0, isActive }) => {
  return (
    <Link
      href={to}
      className="relative flex flex-col items-center justify-center py-2 transition-all"
      prefetch={true}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-b-full" />
      )}

      {/* Icon */}
      <div className="relative">
        <div className={`p-1.5 rounded-xl transition-all ${isActive
          ? 'bg-orange-50'
          : ''
          }`}>
          <Icon
            size={22}
            strokeWidth={isActive ? 2.5 : 2}
            className={isActive ? 'text-orange-600' : 'text-slate-500'}
          />
        </div>

        {/* Badge */}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>

      {/* Label */}
      <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-orange-600' : 'text-slate-500'
        }`}>
        {label}
      </span>
    </Link>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.badge === nextProps.badge
  );
});

NavItem.displayName = 'NavItem';

// ============================================
// Main Component
// ============================================
const MobileBottomNav = () => {
  const pathname = usePathname();
  const { wishlist } = useCart();
  const { user } = useAuth();

  // Navigation items
  const navItems = useMemo(() => [
    { to: '/', icon: Home, label: 'Trang chủ' },
    { to: '/products', icon: Package, label: 'Mẫu demo' },
    { to: '/community', icon: Users, label: 'Cộng đồng' },
    { to: '/wishlist', icon: Heart, label: 'Yêu thích', badge: wishlist.length },
    { to: '/profile', icon: User, label: 'Cá nhân' },
  ], [wishlist.length]);

  const isItemActive = (to: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/products') return pathname === '/products' || pathname.startsWith('/product/');
    if (to === '/profile') return pathname === '/profile' || pathname.startsWith('/profile/');
    return pathname === to;
  };

  return (
    <>
      {/* Safe area spacer - adjusted for proper spacing */}
      <div className="h-[60px] md:hidden" />

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        role="navigation"
        aria-label="Mobile bottom navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 h-[60px] max-w-md mx-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={isItemActive(item.to)}
            />
          ))}
        </div>
      </nav>
    </>
  );
};

export default memo(MobileBottomNav);
