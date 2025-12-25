'use client';

import React, { useState } from 'react';
import { X, User, Phone, MapPin, Camera, Image, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export interface ProfileFormValues {
  name: string;
  avatar: string;
  cover?: string;
  phone?: string;
  address?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  values: ProfileFormValues;
  onChange: (values: ProfileFormValues) => void;
  onSubmit: () => void;
  saving: boolean;
  avatarChar: string;
}

export function ProfileEditForm({
  open,
  onClose,
  values,
  onChange,
  onSubmit,
  saving,
  avatarChar,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'avatar' | 'cover'>('avatar');

  if (!open) return null;

  const handleInput =
    (field: keyof ProfileFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({ ...values, [field]: e.target.value });
      };

  // Upload avatar
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Avatar upload error:', data.error);
        setUploading(false);
        return;
      }

      onChange({ ...values, avatar: data.url as string });
    } catch (err) {
      console.error('Avatar upload catch error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Upload cover
  const handleCoverFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/cover', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Cover upload error:', data.error);
        setUploading(false);
        return;
      }

      onChange({ ...values, cover: data.url as string });
    } catch (err) {
      console.error('Cover upload catch error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row animate-fade-in">

        {/* Left Panel - Orange Branding */}
        <div className="w-full md:w-2/5 bg-orange-600 p-6 md:p-8 text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] md:min-h-[500px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <img
                src="/favicon.png"
                alt="DigitalMart"
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />
            </div>

            <h3 className="text-xl md:text-2xl font-black text-center mb-2">
              Cập Nhật Hồ Sơ
            </h3>
            <p className="text-orange-100 text-sm text-center max-w-[200px]">
              Thông tin của bạn sẽ được hiển thị trên trang cá nhân
            </p>

            {/* Badge */}
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
              <User size={14} />
              <span>Hồ sơ cá nhân</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 relative">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
            <User size={12} />
            THÔNG TIN CÁ NHÂN
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Chỉnh Sửa Hồ Sơ
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Cập nhật thông tin cá nhân và ảnh đại diện của bạn
          </p>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {/* Avatar & Cover Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'avatar'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <Camera size={14} className="inline mr-2" />
                Ảnh đại diện
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cover')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'cover'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <Image size={14} className="inline mr-2" />
                Ảnh bìa
              </button>
            </div>

            {/* Avatar Section */}
            {activeTab === 'avatar' && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 overflow-hidden flex items-center justify-center text-xl font-black text-orange-600 border-2 border-orange-200">
                  {values.avatar ? (
                    <img
                      src={values.avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    avatarChar
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    {uploading ? 'Đang upload...' : 'PNG, JPG tối đa 2MB'}
                  </p>
                </div>
              </div>
            )}

            {/* Cover Section */}
            {activeTab === 'cover' && (
              <div className="p-4 bg-slate-50 rounded-2xl">
                {values.cover && (
                  <div className="w-full h-24 rounded-xl overflow-hidden mb-3">
                    <img
                      src={values.cover}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Khuyến nghị: 1200x400px
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <User size={14} className="text-orange-600" />
                Họ và tên
              </label>
              <input
                type="text"
                value={values.name}
                onChange={handleInput('name')}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                placeholder="Nhập họ và tên..."
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Phone size={14} className="text-orange-600" />
                Số điện thoại
              </label>
              <input
                type="text"
                value={values.phone ?? ''}
                onChange={handleInput('phone')}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                placeholder="Nhập số điện thoại..."
              />
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <MapPin size={14} className="text-orange-600" />
                Địa chỉ
              </label>
              <input
                type="text"
                value={values.address ?? ''}
                onChange={handleInput('address')}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                placeholder="Nhập địa chỉ..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
            >
              {saving || uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  Lưu Thay Đổi
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle size={14} className="text-green-500" />
                Bảo mật
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle size={14} className="text-green-500" />
                Riêng tư
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
