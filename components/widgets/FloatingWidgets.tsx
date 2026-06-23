'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MessageCircle,
  Phone,
  X,
  Send,
  ChevronUp,
  Bot,
  Headphones,
  MoreHorizontal,
  Minimize2,
  Loader2,
  Star,
  ExternalLink,
} from 'lucide-react';

// Types
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

// Throttle Hook
const useThrottle = (callback: () => void, delay: number) => {
  const lastRun = useRef(Date.now());
  return useCallback(() => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback();
      lastRun.current = now;
    }
  }, [callback, delay]);
};

// Format price
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + '₫';
};

// Product Card Component for Chat
const ProductCard = memo(({ product }: { product: ProductRecommendation }) => (
  <Link
    href={`/product/${product.slug}`}
    className="flex gap-3 p-2 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group"
  >
    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-orange-500 text-xs">
          No img
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-orange-600">
        {product.name}
      </h4>
      <div className="flex items-center gap-1 mt-0.5">
        <Star size={10} className="text-amber-400 fill-current" />
        <span className="text-[10px] text-slate-500">{product.rating?.toFixed(1) || '5.0'}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-bold text-xs text-orange-600">
          {formatPrice(product.price)}
        </span>
      </div>
    </div>
    <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 flex-shrink-0 mt-1" />
  </Link>
));

ProductCard.displayName = 'ProductCard';

const FloatingWidgets = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Chào bạn! Mình là trợ lý AI của Shop Web rẻ. Mình có thể giúp bạn tìm themes, templates, hoặc giải đáp thắc mắc. Bạn cần tìm gì hôm nay?',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const showOnMobile = pathname?.startsWith('/product/');

  const checkScroll = useCallback(() => {
    setShowScrollTop(window.pageYOffset > 400);
  }, []);

  const throttledScroll = useThrottle(checkScroll, 200);

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMsg.trim() || isTyping) return;

      const userMessage = inputMsg.trim();
      const newMsg: ChatMessage = { id: Date.now(), sender: 'user', text: userMessage };
      setChatMessages((prev) => [...prev, newMsg]);
      setInputMsg('');
      setIsTyping(true);

      try {
        // Build history for API (exclude first greeting and products)
        const history = chatMessages.slice(1).map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, history }),
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
      } catch (error) {
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
    [inputMsg, isTyping, chatMessages]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen(!isChatOpen);
    setIsOpen(false);
  }, [isChatOpen]);

  // Quick suggestions
  const quickSuggestions = [
    'Landing page cho startup',
    'Template Next.js bán hàng',
    'Template React đẹp',
  ];

  const handleQuickSuggestion = (text: string) => {
    setInputMsg(text);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Nút scroll-top bên trái */}
      <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 pointer-events-none">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="pointer-events-auto flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-all hover:scale-110 active:scale-95">
              <ChevronUp size={20} strokeWidth={2.5} />
            </div>
            <span className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              Lên đầu trang
            </span>
          </button>
        )}
      </div>

      {/* Widget CSKH bên phải */}
      <div className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex-col items-end gap-3 font-sans pointer-events-none ${showOnMobile ? 'flex' : 'hidden md:flex'}`}>
        {/* Chat Window */}
        <div
          className={`pointer-events-auto w-[calc(100vw-32px)] sm:w-[350px] bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden transition-all duration-400 origin-bottom-right transform flex flex-col ${isChatOpen
            ? 'scale-100 opacity-100 translate-y-0 mb-2 h-[min(390px,calc(100vh-14rem))] min-h-[min(330px,calc(100vh-14rem))] sm:h-[min(430px,calc(100vh-12rem))]'
            : 'scale-75 opacity-0 translate-y-10 pointer-events-none h-0 mb-0'
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 px-3.5 py-3 flex justify-between items-center text-white shadow-md flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Bot size={18} strokeWidth={2.5} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-orange-600 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý Shop Web rẻ</h3>
                <p className="text-[10px] text-orange-100 flex items-center gap-1 opacity-90">
                  Sẵn sàng hỗ trợ 24/7
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90"
                aria-label="Minimize"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-gradient-to-b from-orange-50/30 to-white p-2.5 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0 flex-1">
            <div className="text-center text-[11px] text-slate-400 my-0.5">Hôm nay</div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className="animate-fade-in-up">
                <div
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2 mt-auto text-orange-600 flex-shrink-0">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] p-2.5 text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl rounded-tr-none'
                      : 'bg-white text-slate-700 border border-orange-100 rounded-2xl rounded-tl-none'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Product Recommendations */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 ml-8 space-y-2">
                    {msg.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 animate-fade-in-up">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-orange-100 px-3 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-orange-500" />
                  <span className="text-xs text-slate-500">Đang suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {!isTyping && (
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex-shrink-0">
              <p className="text-[10px] text-slate-400 mb-1">Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-1.5">
                {(currentQuickReplies.length > 0 ? currentQuickReplies : quickSuggestions).map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSuggestion(text)}
                    className="px-2.5 py-1 bg-white text-orange-600 text-[11px] font-medium rounded-full border border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-2.5 bg-white border-t border-orange-100 flex-shrink-0">
            <form className="flex gap-2 items-center" onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Hỏi về sản phẩm, thanh toán..."
                className="flex-1 bg-orange-50/50 border-none rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400"
                maxLength={500}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                disabled={!inputMsg.trim() || isTyping}
                aria-label="Send"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Floating Actions (phải) */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div
            className={`flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
              }`}
          >
            {/* Phone */}
            <a href="tel:0971386588" className="flex items-center gap-3 group">
              <span className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-orange-100">
                0971 386 588
              </span>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-110 active:scale-95">
                <Phone size={22} strokeWidth={2.5} />
              </div>
            </a>

            {/* Chat */}
            {!isChatOpen && (
              <button onClick={toggleChat} className="flex items-center gap-3 group">
                <span className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-orange-100">
                  Chat với AI
                </span>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg shadow-green-200 flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-110 active:scale-95">
                  <MessageCircle size={22} strokeWidth={2.5} />
                </div>
              </button>
            )}
          </div>

          {/* Main button */}
          <button
            onClick={() => (isChatOpen ? setIsChatOpen(false) : setIsOpen(!isOpen))}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 relative pointer-events-auto ${isChatOpen
              ? 'bg-slate-200 text-slate-600 rotate-0 hover:bg-slate-300'
              : isOpen
                ? 'bg-slate-900 text-white rotate-45'
                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:scale-110 hover:from-orange-700 hover:to-red-700'
              }`}
            aria-label="Toggle menu"
          >
            {isChatOpen ? (
              <ChevronUp size={28} className="rotate-180" strokeWidth={2.5} />
            ) : (
              <Headphones size={26} strokeWidth={2.5} />
            )}

            {!isOpen && !isChatOpen && (
              <>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full border-2 border-white animate-pulse" />
                <span className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping" />
              </>
            )}
          </button>
        </div>

        {/* Local styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
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

          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default memo(FloatingWidgets);
