'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/context/ToastContext';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const router = useRouter();
  const { addToast } = useToast();
  const supabase = getSupabaseClient();

  // Get email from URL on mount
  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email') || '';
    setEmail(decodeURIComponent(emailParam));
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user is already verified (polling)
  useEffect(() => {
    if (!mounted || !supabase) return;

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          addToast('Email đã được xác nhận!', 'success');
          router.push('/');
        }
      } catch { }
    };

    checkUser();
    const interval = setInterval(checkUser, 3000);
    return () => clearInterval(interval);
  }, [mounted, supabase, router, addToast]);

  // Resend confirm email (Supabase OTP email)
  const handleResend = async () => {
    if (countdown > 0 || !email || !supabase) return;

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Đã gửi lại email xác nhận!', 'success');
        setCountdown(60);
      }
    } catch {
      addToast('Không thể gửi lại email.', 'error');
    } finally {
      setResending(false);
    }
  };

  // OTP input handlers (support paste 8 số)
  const handleChangeOtp = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length > 1) {
      const next = Array(8).fill('');
      for (let i = 0; i < Math.min(8, digits.length); i++) {
        next[i] = digits[i];
      }
      setOtp(next);
      setVerifyError(null);
      return;
    }

    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setVerifyError(null);
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 8 || !email) {
      setVerifyError('Vui lòng nhập đủ 8 số.');
      return;
    }

    if (!supabase) {
      setVerifyError('Supabase chưa được cấu hình.');
      return;
    }

    setVerifying(true);
    setVerifyError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup', // OTP cho đăng ký
      });

      if (error) {
        setVerifyError(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        addToast(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.', 'error');
        return;
      }

      // verify thành công -> Supabase tạo session
      addToast('Xác nhận email thành công!', 'success');
      router.push('/');
    } catch {
      setVerifyError('Không thể xác thực OTP.');
      addToast('Không thể xác thực OTP.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Show loading while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden font-sans text-slate-800">
      {/* Left Column - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Back Button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Quay lại đăng ký</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              <Sparkles size={14} /> Kiểm tra email
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">Xác Nhận Email</h1>
            <p className="text-slate-500">
              Chúng tôi đã gửi mã xác nhận đến{' '}
              <span className="font-bold text-slate-700">{email || 'email của bạn'}</span>
            </p>
          </div>

          {/* Email Icon Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-orange-100 rounded-3xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Mail className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          {/* OTP input */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-3">
              Nhập mã OTP gồm 8 số trong email:
            </p>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={digit}
                  onChange={(e) => handleChangeOtp(idx, e.target.value)}
                  className="w-10 h-12 text-center text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ))}
            </div>
            {verifyError && (
              <p className="mt-2 text-sm text-red-500">{verifyError}</p>
            )}
            <button
              onClick={handleVerifyOtp}
              disabled={verifying}
              className="mt-4 w-full h-11 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
            >
              {verifying ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 mb-6 border border-orange-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-orange-600" />
              Các bước tiếp theo:
            </h3>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Mở hộp thư email của bạn</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Tìm email từ <strong>Shop Web rẻ</strong> (kiểm tra cả Spam)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Nhập mã <strong>OTP 8 số</strong> vào ô phía trên</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <CheckCircle size={14} />
                </span>
                <span>Hoàn tất xác nhận và đăng nhập</span>
              </li>
            </ol>
          </div>

          {/* Auto-check indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
            <RefreshCw size={14} className="animate-spin" />
            <span>Đang chờ xác nhận...</span>
          </div>

          {/* Resend Button */}
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-2">Không nhận được email?</p>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className={`font-bold text-sm transition-colors ${
                countdown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-orange-600 hover:text-orange-700'
              }`}
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </span>
              ) : countdown > 0 ? (
                `Gửi lại sau ${countdown}s`
              ) : (
                'Gửi lại email xác nhận'
              )}
            </button>
          </div>

          {/* Help text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              💡 <strong>Lưu ý:</strong> Mã có hiệu lực 60 phút. Trang tự động chuyển hướng sau khi xác nhận.
            </p>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Đã xác nhận?{' '}
            <Link href="/login" className="font-bold text-orange-600 hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80"
          alt="Email Verification"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-slate-900/70 to-slate-900/40 flex flex-col justify-center items-center p-16">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              Bảo Mật Tài Khoản
            </h2>
            <p className="text-white/80 text-lg">
              Xác nhận email giúp bảo vệ tài khoản và đảm bảo bạn có thể khôi phục mật khẩu khi cần.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
