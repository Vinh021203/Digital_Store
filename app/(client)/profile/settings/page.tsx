'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Settings, User, Mail, Phone, Lock, Bell, Globe,
  Camera, Save, Loader2, Eye, EyeOff, Shield, Key,
  Moon, Sun, Palette, AlertTriangle, Check,
  MapPin, Home, ChevronRight, ArrowLeft, Sparkles
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { user, profile, updateProfile } = useSupabaseAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    email_orders: true,
    email_promo: true,
    email_news: false,
    push_orders: true,
  });
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      addToast('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      addToast('Mật khẩu không khớp', 'error');
      return;
    }
    if (formData.newPassword.length < 6) {
      addToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: formData.newPassword });
        if (error) throw error;
        addToast('Đổi mật khẩu thành công!', 'success');
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      addToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showUnavailableNotice = (feature: string) => {
    addToast(`${feature} đang được hoàn thiện. Vui lòng liên hệ hỗ trợ nếu bạn cần xử lý ngay.`, 'info');
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'security', label: 'Bảo mật', icon: Shield, color: 'from-orange-500 to-red-500' },
    { id: 'notifications', label: 'Thông báo', icon: Bell, color: 'from-purple-500 to-violet-500' },
    { id: 'appearance', label: 'Giao diện', icon: Palette, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Dark Premium Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-zinc-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
            <ChevronRight size={14} />
            <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">Cài đặt</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/30 border border-slate-600">
                <Settings size={28} className="text-white" />
              </div>
              <div>
                <span className="bg-slate-500/20 text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
                  <Sparkles size={10} className="inline mr-1" /> Account Settings
                </span>
                <h1 className="text-2xl md:text-3xl font-black">Cài đặt</h1>
                <p className="text-slate-400 text-sm">Quản lý thông tin và tùy chỉnh tài khoản</p>
              </div>
            </div>

            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
              <ArrowLeft size={16} />
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${activeTab === tab.id
              ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                <Camera size={16} className="text-orange-600" />
              </div>
              Ảnh đại diện
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-orange-100">
                  {profile?.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    profile?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => showUnavailableNotice('Tải ảnh đại diện')}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                  aria-label="Đổi ảnh đại diện"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="font-bold text-slate-900">{profile?.name || 'User'}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => showUnavailableNotice('Tải ảnh đại diện')}
                  className="text-orange-600 text-sm font-bold mt-2 hover:underline"
                >
                  Đổi ảnh đại diện
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              Thông tin cá nhân
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  <User size={14} className="inline mr-1.5 text-blue-500" />
                  Họ tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ tên..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  <Mail size={14} className="inline mr-1.5 text-purple-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  <Phone size={14} className="inline mr-1.5 text-green-500" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0xxx xxx xxx"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  <MapPin size={14} className="inline mr-1.5 text-red-500" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold mt-6 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                <Lock size={16} className="text-orange-600" />
              </div>
              Đổi mật khẩu
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="relative">
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading || !formData.newPassword}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Two Factor Auth */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                  <Shield size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Xác thực hai lớp (2FA)</h4>
                  <p className="text-sm text-slate-500">Tăng cường bảo mật tài khoản</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showUnavailableNotice('Xác thực hai lớp')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Kích hoạt
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900">Xóa tài khoản</h4>
                <p className="text-sm text-red-600">Hành động này không thể hoàn tác</p>
              </div>
              <button
                type="button"
                onClick={() => showUnavailableNotice('Xóa tài khoản')}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 transition-all"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-purple-600" />
            </div>
            Cài đặt thông báo
          </h3>

          <div className="space-y-4">
            {[
              { id: 'email_orders', label: 'Thông báo đơn hàng', desc: 'Nhận email khi có cập nhật đơn hàng', enabled: true, color: 'from-blue-500 to-cyan-500' },
              { id: 'email_promo', label: 'Khuyến mãi', desc: 'Nhận thông tin về ưu đãi và giảm giá', enabled: true, color: 'from-orange-500 to-amber-500' },
              { id: 'email_news', label: 'Bản tin', desc: 'Cập nhật sản phẩm mới và tin tức', enabled: false, color: 'from-purple-500 to-violet-500' },
              { id: 'push_orders', label: 'Push notification', desc: 'Thông báo trên trình duyệt', enabled: true, color: 'from-emerald-500 to-green-500' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationSettings[item.id]}
                  onClick={() => setNotificationSettings(current => ({
                    ...current,
                    [item.id]: !current[item.id],
                  }))}
                  className={`w-14 h-8 rounded-full flex items-center transition-all ${notificationSettings[item.id] ? `bg-gradient-to-r ${item.color} shadow-lg` : 'bg-slate-200'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform mx-1 ${notificationSettings[item.id] ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
              <Palette size={16} className="text-pink-600" />
            </div>
            Giao diện
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                setAppearance('light');
                addToast('Đã chọn giao diện sáng', 'success');
              }}
              className={`p-6 rounded-2xl text-center hover:shadow-xl transition-all ${appearance === 'light' ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50' : 'border border-slate-200'}`}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
                <Sun size={28} className="text-white" />
              </div>
              <p className="font-bold text-slate-900">Sáng</p>
              <div className="mt-2">
                {appearance === 'light' && <Check size={18} className="mx-auto text-orange-600" />}
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setAppearance('dark');
                addToast('Đã lưu lựa chọn giao diện tối. Chế độ này sẽ được áp dụng ở bản cập nhật tiếp theo.', 'info');
              }}
              className={`p-6 rounded-2xl text-center hover:shadow-lg transition-all ${appearance === 'dark' ? 'border-2 border-orange-500 bg-orange-50' : 'border border-slate-200 hover:border-slate-400'}`}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Moon size={28} className="text-white" />
              </div>
              <p className="font-bold text-slate-900">Tối</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setAppearance('system');
                addToast('Đã lưu lựa chọn theo giao diện hệ thống.', 'info');
              }}
              className={`p-6 rounded-2xl text-center hover:shadow-lg transition-all ${appearance === 'system' ? 'border-2 border-orange-500 bg-orange-50' : 'border border-slate-200 hover:border-slate-400'}`}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Globe size={28} className="text-white" />
              </div>
              <p className="font-bold text-slate-900">Hệ thống</p>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Ngôn ngữ</h4>
            <select className="w-full md:w-64 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
