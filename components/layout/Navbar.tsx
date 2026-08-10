"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Search,
  Heart,
  BookOpen,
  Users,
  Repeat,
  Bell,
  Sparkles,
  Star,
  Home,
  Package,
  Newspaper,
  ChevronRight,
  Brain,
  Mail,
  Phone,
  Hand,
  Settings,
  Download,
  HelpCircle,
  Info,
  Compass,
  Zap,
  TrendingUp,
  Globe,
  Code2,
  Palette,
  LayoutTemplate,
  ShoppingBag,
  BarChart2,
  Image as ImageIcon,
  ChevronDown,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  SearchModal,
  LanguageSwitcher,
  NotificationCenter,
  useNotifications,
} from "@/components/ui";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/context/ThemeContext";
import { useSiteMode } from "@/hooks/useSiteSettings";

// ============================================
// Types
// ============================================
interface MegaCategory {
  label: string;
  href: string;
  logo?: string;
  icon?: LucideIcon;
  color?: string;
}

interface MegaMenuData {
  featured?: {
    label: string;
    desc: string;
    href: string;
    icon: LucideIcon;
    gradient: string;
  }[];
  categories?: MegaCategory[];
  cta?: { label: string; href: string; gradient: string };
}

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  bg: string;
  megaMenu?: MegaMenuData;
}

interface BadgeProps {
  count: number;
  gradient: string;
  size?: "sm" | "xs";
}

// ============================================
// useThrottle
// ============================================
const useThrottle = (callback: () => void, delay: number) => {
  const lastRun = useRef(Date.now());
  return useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback();
      lastRun.current = now;
    }
  }, [callback, delay]);
};

// ============================================
// Badge
// ============================================
const Badge = memo<BadgeProps>(
  ({ count, gradient, size = "sm" }) => {
    if (count === 0) return null;
    const dim =
      size === "xs"
        ? "min-w-[14px] h-[14px] text-[8px] px-0.5"
        : "min-w-[18px] h-[18px] text-[10px] px-1";
    return (
      <span
        className={`absolute -top-1 -right-1 ${dim} font-bold text-white bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center shadow-md pointer-events-none`}
      >
        {count > 9 ? "9+" : count}
      </span>
    );
  },
  (p, n) => p.count === n.count,
);
Badge.displayName = "Badge";

// ============================================
// Announcement Bar — ticker mobile
// ============================================
const AnnouncementBar = memo(() => {
  const [visible, setVisible] = useState(true);
  const { isCatalogMode } = useSiteMode();
  if (!visible) return null;

  const msg =
    isCatalogMode
      ? "🎉 Bộ sưu tập mới — Xem demo và nhận tư vấn giao diện phù hợp tuần này!"
      : "Bộ sưu tập demo mới — Xem mẫu giao diện phù hợp tuần này!";

  return (
    <div
      className="relative bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white text-xs font-medium overflow-hidden"
      style={{ height: "32px" }}
    >
      <div className="flex items-center h-full">
        {/* Desktop: static centered */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-2 px-4">
          <Zap size={12} className="flex-shrink-0 animate-pulse" />
          <span>
            {isCatalogMode ? (
              <>🎉 Bộ sưu tập mới — Xem demo và nhận tư vấn giao diện phù hợp tuần này!</>
            ) : (
              <>Bộ sưu tập demo mới — Xem mẫu giao diện phù hợp tuần này!</>
            )}
          </span>
          <Link
            href="/products?sale=1"
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline font-bold flex-shrink-0"
          >
            Xem ngay <ArrowRight size={11} />
          </Link>
        </div>

        {/* Mobile: marquee ticker liên tục */}
        <div className="lg:hidden flex-1 overflow-hidden relative h-full">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-orange-600 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-amber-600 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center h-full">
            {/* 4 copies để không bao giờ thấy gap */}
            <div className="announcement-ticker flex items-center gap-0 whitespace-nowrap">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 flex-shrink-0 px-6"
                >
                  <Zap size={10} className="flex-shrink-0 opacity-90" />
                  {msg}
                  <span className="mx-2 opacity-50">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="flex-shrink-0 p-1.5 rounded hover:bg-white/20 transition-colors mr-1 z-20"
          aria-label="Đóng thông báo"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
});
AnnouncementBar.displayName = "AnnouncementBar";

// ============================================
// Top Utility Bar (desktop only)
// ============================================
interface TopBarProps {
  scrolled: boolean;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (v: boolean) => void;
  unreadCount: number;
}
const TopBar = memo<TopBarProps>(
  ({ scrolled, isNotificationOpen, setIsNotificationOpen, unreadCount }) => (
    <div
      className="hidden lg:block bg-slate-900 text-white overflow-hidden transition-all duration-300"
      style={{ maxHeight: scrolled ? "0" : "36px", opacity: scrolled ? 0 : 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-9 text-xs">
          {/* Left Side: Contacts & Stats */}
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="mailto:contact@webgiare.id.vn"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail size={13} className="text-orange-400" />
              contact@webgiare.id.vn
            </a>
            <span className="w-px h-3 bg-slate-700" />
            <a
              href="tel:0971386588"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone size={13} className="text-orange-400" />
              0971.386.588
            </a>
            <span className="w-px h-3 bg-slate-700" />
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingUp size={13} className="text-green-400" />
              1,200+ giao diện website
            </span>
          </div>

          {/* Right Side: Quick Links, Language & Notification */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-slate-300 font-medium">
              <Link
                href="/about"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Info size={13} className="text-slate-500 group-hover:text-orange-400" />
                Giới thiệu
              </Link>
              <span className="w-px h-3 bg-slate-700" />
              <Link
                href="/faq"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <HelpCircle size={13} className="text-slate-500 group-hover:text-orange-400" />
                Hỏi đáp
              </Link>
              <span className="w-px h-3 bg-slate-700" />
              <Link
                href="/tracking"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Compass size={13} className="text-slate-500 group-hover:text-orange-400" />
                Tra cứu
              </Link>
            </div>

            <span className="w-px h-4 bg-slate-700" />
            <LanguageSwitcher variant="dark" />

            <span className="w-px h-4 bg-slate-700" />
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-1.5 text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-colors rounded-lg"
                aria-label="Thông báo"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 text-[8px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
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
  ),
);
TopBar.displayName = "TopBar";

// ============================================
// Mega Menu Panel
// ============================================
const MegaMenuPanel = memo<{ data: MegaMenuData; onClose?: () => void }>(
  ({ data, onClose }) => (
    <div className="mega-menu absolute top-full left-1/2 z-[110] mt-2 w-[580px] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-2xl shadow-slate-200/60 pointer-events-auto">
      <div className="p-5 grid grid-cols-2 gap-1">
        {/* Featured column */}
        {data.featured && (
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
              Nổi bật
            </p>
            {data.featured.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-150"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <item.icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight
                  size={14}
                  className="ml-auto text-slate-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            ))}
          </div>
        )}

        {/* Categories column — logo/icon thật */}
        {data.categories && (
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
              Danh mục
            </p>
            <ul className="grid grid-cols-2 gap-0.5">
              {data.categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    onClick={onClose}
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-150"
                  >
                    {cat.logo ? (
                      <div
                        className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                        style={{ color: cat.color }}
                      >
                        <img
                          src={cat.logo}
                          alt={cat.label}
                          className="w-4 h-4 object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : cat.icon ? (
                      <cat.icon
                        size={14}
                        className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 transition-colors"
                      />
                    ) : null}
                    <span className="truncate">{cat.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.cta && (
        <div className={`px-5 py-3 bg-gradient-to-r ${data.cta.gradient}`}>
          <Link
            href={data.cta.href}
            onClick={onClose}
            className="flex items-center justify-between text-white text-sm font-semibold group"
          >
            <span>{data.cta.label}</span>
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      )}
    </div>
  ),
);
MegaMenuPanel.displayName = "MegaMenuPanel";

// ============================================
// Desktop Nav Item (with optional mega menu)
// ============================================
interface DesktopNavItemProps {
  item: MenuItem;
  isActive: boolean;
}
const DesktopNavItem = memo<DesktopNavItemProps>(
  ({ item, isActive }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    if (!item.megaMenu) {
      return (
        <Link
          href={item.href}
          className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
            isActive
              ? "text-white"
              : "text-slate-600 hover:text-orange-600 hover:bg-white"
          }`}
          prefetch={true}
        >
          {isActive && (
            <span
              className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-lg shadow-md`}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.label}
            {isActive && <Star size={11} className="fill-white text-white" />}
          </span>
        </Link>
      );
    }

    return (
      <div
        ref={ref}
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen(current => !current)}
          className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
            isActive
              ? "text-white"
              : "text-slate-600 hover:text-orange-600 hover:bg-white"
          }`}
          aria-expanded={open}
          aria-haspopup="true"
        >
          {isActive && (
            <span
              className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-lg shadow-md`}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.label}
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        <div
          className={`transition-all duration-200 ${
            open
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          }`}
        >
          {open && (
            <MegaMenuPanel
              data={item.megaMenu}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </div>
    );
  },
  (p, n) => p.isActive === n.isActive,
);
DesktopNavItem.displayName = "DesktopNavItem";

// ============================================
// Mobile Slide-In Panel
// ============================================
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  menuItems: MenuItem[];
  isActive: (path: string) => boolean;
  handleLogout: () => void;
  totalItems: number;
  wishlistCount: number;
  isCatalogMode: boolean;
  t: any;
}
const MobileMenu = memo<MobileMenuProps>(
  ({
    isOpen,
    onClose,
    user,
    isAdmin,
    menuItems,
    isActive,
    handleLogout,
    totalItems,
    wishlistCount,
    isCatalogMode,
    t,
  }) => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-from-right panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[220] flex h-[100dvh] max-h-[100dvh] w-[85vw] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        {user ? (
          <div className="flex-shrink-0 px-5 pt-12 pb-5 bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-black/10 rounded-full" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/20 transition-all"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl border-2 border-white/80 shadow-lg object-cover"
                  loading="lazy"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate">
                  {user.name}
                </p>
                <p className="text-white/75 text-xs truncate mt-0.5">
                  {user.email}
                </p>
                {user.isAffiliate && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold text-white">
                    <Sparkles size={10} /> Đối Tác
                  </span>
                )}
              </div>
            </div>
            {/* Quick stats */}
            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Yêu cầu", value: "12", href: "/profile?tab=orders" },
                {
                  label: "Yêu thích",
                  value: wishlistCount.toString(),
                  href: "/wishlist",
                },
                {
                  label: "Danh sách quan tâm",
                  value: totalItems.toString(),
                  href: "/cart",
                },
              ].filter((stat) => !isCatalogMode || stat.href !== "/cart").map((stat) => (
                <Link
                  key={stat.href}
                  href={stat.href}
                  onClick={onClose}
                  className="flex flex-col items-center py-2 px-1 bg-white/15 rounded-xl hover:bg-white/25 transition-colors"
                >
                  <span className="text-white font-bold text-base leading-none">
                    {stat.value}
                  </span>
                  <span className="text-white/75 text-[10px] mt-0.5">
                    {stat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 px-5 pt-12 pb-4 border-b border-slate-100">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-slate-900 text-lg">Xin chào!</p>
              <Hand size={18} className="text-amber-500" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Đăng nhập để trải nghiệm tốt hơn
            </p>
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm shadow-lg shadow-orange-200 active:scale-95 transition-all"
            >
              <UserIcon size={16} /> {t("nav.login")}
            </Link>
          </div>
        )}

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(6rem+env(safe-area-inset-bottom))] touch-pan-y">
          {/* Nav items */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Điều hướng
            </p>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-3.5 rounded-xl mb-0.5 transition-all duration-200 active:scale-[0.98] ${
                  isActive(item.href)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isActive(item.href) ? "bg-white/20" : `bg-${item.bg}-50`}`}
                  >
                    <item.icon
                      size={18}
                      className={
                        isActive(item.href)
                          ? "text-white"
                          : `text-${item.bg}-600`
                      }
                    />
                  </div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={
                    isActive(item.href) ? "text-white/60" : "text-slate-300"
                  }
                />
              </Link>
            ))}
            {user?.isAffiliate && (
              <Link
                href="/affiliate"
                onClick={onClose}
                className="flex items-center justify-between px-3.5 py-3.5 rounded-xl mb-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <span className="font-semibold text-sm">Kênh Đối Tác</span>
                </div>
                <ChevronRight size={16} className="text-white/60" />
              </Link>
            )}
          </div>

          {/* Quick links grid */}
          <div className="px-3 pt-1 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Nhanh
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  href: "/compare",
                  icon: Repeat,
                  label: "So sánh",
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  href: "/wishlist",
                  icon: Heart,
                  label: "Yêu thích",
                  color: "text-rose-500",
                  bg: "bg-rose-50",
                },
                {
                  href: "/profile?tab=notifications",
                  icon: Bell,
                  label: "Thông báo",
                  color: "text-orange-500",
                  bg: "bg-orange-50",
                },
	                {
	                  href: "/profile/downloads",
	                  icon: Download,
	                  label: "Mẫu đã cấp",
	                  color: "text-emerald-500",
	                  bg: "bg-emerald-50",
	                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors active:scale-90"
                >
                  <div
                    className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}
                  >
                    <item.icon size={20} className={item.color} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          {user && (
            <div className="px-3 pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Tài khoản
              </p>
              {[
                ...(isAdmin
                  ? [
                      {
                        href: "/admin",
                        icon: ShieldCheck,
                        label: t("nav.admin"),
                        color: "text-orange-600",
                        bg: "bg-orange-50",
                      },
                    ]
                  : []),
                {
                  href: "/profile",
                  icon: UserIcon,
                  label: t("nav.profile"),
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                },
                {
                  href: "/profile/orders",
                  icon: ShoppingBag,
                  label: "Yêu cầu",
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                },
                {
                  href: "/profile/settings",
                  icon: Settings,
                  label: "Cài đặt",
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                },
                {
                  href: "/faq",
                  icon: HelpCircle,
                  label: "Trợ giúp",
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] mb-0.5"
                >
                  <div
                    className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <item.icon size={16} className={item.color} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                  <ChevronRight size={14} className="ml-auto text-slate-300" />
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all active:scale-[0.98] mt-1"
              >
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut size={16} className="text-red-500" />
                </div>
                <span className="font-medium text-sm">{t("nav.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  ),
  (prev, next) =>
    prev.isOpen === next.isOpen &&
    prev.user === next.user &&
    prev.isAdmin === next.isAdmin,
);
MobileMenu.displayName = "MobileMenu";

// ============================================
// Navigation Progress Bar
// ============================================
const NavProgress = memo(() => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => setProgress(100), 300);
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 transition-all duration-300 ease-out rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
});
NavProgress.displayName = "NavProgress";

// ============================================
// User Dropdown (Desktop)
// ============================================
interface UserDropdownProps {
  user: any;
  isAdmin: boolean;
  handleLogout: () => void;
  t: any;
}
const UserDropdown = memo<UserDropdownProps>(
  ({ user, isAdmin, handleLogout, t }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;
      const h = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      const k = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", h);
      document.addEventListener("keydown", k);
      return () => {
        document.removeEventListener("mousedown", h);
        document.removeEventListener("keydown", k);
      };
    }, [open]);

    return (
      <div ref={ref} className="relative hidden lg:block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-white object-cover ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all shadow-sm"
              loading="lazy"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <span className="hidden xl:block text-sm font-semibold text-slate-700 max-w-[80px] truncate">
            {user.name}
          </span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`absolute right-0 w-64 mt-2 origin-top-right bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden transition-all duration-200 ${
            open
              ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
              : "opacity-0 pointer-events-none -translate-y-2 scale-95"
          }`}
        >
          <div className="px-4 py-4 bg-gradient-to-r from-orange-500 to-red-500 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="relative flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl border-2 border-white/60 object-cover shadow"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-white/75 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
              >
                <ShieldCheck size={16} className="text-orange-500" />{" "}
                {t("nav.admin")}
              </Link>
            )}
            {[
              { href: "/profile", icon: UserIcon, label: t("nav.profile") },
              { href: "/profile/orders", icon: ShoppingBag, label: "Yêu cầu" },
	              {
	                href: "/profile/downloads",
	                icon: Download,
	                label: "Mẫu đã cấp quyền",
	              },
              { href: "/profile/settings", icon: Settings, label: "Cài đặt" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
              >
                <item.icon size={16} className="text-slate-400" /> {item.label}
              </Link>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> {t("nav.logout")}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
UserDropdown.displayName = "UserDropdown";

// ============================================
// Global Styles
// ============================================
const AnimationStyles = memo(() => (
  <style jsx global>{`
    @keyframes gradient-x {
      0%,
      100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 3s ease infinite;
    }

    /* Announcement ticker — 4 copies, scroll 25% = 1 copy */
    @keyframes ticker-scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-25%);
      }
    }
    .announcement-ticker {
      animation: ticker-scroll 18s linear infinite;
      will-change: transform;
    }
    .announcement-ticker:hover {
      animation-play-state: paused;
    }

    /* Mega menu arrow notch */
    .mega-menu::before {
      content: "";
      position: absolute;
      top: -6px;
      left: 50%;
      width: 12px;
      height: 12px;
      background: white;
      border-left: 1px solid rgba(226, 232, 240, 0.8);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      transform: translateX(-50%) rotate(45deg);
    }

    /* Safe area for mobile bottom bar */
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
  `}</style>
));
AnimationStyles.displayName = "AnimationStyles";

// ============================================
// MAIN NAVBAR
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
  const { isCatalogMode } = useSiteMode();

  // ── Mega menu data ──
  const productsMega: MegaMenuData = useMemo(
    () => ({
      featured: [
        {
          label: "Themes & UI Kits",
          desc: "Giao diện chuyên nghiệp sẵn dùng",
          href: "/products?category=themes",
          icon: Palette,
          gradient: "from-orange-500 to-red-500",
        },
        {
          label: "Landing Pages",
          desc: "Template landing page cao chuyển đổi",
          href: "/products?category=landing",
          icon: LayoutTemplate,
          gradient: "from-red-500 to-rose-500",
        },
        {
          label: "Mini Apps & Tools",
          desc: "Công cụ tiện ích cho dự án của bạn",
          href: "/products?category=miniapps",
          icon: Code2,
          gradient: "from-violet-500 to-purple-500",
        },
      ],
      categories: [
        {
          label: "Figma & UI Kits",
          href: "/products?search=Figma",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
          color: "#f24e1e",
        },
        {
          label: "Vue.js",
          href: "/products?search=Vue",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
          color: "#42b883",
        },
        {
          label: "Marketing & SEO",
          href: "/products?category=marketing",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg",
          color: "#4285F4",
        },
        {
          label: "Canva Templates",
          href: "/products?search=Canva",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg",
          color: "#00c4cc",
        },
        {
          label: "HTML Templates",
          href: "/products?category=templates",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
          color: "#e34f26",
        },
        {
          label: "React / Next.js",
          href: "/products?category=react",
          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
          color: "#000000",
        },
      ],
      cta: {
        label: "Xem tất cả mẫu demo →",
        href: "/products",
        gradient: "from-orange-500/90 to-red-500/90",
      },
    }),
    [],
  );

  // ── Menu items ──
  const menuItems = useMemo<MenuItem[]>(
    () => [
      {
        href: "/",
        label: "Trang Chủ",
        icon: Home,
        gradient: "from-orange-600 to-red-600",
        bg: "orange",
      },
      {
        href: "/products",
        label: "Mẫu Demo",
        icon: Package,
        gradient: "from-red-600 to-rose-600",
        bg: "red",
        megaMenu: productsMega,
      },
      {
        href: "/ai-recommendation",
        label: "AI Tư Vấn",
        icon: Brain,
        gradient: "from-violet-600 to-purple-600",
        bg: "violet",
      },
      {
        href: "/blog",
        label: "Tin Tức",
        icon: Newspaper,
        gradient: "from-amber-600 to-orange-600",
        bg: "amber",
      },
      {
        href: "/community",
        label: "Cộng Đồng",
        icon: Users,
        gradient: "from-orange-500 to-amber-500",
        bg: "orange",
      },
    ],
    [productsMega],
  );

  // ── Scroll ──
  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);
  const throttledScroll = useThrottle(handleScroll, 80);
  useEffect(() => {
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [throttledScroll]);

  // ── Body overflow ──
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ── Close menu on route change ──
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // ── Callbacks ──
  const handleLogout = useCallback(() => {
    logout();
    setIsMenuOpen(false);
    router.push("/");
  }, [logout, router]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((p) => !p), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  return (
    <>
      <NavProgress />
      <AnnouncementBar />

      <TopBar
        scrolled={scrolled}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        unreadCount={unreadCount}
      />

      {/* ── Main nav ── */}
      <nav
        className={`sticky top-0 z-[100] isolate transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200/80"
            : "bg-white/92 backdrop-blur-xl shadow-sm border-b border-slate-200/60"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 lg:h-16 items-center gap-3">
            {/* ── Logo — luôn hiển thị tên trên mobile ── */}
            <Link
              href="/"
              className="group relative h-10 w-[150px] flex-shrink-0 sm:h-11 sm:w-[180px] lg:h-12 lg:w-[205px]"
              prefetch={true}
              aria-label="Web Giá Rẻ - Portfolio - Trang chủ"
            >
              <NextImage
                src="/logo_webgiare_display.webp"
                alt="Web Giá Rẻ - Portfolio"
                fill
                sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 205px"
                className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>

            {/* ── Desktop center menu ── */}
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-50/80 rounded-xl px-2 py-1.5 border border-slate-100/80 flex-1 justify-center max-w-fit">
              {menuItems.map((item) => (
                <DesktopNavItem
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                />
              ))}
              {user?.isAffiliate && (
                <Link
                  href="/affiliate"
                  className="relative px-3.5 py-2 rounded-lg text-sm font-bold overflow-hidden whitespace-nowrap ml-0.5"
                  prefetch={true}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 animate-gradient-x" />
                  <span className="relative z-10 flex items-center gap-1.5 text-white">
                    <Sparkles size={13} /> Đối Tác
                  </span>
                </Link>
              )}
            </div>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {/* Mobile utilities */}
              <div className="flex lg:hidden items-center gap-0.5 mr-0.5">
                <LanguageSwitcher />
              </div>

              {/* Search */}
              <button
                onClick={openSearch}
                className="p-2 lg:p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 active:scale-90"
                aria-label="Tìm kiếm"
              >
                <Search size={20} />
              </button>

              {/* Compare — desktop only */}
              <Link
                href="/compare"
                className="hidden lg:flex relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                aria-label={`So sánh (${compareList.length})`}
              >
                <Repeat size={20} />
                <Badge
                  count={compareList.length}
                  gradient="from-blue-500 to-cyan-500"
                />
              </Link>

              {/* Wishlist — desktop only */}
              <Link
                href="/wishlist"
                className="hidden lg:flex relative p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200"
                aria-label={`Yêu thích (${wishlist.length})`}
              >
                <Heart size={20} />
                <Badge
                  count={wishlist.length}
                  gradient="from-rose-500 to-pink-500"
                />
              </Link>

              {/* Cart — desktop only */}
              <Link
                href="/cart"
                className={`${isCatalogMode ? 'hidden' : 'hidden lg:flex'} relative p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200`}
                aria-label={`Danh sách quan tâm (${totalItems})`}
              >
                <ShoppingCart size={20} />
                <Badge
                  count={totalItems}
                  gradient="from-orange-600 to-red-600"
                />
              </Link>

              <div className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

              {/* Auth */}
              {user ? (
                <UserDropdown
                  user={user}
                  isAdmin={isAdmin}
                  handleLogout={handleLogout}
                  t={t}
                />
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-orange-300/50 hover:shadow-lg transition-all text-sm active:scale-95"
                  prefetch={true}
                >
                  <UserIcon size={15} /> {t("nav.login")}
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors ml-0.5 active:scale-90"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide panel */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        user={user}
        isAdmin={isAdmin}
        menuItems={menuItems}
        isActive={isActive}
        handleLogout={handleLogout}
        totalItems={totalItems}
        wishlistCount={wishlist.length}
        isCatalogMode={isCatalogMode}
        t={t}
      />

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <AnimationStyles />
    </>
  );
};

export default memo(Navbar);
