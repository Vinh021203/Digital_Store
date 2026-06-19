'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const { resetPassword } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      setLoading(false);
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message || 'Không gửi được email đặt lại mật khẩu');
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    addToast('Email đặt lại mật khẩu đã được gửi!', 'success');
  };

  const SuccessView = () => (
    <div className="max-w-md w-full mx-auto animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>

      <h1 className="text-3xl font-black text-slate-900 mb-4 text-center">Kiểm tra Email!</h1>
      <p className="text-slate-500 mb-6 text-center">
        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
        <strong className="text-slate-900">{email}</strong>
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
        <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
          <Shield size={16} /> Lưu ý bảo mật
        </h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Link có hiệu lực trong 15 phút</li>
          <li>• Kiểm tra thư mục Spam nếu không thấy email</li>
          <li>• Không chia sẻ link với người khác</li>
        </ul>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Gửi lại Email
        </button>
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all"
        >
          <ArrowLeft size={18} /> Quay lại Đăng Nhập
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex overflow-hidden font-sans text-slate-800">
      {/* Left column: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative animate-fade-in bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
              <Sparkles size={14} /> Khôi phục tài khoản
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Quên Mật Khẩu?</h1>
            <p className="text-slate-500">
              Nhập email đã đăng ký và chúng tôi sẽ gửi link để đặt lại mật khẩu.
            </p>
          </div>

          {success ? (
            <SuccessView />
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
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
                      className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 focus:bg-white"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-200 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi Link Đặt Lại <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-bold transition-colors"
                >
                  <ArrowLeft size={18} /> Quay lại Đăng Nhập
                </Link>
              </div>

              {/* Help */}
              <div className="mt-8 p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-sm text-slate-500">
                  Vẫn gặp vấn đề?{' '}
                  <Link href="/contact" className="text-orange-600 font-bold hover:underline">
                    Liên hệ hỗ trợ
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right column: image + quote (reuse style của login/register) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80"
          alt="Shop Web rẻ"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-slate-900/70 to-slate-900/40 flex flex-col justify-end p-16">
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
              "Bảo mật tài khoản luôn là ưu tiên hàng đầu. Shop Web rẻ giúp việc khôi phục mật khẩu trở nên
              đơn giản và an toàn."
            </p>
            <footer className="flex items-center gap-4">
              <img
                src="https://res.cloudinary.com/dsdwhh7eu/image/upload/v1764469468/avatars/ddifmxn36ltzom9istep.jpg"
                alt=""
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-white font-bold">Lương Thế Vinh</p>
                <p className="text-orange-200 text-sm">Product Designer</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
