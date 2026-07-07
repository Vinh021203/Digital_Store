'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    LifeBuoy, MessageSquare, Send, Clock, CheckCircle,
    Loader2, Plus, AlertCircle, X, Phone, Mail,
    Headphones, FileText, Search, ChevronRight, ArrowLeft,
    MessageCircle, HelpCircle, User, Home, Sparkles
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import {
    fetchUserTickets,
    createTicket,
    addTicketMessage,
    getTicketById,
    type DbTicket,
    type DbTicketMessage
} from '@/lib/tickets';

export default function SupportPage() {
    const { user, profile } = useSupabaseAuth();
    const { addToast } = useToast();
    const [tickets, setTickets] = useState<DbTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newTicket, setNewTicket] = useState({
        subject: '',
        message: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // Chat state
    const [selectedTicket, setSelectedTicket] = useState<DbTicket | null>(null);
    const [messages, setMessages] = useState<DbTicketMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadTickets = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await fetchUserTickets(user.id);
            setTickets(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectTicket = async (ticket: DbTicket) => {
        setSelectedTicket(ticket);
        setLoadingMessages(true);
        try {
            const fullTicket = await getTicketById(ticket.id);
            if (fullTicket) {
                setMessages(fullTicket.messages || []);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!user?.id || !selectedTicket || !newMessage.trim()) return;

        setSendingMessage(true);
        try {
            const msg = await addTicketMessage({
                ticket_id: selectedTicket.id,
                sender_id: user.id,
                message: newMessage.trim(),
                is_staff: false,
            });

            if (msg) {
                setMessages(prev => [...prev, { ...msg, sender: { id: user.id, name: profile?.name || 'Bạn', avatar: profile?.avatar || '' } }]);
                setNewMessage('');
            }
        } catch (error) {
            addToast('Không thể gửi tin nhắn', 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleSubmitTicket = async () => {
        if (!user?.id) return;
        if (!newTicket.subject.trim() || !newTicket.message.trim()) {
            addToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const ticket = await createTicket({
                user_id: user.id,
                subject: newTicket.subject,
                priority: newTicket.priority,
            });

            if (ticket) {
                await addTicketMessage({
                    ticket_id: ticket.id,
                    sender_id: user.id,
                    message: newTicket.message,
                });
            }

            addToast('Đã gửi yêu cầu hỗ trợ!', 'success');
            setNewTicket({ subject: '', message: '', priority: 'medium' });
            setShowNewTicket(false);
            loadTickets();
        } catch (error: any) {
            addToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { color: string; icon: any; label: string }> = {
            open: { color: 'text-blue-700 bg-blue-100', icon: AlertCircle, label: 'Mới' },
            pending: { color: 'text-amber-700 bg-amber-100', icon: Clock, label: 'Đang xử lý' },
            resolved: { color: 'text-emerald-700 bg-emerald-100', icon: CheckCircle, label: 'Đã giải quyết' },
            closed: { color: 'text-slate-600 bg-slate-100', icon: X, label: 'Đã đóng' },
        };
        const s = styles[status] || styles.open;
        const Icon = s.icon;
        return (
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>
                <Icon size={12} /> {s.label}
            </span>
        );
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-slate-100 text-slate-600',
            medium: 'bg-amber-100 text-amber-700',
            high: 'bg-red-100 text-red-700',
        };
        return colors[priority] || colors.medium;
    };

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    // Chat view
    if (selectedTicket) {
        return (
            <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <button
                        onClick={() => setSelectedTicket(null)}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedTicket.status === 'resolved' ? 'bg-emerald-400/30' : 'bg-white/20'}`}>
                                {selectedTicket.status === 'open' && 'Mới'}
                                {selectedTicket.status === 'pending' && 'Đang xử lý'}
                                {selectedTicket.status === 'resolved' && 'Đã giải quyết'}
                                {selectedTicket.status === 'closed' && 'Đã đóng'}
                            </span>
                            <span className="text-xs text-teal-100">#{selectedTicket.id.slice(0, 8)}</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Headphones size={20} />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {loadingMessages ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Chưa có tin nhắn nào</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id && !msg.is_staff;
                            const isStaff = msg.is_staff;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden ${isStaff ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-slate-200'
                                            }`}>
                                            {isStaff ? (
                                                <Headphones size={14} className="text-white" />
                                            ) : msg.sender?.avatar ? (
                                                <Image
                                                    src={msg.sender.avatar}
                                                    alt=""
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User size={14} className="text-slate-400" />
                                            )}
                                        </div>

                                        {/* Message bubble */}
                                        <div>
                                            <div className={`px-4 py-2.5 rounded-2xl ${isMe
                                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-br-md'
                                                : isStaff
                                                    ? 'bg-white border border-teal-200 text-slate-700 rounded-bl-md'
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                                                }`}>
                                                {isStaff && (
                                                    <p className="text-xs font-bold text-teal-600 mb-1">
                                                        Hỗ trợ viên
                                                    </p>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <p className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'text-right' : ''}`}>
                                                {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {new Date(msg.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {selectedTicket.status !== 'closed' && (
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex items-end gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    rows={1}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none max-h-32"
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !newMessage.trim()}
                                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sendingMessage ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Nhấn Enter để gửi, Shift+Enter để xuống dòng
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-6">
            {/* Dark Premium Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Link href="/" className="hover:text-white transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
                        <ChevronRight size={14} />
	                        <span className="text-white font-medium">Tư vấn hỗ trợ</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                                <LifeBuoy size={28} className="text-white" />
                            </div>
                            <div>
                                <span className="bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 inline-block">
	                                    <Sparkles size={10} className="inline mr-1" /> Support Desk
                                </span>
	                                <h1 className="text-2xl md:text-3xl font-black">Tư vấn hỗ trợ</h1>
	                                <p className="text-slate-400 text-sm">Gửi câu hỏi về mẫu demo, quyền truy cập hoặc triển khai</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/profile" className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all">
                                <ArrowLeft size={16} />
                                Quay lại
                            </Link>
                            <button
                                onClick={() => setShowNewTicket(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                            >
                                <Plus size={18} />
	                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Contact */}
            <div className="grid md:grid-cols-3 gap-4">
                <a
                    href="mailto:support@shopwebre.vn"
                    className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-teal-200 hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Mail size={24} className="text-teal-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">Email</p>
                        <p className="text-sm text-slate-500">support@shopwebre.vn</p>
                    </div>
                </a>
                <a
                    href="tel:0971386588"
                    className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-green-200 hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Phone size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 group-hover:text-green-600 transition-colors">Hotline</p>
                        <p className="text-sm text-slate-500">0971 386 588</p>
                    </div>
                </a>
                <Link
                    href="/faq"
                    className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-purple-200 hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <HelpCircle size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">FAQ</p>
                        <p className="text-sm text-slate-500">Câu hỏi thường gặp</p>
                    </div>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <FileText size={22} className="text-teal-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
	                            <p className="text-xs text-slate-500 font-medium">Tổng yêu cầu hỗ trợ</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <AlertCircle size={22} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-600">{stats.open}</p>
                            <p className="text-xs text-slate-500 font-medium">Mới</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <Clock size={22} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
                            <p className="text-xs text-slate-500 font-medium">Đang xử lý</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-600">{stats.resolved}</p>
                            <p className="text-xs text-slate-500 font-medium">Đã giải quyết</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            {showNewTicket && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">Tạo yêu cầu hỗ trợ</h3>
                            <button
                                onClick={() => setShowNewTicket(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Tiêu đề</label>
                                <input
                                    type="text"
                                    placeholder="Mô tả vắn tắt vấn đề của bạn..."
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Mức độ ưu tiên</label>
                                <select
                                    value={newTicket.priority}
                                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                >
                                    <option value="low">Thấp - Câu hỏi chung</option>
                                    <option value="medium">Trung bình - Cần hỗ trợ</option>
                                    <option value="high">Cao - Vấn đề khẩn cấp</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Mô tả chi tiết</label>
                                <textarea
                                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                                    rows={5}
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({ ...newTicket, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowNewTicket(false)}
                                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitTicket}
                                disabled={submitting}
                                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm ticket..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải...</p>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Headphones size={32} className="text-slate-300" />
                    </div>
	                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có yêu cầu hỗ trợ nào</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
	                        Gửi yêu cầu để nhận tư vấn hỗ trợ từ đội ngũ của chúng tôi
                    </p>
                    <button
                        onClick={() => setShowNewTicket(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                    >
                        <Plus size={18} />
	                        Gửi yêu cầu đầu tiên
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket)}
                            className="w-full text-left bg-white rounded-2xl border border-slate-100 p-4 md:p-5 hover:border-teal-300 hover:shadow-lg transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <MessageCircle size={24} className="text-teal-600" />
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">
                                            {ticket.subject}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {getStatusBadge(ticket.status)}
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority === 'low' && 'Thấp'}
                                                {ticket.priority === 'medium' && 'Trung bình'}
                                                {ticket.priority === 'high' && 'Cao'}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                #{ticket.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-2">
                                            Tạo lúc: {new Date(ticket.created_at).toLocaleDateString('vi-VN')}
                                            {ticket.updated_at !== ticket.created_at && (
                                                <span> • Cập nhật: {new Date(ticket.updated_at).toLocaleDateString('vi-VN')}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Xem chi tiết
                                    </span>
                                    <ChevronRight size={24} className="text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
