'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  Camera,
  BookOpen,
  Settings,
  Award,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Globe,
  Bell,
  Mail,
  Star,
  Trophy,
  Edit2,
  Share2,
  MoreVertical,
  Zap,
  Target,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ProfileEditForm,
  ProfileFormValues,
} from '@/components/forms/ProfileEditForm';
import { getProfileStats, type ProfileStats } from '@/lib/profileStats';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth(); // 👈 dùng isLoading để tránh redirect sớm
  const { addToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [showMenu, setShowMenu] = useState(false);

  // ==== state cho modal edit profile ====
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    name: user?.name || '',
    avatar: user?.avatar || '',
    cover: user?.cover_image || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profileTextColor: user?.profile_text_color || '#0f172a',
  });

  // Real stats from database - MUST be before any early return
  const [stats, setStats] = useState<ProfileStats & { rank: string }>({
    downloads: 0,
    licenses: 0,
    totalSpent: 0,
    activeProducts: 0,
    supportTickets: 0,
    wishlistItems: 0,
    reviewsGiven: 0,
    rank: 'Member',
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real stats
  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    setStatsLoading(true);
    try {
      const data = await getProfileStats(user.id);
      // Determine rank based on total spent
      let rank = 'Member';
      if (data.totalSpent >= 10000000) rank = 'Diamond';
      else if (data.totalSpent >= 5000000) rank = 'Platinum';
      else if (data.totalSpent >= 2000000) rank = 'Gold';
      else if (data.totalSpent >= 500000) rank = 'Silver';
      else if (data.licenses >= 3) rank = 'VIP Member';

      setStats({ ...data, rank });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id]);

  // đồng bộ form mỗi khi user (từ context) thay đổi
  useEffect(() => {
    if (!user) return;
    setFormValues({
      name: user.name,
      avatar: user.avatar,
      cover: user.cover_image || '',
      phone: user.phone || '',
      address: user.address || '',
      profileTextColor: user.profile_text_color || '#0f172a',
    });
  }, [user?.id, user?.avatar, user?.cover_image, user?.phone, user?.address, user?.profile_text_color]);

  // tránh bị push /login khi auth còn đang load
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Early return AFTER all hooks
  if (isLoading || !user) {
    return null;
  }

  const avatarChar =
    user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';

  const tabs = [
    { id: '/profile', icon: TrendingUp, label: 'Tổng Quan', badge: null },
    {
      id: '/profile/downloads',
      icon: BookOpen,
      label: 'Downloads',
      badge: stats.downloads > 0 ? stats.downloads : null,
    },
    {
      id: '/profile/licenses',
      icon: Award,
      label: 'Licenses',
      badge: stats.licenses > 0 ? stats.licenses : null,
    },
    { id: '/profile/community', icon: Bell, label: 'Bài Viết', badge: null },
    {
      id: '/profile/support',
      icon: Trophy,
      label: 'Hỗ Trợ',
      badge: stats.supportTickets > 0 ? stats.supportTickets : null,
    },
    ...(user.isAffiliate
      ? [
        {
          id: '/profile/affiliate',
          icon: Globe,
          label: 'Đối Tác',
          badge: 'HOT',
        },
      ]
      : []),
    { id: '/profile/orders', icon: CreditCard, label: 'Đơn Hàng', badge: null },
    { id: '/profile/settings', icon: Settings, label: 'Cài Đặt', badge: null },
  ];

  const isActive = (path: string) => pathname === path;

  const handleAvatarUpload = () => {
    setEditOpen(true);
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${user.name} - Shop Web rẻ Profile`,
          text: `Xem hồ sơ học tập của ${user.name} trên Shop Web rẻ`,
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('📋 Đã sao chép link profile!', 'success');
    }
  };

  const NavItem = ({ href, icon: Icon, label, badge }: any) => (
    <Link
      href={href}
      className={`group w-full flex items-center justify-between px-5 lg:px-6 py-3.5 lg:py-4 text-sm font-bold transition-all border-l-4 ${isActive(href)
        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border-orange-600 shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent hover:border-slate-200'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={`${isActive(href) ? 'text-orange-600' : 'group-hover:text-orange-600'
            } transition-colors`}
        />
        {label}
      </div>
      {badge && (
        <span
          className={`${badge === 'HOT'
            ? 'bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse'
            : 'bg-orange-600'
            } text-white text-[10px] px-2 py-0.5 rounded-full font-black`}
        >
          {badge}
        </span>
      )}
    </Link>
  );

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      addToast('Supabase chưa sẵn sàng', 'error');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formValues.name,
          avatar: formValues.avatar,
	          cover_image: formValues.cover,
	          phone: formValues.phone,
	          address: formValues.address,
	          profile_text_color: formValues.profileTextColor || '#0f172a',
	        })
        .eq('id', user.id);

      if (error) {
        addToast('Cập nhật hồ sơ thất bại', 'error');
      } else {
        addToast('Đã lưu hồ sơ', 'success');
        setEditOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

	  const profileTextColor = formValues.profileTextColor || '#0f172a';

	  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 font-sans text-slate-800 pb-20 lg:pb-0 animate-fade-in">
      {/* Premium Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        {/* Cover Photo - thumbnail + tối ưu */}
        <div className="relative h-32 md:h-48 lg:h-56 overflow-hidden bg-slate-900">
          {formValues.cover ? (
            <Image
              src={formValues.cover}
              alt="Cover"
              fill
              className="object-cover"
              sizes="100vw"
              priority={false} // để Next tự lazy-load, nhẹ hơn [web:150][web:176]
              quality={80}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-600 via-red-600 to-amber-600">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
            </div>
          )}

          {/* overlay tối cho chữ/avatar nổi hơn */}
          <div className="absolute inset-0 bg-black/35" />

          {/* dải gradient chân như thumbnail */}
          <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Edit Cover Button - Desktop */}
          <button
            onClick={() => setEditOpen(true)}
            className="hidden lg:flex absolute top-4 right-4 items-center gap-2 bg-white/90 text-slate-700 px-4 py-2 rounded-xl hover:bg-white transition-all text-sm font-bold shadow-lg z-10"
          >
            <Camera size={16} />
            Đổi ảnh bìa
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 lg:pb-6">
          <div className="relative -mt-12 md:-mt-16 lg:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
            {/* Avatar with Upload */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl lg:rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                {formValues.avatar || user.avatar ? (
                  <Image
                    src={formValues.avatar || user.avatar}
                    alt={user.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    quality={85}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 flex items-center justify-center text-white text-3xl md:text-4xl lg:text-5xl font-black">
                    {avatarChar}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 p-2 lg:p-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 transition-all shadow-lg lg:opacity-0 group-hover:opacity-100"
              >
                <Camera size={14} className="lg:w-5 lg:h-5" />
              </button>

              {/* Online Status */}
              <div className="absolute top-1 right-1 lg:top-2 lg:right-2 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 border-2 border-white rounded-full shadow-lg" />
            </div>

            {/* User Info & Actions */}
            <div className="flex-1 mb-2 w-full md:w-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3 md:gap-4">
	                <div>
	                  <h1
	                    className="text-2xl md:text-3xl lg:text-4xl font-black flex flex-col md:flex-row items-center gap-2 mb-1"
	                    style={{ color: profileTextColor }}
	                  >
	                    {user.name}
                    {user.isAffiliate && (
                      <span
                        className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                        title="Đối tác Affiliate"
                      >
                        <Globe size={14} />
                        Đối tác
                      </span>
                    )}
	                    <button
	                      onClick={() => setEditOpen(true)}
	                      className="opacity-75 transition-colors hover:text-orange-600 hover:opacity-100"
	                    >
                      <Edit2 size={18} className="lg:w-5 lg:h-5" />
                    </button>
                  </h1>

	                  <div
	                    className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 text-sm"
	                    style={{ color: profileTextColor }}
	                  >
	                    <span className="hidden lg:inline opacity-85">{user.email}</span>
	                    <span className="hidden lg:inline w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: profileTextColor }} />
                    <span className="inline-flex items-center gap-1.5 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg text-xs uppercase">
                      <ShieldCheck size={14} />
                      {user.role === 'admin'
                        ? 'Quản trị viên'
                        : user.isAffiliate
                          ? 'Đối Tác'
                          : stats.rank}
                    </span>
	                    <span className="hidden md:inline w-1 h-1 rounded-full opacity-60" style={{ backgroundColor: profileTextColor }} />
	                    <span className="inline-flex items-center gap-1 text-xs opacity-85">
                      <Calendar size={12} />
                      Tham gia 2024
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Desktop */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={handleShareProfile}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all text-sm font-bold"
                  >
                    <Share2 size={16} />
                    Chia sẻ
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                        <button
                          onClick={() => {
                            addToast('📝 Tính năng đang phát triển!', 'info');
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Báo cáo vấn đề
                        </button>
                        <button
                          onClick={() => {
                            addToast('💬 Tính năng đang phát triển!', 'info');
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Trợ giúp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Bar - Desktop */}
              <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4 mt-6">
                {[
                  {
                    icon: BookOpen,
                    label: 'Downloads',
                    value: stats.downloads,
                    bgColor: 'bg-orange-500',
                  },
                  {
                    icon: Award,
                    label: 'Licenses',
                    value: stats.licenses,
                    bgColor: 'bg-amber-500',
                  },
                  {
                    icon: Zap,
                    label: 'Sản phẩm',
                    value: stats.activeProducts,
                    bgColor: 'bg-cyan-500',
                  },
                  {
                    icon: Target,
                    label: 'Wishlist',
                    value: stats.wishlistItems,
                    bgColor: 'bg-pink-500',
                  },
                  {
                    icon: Trophy,
                    label: 'Reviews',
                    value: stats.reviewsGiven,
                    bgColor: 'bg-rose-500',
                  },
                  {
                    icon: Star,
                    label: 'Tickets',
                    value: stats.supportTickets,
                    bgColor: 'bg-amber-400',
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 lg:p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm`}
                    >
                      <stat.icon
                        size={24}
                        className="text-white lg:w-7 lg:h-7"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-xs lg:text-sm text-slate-500 font-semibold mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden grid grid-cols-4 border-t border-slate-200 bg-white mt-4">
            {[
              { icon: BookOpen, value: stats.downloads, label: 'Downloads', color: 'text-blue-600' },
              { icon: Award, value: stats.licenses, label: 'Licenses', color: 'text-amber-600' },
              { icon: Zap, value: stats.activeProducts, label: 'Products', color: 'text-cyan-600' },
              { icon: Trophy, value: stats.wishlistItems, label: 'Wishlist', color: 'text-pink-600' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center py-4 border-r border-slate-100 last:border-0"
              >
                <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-2`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className="font-black text-slate-900 text-lg">
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Navigation */}
          <div className="lg:hidden border-t border-slate-100 overflow-x-auto scrollbar-hide bg-white sticky top-16 md:top-20 z-20 shadow-sm">
            <div className="flex px-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.id}
                  className={`flex items-center gap-2 px-4 py-3 text-xs lg:text-sm font-bold whitespace-nowrap border-b-2 transition-colors relative ${isActive(tab.id)
                    ? 'border-orange-600 text-orange-700 bg-orange-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <tab.icon size={16} /> {tab.label}
                  {tab.badge && (
                    <span
                      className={`${tab.badge === 'HOT'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse'
                        : 'bg-orange-600'
                        } text-white text-[8px] px-1.5 py-0.5 rounded-full font-black`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Link>
              ))}
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-rose-500 whitespace-nowrap hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} /> Thoát
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              {/* Quick Actions */}
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-b border-orange-100">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
                  Thao tác nhanh
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      addToast('🔔 Tính năng đang phát triển!', 'info')
                    }
                    className="flex flex-col items-center gap-1 bg-white hover:bg-orange-50 p-3 rounded-xl transition-all text-center group"
                  >
                    <Bell
                      size={18}
                      className="text-orange-600 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[10px] font-bold text-slate-600">
                      Thông báo
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      addToast('💬 Tính năng đang phát triển!', 'info')
                    }
                    className="flex flex-col items-center gap-1 bg-white hover:bg-orange-50 p-3 rounded-xl transition-all text-center group"
                  >
                    <Mail
                      size={18}
                      className="text-orange-600 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-[10px] font-bold text-slate-600">
                      Tin nhắn
                    </span>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="py-2">
                {tabs.map((tab) => (
                  <NavItem
                    key={tab.id}
                    href={tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    badge={tab.badge}
                  />
                ))}
              </div>

              <div className="border-t border-slate-100 my-2" />

              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={20} /> Đăng Xuất
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Modal Edit Profile */}
      <ProfileEditForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSaveProfile}
        saving={saving}
        avatarChar={avatarChar}
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
