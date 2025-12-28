'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, User as UserIcon, Menu, X, LogOut, ShieldCheck,
  Search, Heart, BookOpen, GraduationCap, Users, Repeat, Bell,
  Sparkles, Star, Home, Package, Newspaper, ChevronRight, Brain,
  Mail, Phone, Hand,
  type LucideIcon
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SearchModal, LanguageSwitcher, NotificationCenter, useNotifications } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/context/ThemeContext';

// ============================================
// Throttle Hook for Scroll Performance
// ============================================
const useThrottle = (callback: () => void, delay: number) => {
  const lastRun = React.useRef(Date.now());

  return useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback();
      lastRun.current = now;
    }
  }, [callback, delay]);
};

// ============================================
// Menu Item Type
// ============================================
interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  bg: string;
}

// ============================================
// Desktop Menu Item - Memoized
// ============================================
interface DesktopMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

const DesktopMenuItem = memo<DesktopMenuItemProps>(({ item, isActive }) => (
  <Link
    href={item.href}
    className={`group relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
      ? 'text-white'
      : 'text-slate-700 hover:text-orange-600'
      }`}
    prefetch={true}
  >
    {isActive && (
      <span
        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl shadow-lg shadow-${item.bg}-200 will-change-transform`}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {item.label}
      {isActive && <Star size={14} className="fill-white animate-pulse" />}
    </span>
    {!isActive && (
      <span
        className={`absolute inset-0 bg-${item.bg}-50 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10 will-change-transform`}
      />
    )}
  </Link>
), (prev, next) => prev.isActive === next.isActive);

DesktopMenuItem.displayName = 'DesktopMenuItem';

// ============================================
// Mobile Menu Item - Memoized
// ============================================
interface MobileMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClose: () => void;
}

const MobileMenuItem = memo<MobileMenuItemProps>(({ item, isActive, onClose }) => (
  <Link
    href={item.href}
    onClick={onClose}
    className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 active:scale-95 ${isActive
      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
      : 'text-slate-700 hover:bg-slate-50'
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${isActive
        ? 'bg-white/20'
        : `bg-${item.bg}-50`
        }`}>
        <item.icon size={20} className={isActive ? 'text-white' : `text-${item.bg}-600`} />
      </div>
      <span className="font-bold text-base">{item.label}</span>
    </div>
    <ChevronRight size={20} className={isActive ? 'text-white/60' : 'text-slate-400'} />
  </Link>
), (prev, next) => prev.isActive === next.isActive);

MobileMenuItem.displayName = 'MobileMenuItem';

// ============================================
// Badge Component - Memoized
// ============================================
interface BadgeProps {
  count: number;
  gradient: string;
}

const Badge = memo<BadgeProps>(({ count, gradient }) => {
  if (count === 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-md`}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}, (prev, next) => prev.count === next.count);

Badge.displayName = 'Badge';

// ============================================
// Main Navbar Component
// ============================================
const Navbar = () => {
  const { totalItems, wishlist, compareList } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();

  // ============================================
  // Memoized Menu Items
  // ============================================
  const menuItems = useMemo<MenuItem[]>(() => [
    { href: '/', label: 'Trang Chủ', icon: Home, gradient: 'from-orange-600 to-red-600', bg: 'orange' },
    { href: '/products', label: 'Sản Phẩm', icon: Package, gradient: 'from-red-600 to-rose-600', bg: 'red' },
    { href: '/ai-recommendation', label: 'AI Tư Vấn', icon: Brain, gradient: 'from-violet-600 to-purple-600', bg: 'violet' },
    { href: '/blog', label: 'Tin Tức', icon: Newspaper, gradient: 'from-amber-600 to-orange-600', bg: 'amber' },
    { href: '/community', label: 'Cộng Đồng', icon: Users, gradient: 'from-orange-500 to-amber-500', bg: 'orange' },
  ], [t]);

  // ============================================
  // Throttled Scroll Handler
  // ============================================
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  const throttledScroll = useThrottle(handleScroll, 100); // Max 10 calls/second

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);

  // ============================================
  // Body Overflow Management
  // ============================================
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // ============================================
  // Memoized Callbacks
  // ============================================
  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  }, [logout, router]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  // ============================================
  // Render
  // ============================================
  return (
    <>
      {/* ============================================ */}
      {/* TOP BAR - Contact & Utilities */}
      {/* ============================================ */}
      <div className={`hidden lg:block bg-slate-900 text-white transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-9 text-xs">
            {/* Left - Contact Info */}
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={14} className="text-orange-400" />
                veutong961@gmail.com
              </span>
              <span className="w-px h-3 bg-slate-700" />
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={14} className="text-orange-400" />
                0971.386.588
              </span>
            </div>

            {/* Right - Utilities */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <span className="w-px h-4 bg-slate-700" />
              <ThemeToggle />
              <span className="w-px h-4 bg-slate-700" />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-1.5 text-slate-400 hover:text-orange-400 transition-colors rounded-lg hover:bg-slate-800"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 text-[9px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationCenter
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MAIN NAV - Logo, Menu, Actions */}
      {/* ============================================ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 lg:h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group" prefetch={true}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                <img
                  src="/favicon.png"
                  alt="DigitalMart Logo"
                  className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg lg:text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  DigitalMart
                </span>
                <span className="text-[8px] lg:text-[9px] font-semibold text-slate-500 -mt-0.5 tracking-wider">DIGITAL PRODUCTS</span>
              </div>
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50/80 rounded-xl px-2 py-1.5 border border-slate-100">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${isActive(item.href)
                    ? 'text-white'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-white'
                    }`}
                  prefetch={true}
                >
                  {isActive(item.href) && (
                    <span className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-lg shadow-md`} />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}

              {user?.isAffiliate && (
                <Link
                  href="/affiliate"
                  className="relative px-4 py-2 rounded-lg text-sm font-bold overflow-hidden whitespace-nowrap"
                  prefetch={true}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-gradient-x" />
                  <span className="relative z-10 flex items-center gap-1.5 text-white">
                    <Sparkles size={14} />
                    Đối Tác
                  </span>
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile utilities */}
              <div className="flex lg:hidden items-center gap-0.5">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>

              {/* Search */}
              <button
                onClick={openSearch}
                className="p-2 lg:p-2.5 text-slate-500 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Compare */}
              <Link
                href="/compare"
                className="hidden lg:flex relative p-2.5 text-slate-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                aria-label="Compare products"
              >
                <Repeat size={20} />
                <Badge count={compareList.length} gradient="from-blue-500 to-cyan-500" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden lg:flex relative p-2.5 text-slate-500 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
                aria-label={`Wishlist (${wishlist.length} items)`}
              >
                <Heart size={20} />
                <Badge count={wishlist.length} gradient="from-rose-500 to-pink-500" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 lg:p-2.5 text-slate-500 hover:text-orange-600 transition-colors rounded-xl hover:bg-orange-50"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingCart size={20} />
                <Badge count={totalItems} gradient="from-orange-600 to-red-600" />
              </Link>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

              {/* Desktop User Menu */}
              {user ? (
                <div className="hidden lg:block relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover ring-2 ring-orange-100 shadow-sm"
                      loading="lazy"
                    />
                    <span className="hidden xl:block text-sm font-semibold text-slate-700 max-w-[80px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* Desktop Dropdown */}
                  <div className="absolute right-0 w-64 mt-2 origin-top-right bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/80 truncate">{user.email}</p>
                    </div>

                    <div className="p-2">
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                          <ShieldCheck size={18} />
                          {t('nav.admin')}
                        </Link>
                      )}
                      <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                        <UserIcon size={18} />
                        {t('nav.profile')}
                      </Link>
                      <Link href="/profile?tab=orders" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                        <GraduationCap size={18} />
                        {t('nav.orders')}
                      </Link>

                      <div className="my-1.5 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all"
                  prefetch={true}
                >
                  <UserIcon size={16} />
                  <span className="text-sm">{t('nav.login')}</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors ml-0.5"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        user={user}
        isAdmin={isAdmin}
        menuItems={menuItems}
        isActive={isActive}
        handleLogout={handleLogout}
        t={t}
      />

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      <AnimationStyles />
    </>
  );
};

// ============================================
// Mobile Menu - Separated Component
// ============================================
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  menuItems: MenuItem[];
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  t: any;
}

const MobileMenu = memo<MobileMenuProps>(({
  isOpen,
  onClose,
  user,
  isAdmin,
  menuItems,
  isActive,
  handleLogout,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* User Section */}
        {user ? (
          <div className="px-5 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl border-3 border-white shadow-lg object-cover"
                  loading="lazy"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg truncate">{user.name}</p>
                <p className="text-white/80 text-sm truncate">{user.email}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-all active:scale-90"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-lg">Xin chào!</p>
                <Hand size={20} className="text-amber-500" />
              </div>
              <p className="text-sm text-slate-500">Đăng nhập để trải nghiệm tốt hơn</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all active:scale-90"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Quick Actions Bar - Mobile */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-around">
          <Link
            href="/compare"
            onClick={onClose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="relative">
              <Repeat size={22} className="text-blue-500" />
              {/* Badge can be added here */}
            </div>
            <span className="text-[10px] font-medium text-slate-500">So sánh</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Heart size={22} className="text-rose-500" />
            <span className="text-[10px] font-medium text-slate-500">Yêu thích</span>
          </Link>
          <Link
            href="/profile?tab=notifications"
            onClick={onClose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Bell size={22} className="text-orange-500" />
            <span className="text-[10px] font-medium text-slate-500">Thông báo</span>
          </Link>
          <Link
            href="/profile?tab=downloads"
            onClick={onClose}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <BookOpen size={22} className="text-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500">Downloads</span>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <MobileMenuItem
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClose={onClose}
            />
          ))}

          {user?.isAffiliate && (
            <Link
              href="/affiliate"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg transition-all active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Sparkles size={20} className="text-white animate-spin-slow" />
                </div>
                <span className="font-bold text-base">Kênh Đối Tác</span>
              </div>
              <ChevronRight size={20} className="text-white/60" />
            </Link>
          )}
        </div>

        {/* User Actions */}
        {user && (
          <div className="px-4 pb-4 space-y-1 border-t border-slate-100 pt-4 mt-2">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-700 hover:bg-orange-50 transition-all active:scale-95"
              >
                <ShieldCheck size={20} className="text-orange-600" />
                <span className="font-semibold">{t('nav.admin')}</span>
              </Link>
            )}
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
            >
              <UserIcon size={20} className="text-slate-600" />
              <span className="font-semibold">{t('nav.profile')}</span>
            </Link>
            <Link
              href="/profile?tab=orders"
              onClick={onClose}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
            >
              <GraduationCap size={20} className="text-slate-600" />
              <span className="font-semibold">{t('nav.orders')}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span className="font-semibold">{t('nav.logout')}</span>
            </button>
          </div>
        )}

        {/* Login Button */}
        {!user && (
          <div className="px-4 pb-6 pt-4">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all"
            >
              <UserIcon size={20} />
              {t('nav.login')}
            </Link>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div >
  );
}, (prev, next) => {
  return (
    prev.isOpen === next.isOpen &&
    prev.user === next.user &&
    prev.isAdmin === next.isAdmin
  );
});

MobileMenu.displayName = 'MobileMenu';

// ============================================
// Animation Styles - Memoized
// ============================================
const AnimationStyles = memo(() => (
  <style jsx global>{`
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 3s ease infinite;
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .will-change-transform {
      will-change: transform;
    }
    .will-change-opacity {
      will-change: opacity;
    }
  `}</style>
));

AnimationStyles.displayName = 'AnimationStyles';

export default memo(Navbar);
