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
            className={isActive ? 'text-orange-600' : 'text-slate-400'}
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
      <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-orange-600' : 'text-slate-400'
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

  // Check if on main pages
  const isMainPage = useMemo(() => {
    const allowedPaths = ['/', '/products', '/community', '/profile', '/wishlist', '/blog'];
    return allowedPaths.includes(pathname);
  }, [pathname]);

  // Navigation items
  const navItems = useMemo(() => [
    { to: '/', icon: Home, label: 'Trang chủ' },
    { to: '/products', icon: Package, label: 'Sản phẩm' },
    { to: '/community', icon: Users, label: 'Cộng đồng' },
    { to: '/wishlist', icon: Heart, label: 'Yêu thích', badge: wishlist.length },
    { to: '/profile', icon: User, label: 'Cá nhân' },
  ], [wishlist.length]);

  if (!isMainPage) return null;

  return (
    <>
      {/* Safe area spacer */}
      <div className="h-16 md:hidden" />

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 pb-safe z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        role="navigation"
        aria-label="Mobile bottom navigation"
      >
        <div className="grid grid-cols-5 h-full max-w-md mx-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={pathname === item.to}
            />
          ))}
        </div>

        {/* iPhone safe area */}
        <div className="absolute bottom-0 left-0 right-0 h-safe bg-white" />
      </nav>

      {/* Styles */}
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .h-safe {
          height: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

export default memo(MobileBottomNav);

