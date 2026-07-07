'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const supabase = (await import('@/lib/supabase/client')).getSupabaseClient();
      if (!supabase) {
        setError('Supabase chưa được cấu hình');
        setLoading(false);
        return;
      }

      // 1) Đổi code trong URL thành session hợp lệ
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError(exchangeError.message || 'Không thể xác thực phiên đặt lại mật khẩu');
        setLoading(false);
        return;
      }

      // 2) Cập nhật mật khẩu mới
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message || 'Không thể cập nhật mật khẩu');
      } else {
        addToast('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
        router.push('/login');
      }
    } catch {
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans text-slate-800">
      {/* Left column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-white relative animate-fade-in">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              <Sparkles size={14} /> Đặt lại mật khẩu
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Tạo mật khẩu mới
            </h1>
            <p className="text-slate-500">
              Nhập mật khẩu mới cho tài khoản Web Giá Rẻ - Portfolio của bạn để tiếp tục sử dụng an toàn.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-5 flex items-center gap-3 rounded-r-xl animate-fade-in">
              <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Security tip */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
            <div className="mt-1">
              <ShieldCheck className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                Gợi ý bảo mật
              </p>
              <p className="text-xs text-slate-500">
                Sử dụng mật khẩu dài trên 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                để bảo vệ tài khoản tốt hơn.
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white transition-all"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-200 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  Cập nhật mật khẩu <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right column - Image / stats / quote */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
          alt="Security"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/75 to-slate-900/40 flex flex-col justify-end p-16">
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <p className="text-3xl font-black text-white">24/7</p>
              <p className="text-orange-200 text-sm font-medium">Bảo mật</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">99.9%</p>
              <p className="text-orange-200 text-sm font-medium">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">AES</p>
              <p className="text-orange-200 text-sm font-medium">Mã hóa</p>
            </div>
          </div>

          <blockquote className="space-y-4">
            <p className="text-2xl font-bold text-white leading-relaxed">
              "Việc đặt lại mật khẩu chỉ mất vài giây, nhưng giúp bảo vệ toàn bộ tài sản số của bạn
              trên Web Giá Rẻ - Portfolio."
            </p>
            <footer className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/48?img=15"
                alt=""
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-white font-bold">Lê Hoàng C</p>
                <p className="text-orange-200 text-sm">Security Engineer</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
