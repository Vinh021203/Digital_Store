'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Gift, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'shopwebre_newsletter_seen';
const POPUP_DELAY = 5000;

const SuccessAnimation = memo(() => (
  <div className="relative z-10 py-8 text-center sm:py-10">
    <div className="relative mb-6 inline-block">
      <div className="absolute inset-0 -m-4 animate-ping rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20" />
      <div className="absolute inset-0 -m-2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-30" />
      <div className="relative flex h-20 w-20 animate-bounce-in items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl shadow-orange-300 sm:h-24 sm:w-24">
        <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
        <Sparkles size={20} className="absolute -right-2 -top-2 animate-spin-slow text-amber-400" />
      </div>
    </div>

    <h3 className="mb-3 animate-fade-in-up text-2xl font-bold text-slate-900 sm:text-3xl" style={{ animationDelay: '0.1s' }}>
      Đăng ký thành công!
    </h3>
    <p className="mb-6 animate-fade-in-up text-slate-600" style={{ animationDelay: '0.2s' }}>
      Ebook đã được gửi vào email. Mã ưu đãi của bạn:
    </p>

    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="relative inline-block">
        <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-30 blur-lg" />
        <div className="relative rounded-xl border-2 border-dashed border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 p-4 shadow-lg sm:p-5">
          <div className="mb-2 flex items-center gap-3">
            <Gift size={20} className="text-orange-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Mã ưu đãi 20%</span>
          </div>
          <div className="select-all font-mono text-2xl font-bold tracking-wider text-slate-900 sm:text-3xl">
            BOOK20
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">Click để copy, áp dụng cho lần tư vấn đầu tiên.</p>
    </div>
  </div>
));

SuccessAnimation.displayName = 'SuccessAnimation';

const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const hasSeenPopup = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenPopup) {
      const timer = window.setTimeout(() => setIsOpen(true), POPUP_DELAY);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);

    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      localStorage.setItem(STORAGE_KEY, 'true');
    }, 300);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (email) {
        setSubmitted(true);
        window.setTimeout(handleClose, 5000);
      }
    },
    [email, handleClose]
  );

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose, isOpen]);

  if (!isHydrated || !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-md transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-title"
    >
      <div
        className={`relative flex w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 sm:rounded-3xl md:flex-row ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="group absolute right-3 top-3 z-10 rounded-xl bg-white/90 p-2 text-slate-400 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500 hover:shadow-xl active:scale-95 sm:right-4 sm:top-4"
          aria-label="Đóng popup"
          type="button"
        >
          <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
        </button>

        <div className="relative hidden w-full overflow-hidden md:block md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            alt="Ebook và tài nguyên học tập"
            className="h-full w-full animate-ken-burns object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-red-600/80 to-amber-600/90" />
          <div className="absolute -right-32 -top-32 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-white/10 blur-3xl" style={{ animationDelay: '1s' }} />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse rounded-3xl bg-white/30 blur-xl" />
              <div className="relative flex h-20 w-20 animate-bounce-slow items-center justify-center rounded-3xl bg-white p-3 shadow-2xl">
                <img src="/logo_webgiare_display.webp" alt="Web Giá Rẻ - Portfolio" className="h-full w-full object-contain" loading="lazy" />
              </div>
              <Sparkles size={16} className="absolute -right-2 -top-2 animate-spin-slow text-amber-400" />
            </div>

            <h3 className="mb-3 text-3xl font-bold drop-shadow-lg">Tặng Ebook Miễn Phí</h3>
            <p className="mb-4 text-lg opacity-95">Ebook: Kỹ năng tự học vượt trội</p>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
              <Gift size={16} />
              <span>+ Mã ưu đãi 20%</span>
            </div>
          </div>
        </div>

        <div className="relative flex w-full flex-col justify-center bg-white p-6 sm:p-8 md:w-1/2 md:p-12">
          <div className="-mx-6 -mt-6 mb-6 h-32 overflow-hidden sm:-mx-8 sm:-mt-8 md:hidden">
            <img
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
              alt="Newsletter"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 top-0 flex h-32 items-center justify-center bg-gradient-to-b from-orange-600/80 to-red-600/80">
              <div className="text-center text-white">
                <img src="/logo_webgiare_display.webp" alt="Web Giá Rẻ - Portfolio" className="mx-auto mb-2 h-10 w-10 object-contain" loading="lazy" />
                <p className="text-lg font-bold">Tặng Ebook Miễn Phí</p>
              </div>
            </div>
          </div>

          {!submitted ? (
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2">
                <Gift size={14} className="text-orange-600" />
                <span className="text-xs font-bold uppercase tracking-wide text-orange-700">Quà tặng kiến thức</span>
              </div>

              <h2 id="newsletter-title" className="mb-3 flex flex-wrap items-center gap-2 text-2xl font-bold text-slate-900 sm:mb-4 sm:text-3xl lg:text-4xl">
                Nhận Ebook Hay
                <img src="/logo_webgiare_display.webp" alt="" className="inline-block h-8 w-8 object-contain" loading="lazy" />
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-slate-600 sm:mb-8 sm:text-base">
                Để lại email để nhận ebook <strong className="text-orange-700">Kỹ năng tự học vượt trội</strong> và mã ưu đãi <strong className="text-amber-700">20%</strong> cho lần tư vấn đầu tiên.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:px-5 sm:py-4 sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:from-orange-700 hover:to-red-700 hover:shadow-xl hover:shadow-orange-300 active:scale-95 sm:py-4 sm:text-base"
                >
                  <Gift size={18} className="transition-transform group-hover:rotate-12" />
                  Nhận Ebook Ngay
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>

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
