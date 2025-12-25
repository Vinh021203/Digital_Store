'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Chrome,
  Github,
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/');

  const { signIn, signInWithGoogle, signInWithGithub } = useSupabaseAuth();
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) setRedirectTo(redirect);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await signIn(email, password);

      if (authError) {
        const msg = authError.message || '';
        const lower = msg.toLowerCase();

        if (lower.includes('invalid login credentials')) {
          setError('Email hoặc mật khẩu không đúng');
        } else if (lower.includes('email not confirmed')) {
          setError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư và nhập mã OTP.');
          addToast(
            'Email chưa xác nhận. Kiểm tra email để lấy mã OTP và xác minh tài khoản.',
            'warning',
          );
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          setError(msg || 'Đăng nhập thất bại');
        }
      } else {
        addToast('Đăng nhập thành công!', 'success');
        router.push(redirectTo);
      }
    } catch {
      setError('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await signInWithGithub();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@example.com');
    setPassword('password123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@homelife.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans text-slate-800">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative animate-fade-in bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              <Sparkles size={14} /> Chào mừng trở lại
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Đăng Nhập</h1>
            <p className="text-slate-500">Truy cập thư viện sản phẩm số của bạn</p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50"
            >
              <Chrome size={18} className="text-blue-500" /> Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-orange-200 transition-all shadow-sm disabled:opacity-50"
            >
              <Github size={18} /> GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 font-medium">hoặc với Email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 flex items-center gap-3 animate-fade-in rounded-r-xl">
                <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Mật khẩu</label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-bold text-orange-600 hover:text-orange-500 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-200 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 hover:shadow-orange-300"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng Nhập <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400 font-medium">Demo Accounts</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fillDemoUser}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
              >
                <User size={16} /> User
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all"
              >
                <ShieldCheck size={16} /> Admin
              </button>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="font-bold text-orange-600 hover:text-orange-500 hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80"
          alt="Digital Products"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-slate-900/70 to-slate-900/40 flex flex-col justify-end p-16">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <p className="text-3xl font-black text-white">1000+</p>
              <p className="text-orange-200 text-sm font-medium">Sản Phẩm</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">50K+</p>
              <p className="text-orange-200 text-sm font-medium">Downloads</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">4.9</p>
              <p className="text-orange-200 text-sm font-medium">Rating</p>
            </div>
          </div>

          <blockquote className="space-y-4">
            <p className="text-2xl font-bold text-white leading-relaxed">
              "Nền tảng tuyệt vời để tìm themes và templates chất lượng cao. Tiết kiệm rất nhiều thời gian!"
            </p>
            <footer className="flex items-center gap-4">
              <img
                src="https://i.pravatar.cc/48?img=32"
                alt=""
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-white font-bold">Nguyễn Văn A</p>
                <p className="text-orange-200 text-sm">Frontend Developer</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
