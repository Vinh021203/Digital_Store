'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
  Hand,
  Heart,
} from 'lucide-react';

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

const FloatingWidgets = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Chào bạn! Mình là trợ lý ảo DigitalMart. Mình có thể giúp gì cho bạn hôm nay?',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMsg.trim()) return;

      const newMsg = { id: Date.now(), sender: 'user', text: inputMsg };
      setChatMessages((prev) => [...prev, newMsg]);
      setInputMsg('');

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Cảm ơn bạn đã nhắn tin. Chuyên viên tư vấn sẽ phản hồi bạn trong giây lát nhé!',
        };
        setChatMessages((prev) => [...prev, botResponse]);
      }, 1500);
    },
    [inputMsg]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen(!isChatOpen);
    setIsOpen(false);
  }, [isChatOpen]);

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
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-4 font-sans pointer-events-none">
        {/* Chat Window */}
        <div
          className={`pointer-events-auto w-[calc(100vw-32px)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden transition-all duration-400 origin-bottom-right transform ${isChatOpen
            ? 'scale-100 opacity-100 translate-y-0 mb-4'
            : 'scale-75 opacity-0 translate-y-10 pointer-events-none h-0 mb-0'
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Bot size={20} strokeWidth={2.5} />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-orange-400 border-2 border-orange-600 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">CSKH DigitalMart</h3>
                <p className="text-[10px] text-orange-100 flex items-center gap-1 opacity-90">
                  Sẵn sàng hỗ trợ
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
          <div className="h-[350px] bg-gradient-to-b from-orange-50/30 to-white p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            <div className="text-center text-xs text-slate-400 my-2">Hôm nay</div>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fade-in-up`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2 mt-auto text-orange-600 flex-shrink-0">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 text-sm shadow-sm ${msg.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl rounded-tr-none'
                    : 'bg-white text-slate-700 border border-orange-100 rounded-2xl rounded-tl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-orange-100">
            <form className="flex gap-2 items-center" onSubmit={handleSendMessage}>
              <button
                type="button"
                className="text-slate-400 hover:text-orange-600 p-2 transition-colors rounded-lg hover:bg-orange-50 active:scale-90"
                aria-label="More"
              >
                <MoreHorizontal size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-orange-50/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400"
                maxLength={500}
              />
              <button
                type="submit"
                className="p-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                disabled={!inputMsg.trim()}
                aria-label="Send"
              >
                <Send size={18} />
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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all hover:scale-110 active:scale-95">
                <Phone size={22} strokeWidth={2.5} />
              </div>
            </a>

            {/* Chat */}
            {!isChatOpen && (
              <button onClick={toggleChat} className="flex items-center gap-3 group">
                <span className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-orange-100">
                  Chat ngay
                </span>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center hover:from-red-600 hover:to-amber-600 transition-all hover:scale-110 active:scale-95">
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
            background: linear-gradient(180deg, #4f46e5, #6366f1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #4338ca, #4f46e5);
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
