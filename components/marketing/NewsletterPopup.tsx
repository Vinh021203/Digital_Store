'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { X, BookOpen, ArrowRight, Sparkles, Gift, CheckCircle } from 'lucide-react';

// ============================================
// Local Storage Key
// ============================================
const STORAGE_KEY = 'DigitalMart_newsletter_seen';
const POPUP_DELAY = 5000; // 5 seconds

// ============================================
// Success Animation Component
// ============================================
const SuccessAnimation = memo(() => (
  <div className="text-center py-8 sm:py-10 relative z-10">
    {/* Success Icon */}
    <div className="relative inline-block mb-6">
      {/* Animated rings */}
      <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 animate-ping" />
      <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-30 animate-pulse" />

      {/* Icon container */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-300 animate-bounce-in">
        <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
        <Sparkles
          size={20}
          className="absolute -top-2 -right-2 text-amber-400 animate-spin-slow"
        />
      </div>
    </div>

    {/* Success Message */}
    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      Đăng ký thành công! 🎉
    </h3>
    <p className="text-slate-600 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      Ebook đã được gửi vào email. Mã giảm giá của bạn:
    </p>

    {/* Coupon Code */}
    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl blur-lg opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-5 rounded-xl border-2 border-dashed border-orange-300 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Gift size={20} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Mã giảm giá 20%</span>
          </div>
          <div className="font-mono font-bold text-2xl sm:text-3xl text-slate-900 select-all tracking-wider">
            BOOK20
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4">Click để copy • Áp dụng cho đơn hàng đầu tiên</p>
    </div>
  </div>
));

SuccessAnimation.displayName = 'SuccessAnimation';

// ============================================
// Main Component
// ============================================
const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ============================================
  // Check if popup should show
  // ============================================
  useEffect(() => {
    setIsHydrated(true);

    if (typeof window !== 'undefined') {
      const hasSeenPopup = localStorage.getItem(STORAGE_KEY);

      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, POPUP_DELAY);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  // ============================================
  // Close Handler with Animation
  // ============================================
  const handleClose = useCallback(() => {
    setIsClosing(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    }, 300);
  }, []);

  // ============================================
  // Submit Handler
  // ============================================
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (email) {
      setSubmitted(true);

      // Close after 5 seconds
      setTimeout(() => {
        handleClose();
      }, 5000);
    }
  }, [email, handleClose]);

  // ============================================
  // Prevent body scroll when open
  // ============================================
  useEffect(() => {
    if (isOpen && !isClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isClosing]);

  // ============================================
  // ESC key handler
  // ============================================
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isHydrated || !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/70 backdrop-blur-md transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
    >
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row relative transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/90 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all duration-200 z-10 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 group"
          aria-label="Close popup"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Image Side - Desktop Only */}
        <div className="hidden md:block w-full md:w-1/2 relative overflow-hidden">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            alt="Newsletter Background"
            className="w-full h-full object-cover scale-110 animate-ken-burns"
            loading="eager"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-red-600/80 to-amber-600/90" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-40 -mb-40 animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
            {/* Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                <BookOpen size={36} className="text-orange-600" strokeWidth={2.5} />
              </div>
              <Sparkles
                size={16}
                className="absolute -top-2 -right-2 text-amber-400 animate-spin-slow"
              />
            </div>

            {/* Text */}
            <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">Tặng Sách Miễn Phí</h3>
            <p className="text-lg opacity-95 mb-4">Ebook: Kỹ Năng Tự Học Vượt Trội</p>
            <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Gift size={16} />
              <span>+ Mã giảm giá 20%</span>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white relative">
          {/* Mobile Image Header */}
          <div className="md:hidden mb-6 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 relative h-32 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
              alt="Newsletter"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-600/80 to-red-600/80 flex items-center justify-center">
              <div className="text-white text-center">
                <BookOpen size={32} className="mx-auto mb-2" />
                <p className="font-bold text-lg">Tặng Ebook Miễn Phí</p>
              </div>
            </div>
          </div>

          {!submitted ? (
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full px-4 py-2 mb-4">
                <Gift size={14} className="text-orange-600" />
                <span className="text-orange-700 font-bold tracking-wide text-xs uppercase">Quà tặng tri thức</span>
              </div>

              {/* Title */}
              <h2 id="newsletter-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                Nhận Ebook Hay <BookOpen size={32} className="text-orange-600 inline" />
              </h2>

              {/* Description */}
              <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Để lại email để nhận ngay cuốn Ebook <strong className="text-orange-700">"Kỹ Năng Tự Học Vượt Trội"</strong> và mã giảm giá <strong className="text-amber-700">20%</strong> cho đơn hàng đầu tiên.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn..."
                    className="w-full border-2 border-slate-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 flex items-center justify-center gap-2 text-sm sm:text-base group active:scale-95"
                >
                  <Gift size={18} className="group-hover:rotate-12 transition-transform" />
                  Nhận Ebook Ngay
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-orange-600" />
                  <span>Miễn phí 100%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-orange-600" />
                  <span>Không spam</span>
                </div>
              </div>
            </div>
          ) : (
            <SuccessAnimation />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ken-burns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default memo(NewsletterPopup);
