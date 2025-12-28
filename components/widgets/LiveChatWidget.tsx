'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, User } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    isBot: boolean;
    time: string;
}

const QUICK_REPLIES = [
    'Tôi cần hỗ trợ kỹ thuật',
    'Hỏi về thanh toán',
    'Làm sao để download?',
    'Yêu cầu hoàn tiền',
];

const BOT_RESPONSES: { [key: string]: string } = {
    'default': 'Cảm ơn bạn đã liên hệ! Nhân viên hỗ trợ sẽ phản hồi trong ít phút. Trong lúc chờ đợi, bạn có thể xem [FAQ](/faq) để tìm câu trả lời nhanh.',
    'kỹ thuật': 'Để được hỗ trợ kỹ thuật, vui lòng mô tả chi tiết vấn đề bạn gặp phải. Bạn cũng có thể tạo ticket hỗ trợ tại Profile > Support để theo dõi tiến độ.',
    'thanh toán': 'Chúng tôi hỗ trợ thanh toán qua: Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ, MoMo, ZaloPay. Bạn cần hỗ trợ vấn đề gì cụ thể?',
    'download': 'Để download sản phẩm đã mua, vào Profile > Downloads. Bạn có thể tải lại không giới hạn số lần. Nếu gặp lỗi, vui lòng thử refresh trang hoặc đổi trình duyệt.',
    'hoàn tiền': 'Chính sách hoàn tiền: Trong vòng 7 ngày nếu chưa download file. Vui lòng liên hệ email veutong961@gmail.com kèm mã đơn hàng để được hỗ trợ.',
};

export default function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: 'Xin chào! Tôi là trợ lý ảo của DigitalMart. Tôi có thể giúp gì cho bạn?',
            isBot: true,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const getBotResponse = (userMessage: string): string => {
        const lowerMsg = userMessage.toLowerCase();
        for (const [key, response] of Object.entries(BOT_RESPONSES)) {
            if (key !== 'default' && lowerMsg.includes(key)) {
                return response;
            }
        }
        return BOT_RESPONSES['default'];
    };

    const handleSend = (text?: string) => {
        const msgText = text || message.trim();
        if (!msgText) return;

        const userMsg: Message = {
            id: Date.now(),
            text: msgText,
            isBot: false,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');

        // Simulate bot typing
        setIsTyping(true);
        setTimeout(() => {
            const botMsg: Message = {
                id: Date.now() + 1,
                text: getBotResponse(msgText),
                isBot: true,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Show chat button after 3 seconds
    const [showButton, setShowButton] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowButton(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!showButton) return null;

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-lg shadow-orange-300 flex items-center justify-center text-white hover:scale-110 transition-all animate-bounce-slow"
                    aria-label="Mở chat hỗ trợ"
                >
                    <MessageCircle size={24} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col ${isMinimized
                        ? 'bottom-6 right-6 w-72 h-14'
                        : 'bottom-6 right-6 w-[360px] h-[500px] max-h-[80vh]'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            {!isMinimized && (
                                <div>
                                    <h3 className="font-bold">Hỗ Trợ DigitalMart</h3>
                                    <p className="text-xs text-orange-100">Thường phản hồi trong vài phút</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>


                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] ${msg.isBot ? 'order-2' : 'order-1'}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.isBot
                                                ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                                                : 'bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-tr-sm'
                                                }`}>
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] text-slate-400 mt-1 ${msg.isBot ? 'text-left' : 'text-right'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot
                                            ? 'bg-orange-100 text-orange-600 order-1 mr-2'
                                            : 'bg-slate-200 text-slate-600 order-2 ml-2'
                                            }`}>
                                            {msg.isBot ? <Bot size={14} /> : <User size={14} />}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                            <Bot size={14} />
                                        </div>
                                        <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Replies */}
                            {messages.length <= 2 && (
                                <div className="px-4 py-2 border-t border-slate-100 bg-white flex-shrink-0">
                                    <p className="text-xs text-slate-500 mb-2">Chọn nhanh:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_REPLIES.map((reply, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(reply)}
                                                className="px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full hover:bg-orange-100 transition-colors"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-3 border-t border-slate-100 bg-white flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!message.trim()}
                                        className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:scale-105 transition-all"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
        </>
    );
}
