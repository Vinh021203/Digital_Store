'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Bot,
  CheckCircle2,
  ChevronUp,
  ExternalLink,
  Loader2,
  Mail,
  Minimize2,
  Phone,
  Send,
  Star,
  User,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  products?: ProductRecommendation[];
  quickReplies?: string[];
}

interface ProductRecommendation {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  rating: number;
}

const DISPLAY_PHONE = '0971 386 588';
const PHONE_LINK = 'tel:0971386588';
const ZALO_LINK = 'https://zalo.me/0971386588';
const EMAIL_LINK = 'mailto:contact@webgiare.id.vn';

const useThrottle = (callback: () => void, delay: number) => {
  const lastRun = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback();
      lastRun.current = now;
    }
  }, [callback, delay]);
};

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')}đ`;

const ProductCard = memo(({ product }: { product: ProductRecommendation }) => (
  <Link
    href={`/product/${product.slug}`}
    className="group flex gap-3 rounded-xl border border-orange-100 bg-white p-2 transition-all hover:border-orange-300 hover:shadow-md"
  >
    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          width={64}
          height={64}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 text-xs text-orange-500">
          No img
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="line-clamp-1 text-xs font-bold text-slate-800 group-hover:text-orange-600">
        {product.name}
      </h4>
      <div className="mt-0.5 flex items-center gap-1">
        <Star size={10} className="fill-amber-400 text-amber-400" />
        <span className="text-[10px] text-slate-500">{product.rating?.toFixed(1) || '5.0'}</span>
      </div>
      <span className="mt-1 block text-xs font-bold text-orange-600">
        {formatPrice(product.price)}
      </span>
    </div>
    <ExternalLink size={14} className="mt-1 flex-shrink-0 text-slate-300 group-hover:text-orange-500" />
  </Link>
));

ProductCard.displayName = 'ProductCard';

const ZaloIcon = ({ className = '' }: { className?: string }) => (
  <span className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-blue-100 ${className}`}>
    <Image
      src="/zalo.png"
      alt="Zalo"
      width={36}
      height={36}
      className="h-8 w-8 scale-[1.45] object-contain"
      sizes="32px"
    />
  </span>
);

const FloatingWidgets = () => {
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hideNearFooter, setHideNearFooter] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactReady, setContactReady] = useState(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Chào bạn! Mình là trợ lý AI của Web Giá Rẻ - Portfolio. Mình có thể giúp bạn tìm giao diện, template hoặc giải đáp thắc mắc. Bạn cần tư vấn gì hôm nay?',
    },
  ]);
  const [chatSessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const storageKey = 'webgiare-chat-session-id';
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(storageKey, id);
    return id;
  });

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setContactName(user.name || '');
      setContactPhone(user.phone || '');
      setContactReady(true);
      return;
    }
    const saved = window.sessionStorage.getItem('webgiare-chat-contact');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { name?: string; phone?: string };
        if (parsed.name && parsed.phone) {
          setContactName(parsed.name);
          setContactPhone(parsed.phone);
          setContactReady(true);
        }
      } catch { /* Ignore invalid session data. */ }
    }
  }, [authLoading, user]);

  const saveContact = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = contactPhone.replace(/[^0-9+]/g, '');
    if (contactName.trim().length < 2 || normalizedPhone.replace(/\D/g, '').length < 9) return;
    window.sessionStorage.setItem('webgiare-chat-contact', JSON.stringify({ name: contactName.trim(), phone: normalizedPhone }));
    setContactPhone(normalizedPhone);
    setContactReady(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatSessionId) return;
    let cancelled = false;
    fetch(`/api/chat/history?sessionId=${encodeURIComponent(chatSessionId)}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.messages) || data.messages.length === 0) return;
        const restored = data.messages.map((message: { id: number; sender: 'user' | 'bot' | 'admin'; message: string }) => ({
          id: message.id,
          sender: message.sender === 'user' ? 'user' : 'bot',
          text: message.message,
        } as ChatMessage));
        setChatMessages((current) => [current[0], ...restored]);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [chatSessionId]);

  const checkScroll = useCallback(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    setShowScrollTop(progress >= 0.18);

    const footer = document.querySelector('footer');
    if (footer) {
      const distFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setHideNearFooter(distFromBottom < 450 || progress >= 0.85);
    } else {
      setHideNearFooter(false);
    }
  }, []);

  const throttledScroll = useThrottle(checkScroll, 160);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHideNearFooter(true);
        } else {
          checkScroll();
        }
      },
      {
        root: null,
        rootMargin: '120px 0px 0px 0px',
        threshold: 0,
      },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, [checkScroll]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, throttledScroll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMsg.trim() || isTyping || !contactReady) return;

      const userMessage = inputMsg.trim();
      const newMsg: ChatMessage = { id: Date.now(), sender: 'user', text: userMessage };
      setChatMessages((prev) => [...prev, newMsg]);
      setInputMsg('');
      setIsTyping(true);

      try {
        const history = chatMessages.slice(1).map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history,
            sessionId: chatSessionId,
            sourcePage: pathname,
            userId: user?.id || null,
            visitorName: contactName,
            visitorEmail: user?.email || null,
            visitorPhone: contactPhone,
            visitorAvatar: user?.avatar || null,
          }),
        });

        const data = await response.json();

        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
          products: data.products,
          quickReplies: data.quickReplies,
        };

        setChatMessages((prev) => [...prev, botResponse]);
        setCurrentQuickReplies(data.quickReplies || []);
      } catch {
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Xin lỗi, không thể kết nối. Vui lòng thử lại hoặc gọi hotline 0971 386 588!',
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [chatMessages, chatSessionId, contactName, contactPhone, contactReady, inputMsg, isTyping, pathname, user]
  );

  const quickSuggestions = [
    'Landing page cho startup',
    'Template Next.js giới thiệu/demo',
    'Template React đẹp',
    'Tư vấn theo ngân sách',
  ];

  const handleQuickSuggestion = (text: string) => {
    setInputMsg(text);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className={`fixed bottom-24 left-3 z-[70] flex flex-col items-center gap-2 rounded-3xl border border-slate-200/80 bg-white/92 p-1.5 font-sans shadow-[0_18px_45px_rgba(15,23,42,0.13)] backdrop-blur-xl transition-all duration-300 md:bottom-6 md:left-6 md:p-2 ${hideNearFooter ? 'pointer-events-none translate-y-6 opacity-0' : 'animate-widget-dock-in opacity-100'}`}>
        <a href={PHONE_LINK} className="group relative flex items-center" aria-label={`Gọi ${DISPLAY_PHONE}`}>
          <div className="widget-action widget-dock-item flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 md:h-11 md:w-11">
            <Phone size={19} strokeWidth={2.35} />
          </div>
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 opacity-0 shadow-lg shadow-slate-200/70 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 md:block">
            Gọi {DISPLAY_PHONE}
          </span>
        </a>

        <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer" className="group relative flex items-center" aria-label="Chat Zalo">
          <div className="widget-action widget-dock-item flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#0068ff] ring-1 ring-blue-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#dcecff] hover:shadow-lg hover:shadow-blue-200 md:h-11 md:w-11">
            <ZaloIcon className="scale-90 transition-transform duration-200 group-hover:scale-100 md:scale-100 md:group-hover:scale-105" />
          </div>
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 opacity-0 shadow-lg shadow-slate-200/70 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 md:block">
            Chat Zalo
          </span>
        </a>

        <a href={EMAIL_LINK} className="group relative flex items-center" aria-label="Gửi email">
          <div className="widget-action widget-dock-item flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-200 md:h-11 md:w-11">
            <Mail size={19} strokeWidth={2.35} />
          </div>
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 opacity-0 shadow-lg shadow-slate-200/70 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 md:block">
            Gửi email
          </span>
        </a>
      </div>

      <div className={`fixed right-3 z-[2147483647] flex flex-col items-end font-sans transition-all duration-300 md:right-6 ${isChatOpen ? 'bottom-20 gap-3 md:bottom-6' : hideNearFooter ? 'bottom-6 gap-0 md:bottom-6' : showScrollTop ? 'bottom-4 gap-8 md:bottom-4 md:gap-10' : 'bottom-24 gap-8 md:bottom-10 md:gap-10'}`}>
        <div
          className={`pointer-events-auto flex w-[calc(100vw-32px)] origin-bottom-right transform flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl transition-all duration-400 sm:w-[350px] ${
            isChatOpen
              ? 'mb-2 h-[min(560px,calc(100dvh-8.5rem))] min-h-[min(440px,calc(100dvh-8.5rem))] translate-y-0 scale-100 opacity-100 sm:h-[min(520px,calc(100dvh-10rem))]'
              : 'pointer-events-none mb-0 h-0 translate-y-10 scale-75 opacity-0'
          }`}
        >
          <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 px-3.5 py-3 text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                  <Bot size={18} strokeWidth={2.5} />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 animate-pulse rounded-full border-2 border-orange-600 bg-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Trợ lý Web Giá Rẻ - Portfolio</h3>
                <p className="flex items-center gap-1 text-[10px] text-orange-100 opacity-90">
                  <CheckCircle2 size={10} /> Sẵn sàng hỗ trợ 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/20 active:scale-90"
                aria-label="Thu nhỏ"
                type="button"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/20 active:scale-90"
                aria-label="Đóng"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="custom-scrollbar relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain bg-gradient-to-b from-orange-50/30 to-white p-2.5">
            {!authLoading && !user && !contactReady && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 p-5 backdrop-blur-sm">
                <form onSubmit={saveContact} className="w-full max-w-[300px] rounded-2xl border border-orange-100 bg-white p-4 shadow-lg">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><User size={19} /></div>
                  <h4 className="text-sm font-black text-slate-900">Để lại thông tin để được tư vấn</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Mình cần tên và số điện thoại để đội ngũ có thể hỗ trợ bạn khi cần.</p>
                  <input value={contactName} onChange={(event) => setContactName(event.target.value)} required minLength={2} placeholder="Tên của bạn" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                  <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required placeholder="Số điện thoại" inputMode="tel" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                  <button type="submit" className="mt-3 w-full rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm">Bắt đầu trò chuyện</button>
                </form>
              </div>
            )}
            <div className="my-0.5 text-center text-[11px] text-slate-400">Hôm nay</div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className="animate-fade-in-up">
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="mt-auto mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] p-2.5 text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'rounded-2xl rounded-tr-none bg-gradient-to-r from-orange-600 to-red-600 text-white'
                        : 'rounded-2xl rounded-tl-none border border-orange-100 bg-white text-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 ml-8 space-y-2">
                    {msg.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex animate-fade-in-up items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-orange-100 bg-white px-3 py-2.5">
                  <Loader2 size={14} className="animate-spin text-orange-500" />
                  <span className="text-xs text-slate-500">Đang suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!isTyping && (
            <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50 px-3 py-1.5">
              <p className="mb-1 text-[10px] text-slate-400">Gợi ý nhanh:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(currentQuickReplies.length > 0 ? currentQuickReplies : quickSuggestions).map((text) => (
                  <button
                    key={text}
                    onClick={() => handleQuickSuggestion(text)}
                    className="flex min-h-9 items-center justify-center rounded-xl border border-orange-200 bg-white px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-50 sm:text-[11px]"
                    type="button"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-shrink-0 border-t border-orange-100 bg-white p-2.5">
            <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Hỏi về mẫu demo, tư vấn..."
                className="flex-1 rounded-xl border-none bg-orange-50/50 px-3.5 py-2 text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500"
                maxLength={500}
                disabled={isTyping || !contactReady}
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-orange-600 to-red-600 p-2.5 text-white shadow-md transition-all hover:from-orange-700 hover:to-red-700 hover:shadow-lg active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!inputMsg.trim() || isTyping || !contactReady}
                aria-label="Gửi"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        {!hideNearFooter && (
          <button
            onClick={() => setIsChatOpen((value) => !value)}
            className={`pointer-events-auto relative z-[2147483647] flex items-center justify-center text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${isChatOpen
              ? 'h-12 w-12 rounded-full border border-slate-200 bg-white shadow-lg'
              : 'h-24 w-24 rounded-full border-0 bg-transparent shadow-none md:h-32 md:w-32'
              }`}
            aria-label="Mở trợ lý tư vấn"
            type="button"
          >
            {!isChatOpen && (
              <span className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-0 whitespace-nowrap rounded-full border border-orange-100 bg-white/95 px-3 py-2 text-xs font-bold text-orange-700 shadow-lg shadow-orange-100/70 backdrop-blur-sm animate-chatbot-hint md:px-4 md:text-sm">
                Cần tư vấn? Chat với mình
              </span>
            )}
            {isChatOpen ? (
              <ChevronUp size={26} className="rotate-180 text-slate-700" strokeWidth={2.5} />
            ) : (
              <span className="relative flex h-full w-full items-center justify-center">
                <Image src="/chatbot_webgiare.webp" alt="Trợ lý Web Giá Rẻ" width={220} height={330} className="chatbot-avatar h-[170px] w-[170px] object-contain md:h-[220px] md:w-[220px]" />
              </span>
            )}

            {!isChatOpen && (
              <>
                <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-rose-500 to-pink-500" />
                <span className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
              </>
            )}
          </button>
        )}

        {showScrollTop && !isChatOpen && (
          <button
            onClick={scrollToTop}
            className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-200/70 transition-all animate-scroll-pop hover:-translate-y-1 hover:bg-slate-950 hover:text-white active:scale-95 md:h-11 md:w-11 ${
              hideNearFooter ? 'mb-0' : 'mb-14 md:mb-0'
            }`}
            aria-label="Lên đầu trang"
            type="button"
          >
            <ChevronUp size={20} strokeWidth={2.6} />
          </button>
        )}

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          @keyframes chatbot-float {
            0%, 100% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-4px) rotate(1deg); }
          }

          .chatbot-avatar {
            animation: chatbot-float 3.2s ease-in-out infinite;
            filter: drop-shadow(0 8px 8px rgba(37, 99, 235, 0.2));
          }

          @keyframes chatbot-hint {
            0%, 100% { opacity: 0; transform: translateX(12px) scale(0.94); }
            12%, 78% { opacity: 1; transform: translateX(0) scale(1); }
            90% { opacity: 0; transform: translateX(8px) scale(0.96); }
          }

          .animate-chatbot-hint {
            animation: chatbot-hint 5.5s ease-in-out infinite;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #f97316, #ef4444);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #ea580c, #dc2626);
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes widget-dock-in {
            from {
              opacity: 0;
              transform: translateX(-10px) translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateX(0) translateY(0);
            }
          }

          @keyframes widget-shine {
            from {
              transform: translateX(-130%) rotate(18deg);
            }
            to {
              transform: translateX(130%) rotate(18deg);
            }
          }

          @keyframes widget-action-in {
            from { opacity: 0; transform: translateY(8px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .widget-dock-item {
            animation: widget-action-in 0.45s ease-out both;
          }

          .widget-dock-item:nth-child(2) { animation-delay: 0.08s; }
          .widget-dock-item:nth-child(3) { animation-delay: 0.16s; }

          @keyframes scroll-pop {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.94);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out;
          }

          .animate-widget-dock-in {
            animation: widget-dock-in 0.38s ease-out both;
          }

          .animate-scroll-pop {
            animation: scroll-pop 0.24s ease-out both;
          }

          .widget-action {
            position: relative;
            overflow: hidden;
          }

          .widget-action::after {
            content: "";
            position: absolute;
            inset: -45% auto -45% -70%;
            width: 46%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
            opacity: 0;
          }

          .widget-action:hover::after {
            opacity: 1;
            animation: widget-shine 0.72s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default memo(FloatingWidgets);
