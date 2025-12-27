'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Search,
  MoreVertical,
  Send,
  Paperclip,
  User,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import {
  fetchTickets,
  getTicketById,
  addTicketMessage,
  updateTicketStatus,
  getTicketStats,
  type DbTicket,
  type DbTicketMessage,
} from '@/lib/tickets';

type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

const SupportManager = () => {
  const { addToast } = useToast();
  const { user } = useSupabaseAuth();

  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<DbTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TicketStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    open: number;
    pending: number;
    resolved: number;
    closed: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        fetchTickets({
          status: filterStatus === 'all' ? undefined : filterStatus,
        }),
        getTicketStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);

      // If has selected ticket, refresh it
      if (selectedTicket) {
        const freshTicket = await getTicketById(selectedTicket.id);
        setSelectedTicket(freshTicket);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      addToast('Không thể tải danh sách ticket', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedTicket?.id, addToast]);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleSelectTicket = async (ticketId: string) => {
    try {
      const ticket = await getTicketById(ticketId);
      setSelectedTicket(ticket);
    } catch (error) {
      addToast('Không thể tải ticket', 'error');
    }
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!replyText.trim() || !selectedTicket || !user) return;

    setSendingReply(true);
    try {
      const newMessage = await addTicketMessage({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        is_staff: true,
        message: replyText.trim(),
      });

      if (newMessage) {
        setSelectedTicket(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), { ...newMessage, sender: { id: user.id, name: 'Admin', avatar: '' } }],
          };
        });
        setReplyText('');
        addToast('Đã gửi phản hồi', 'success');

        // Update status to pending if it was open
        if (selectedTicket.status === 'open') {
          await updateTicketStatus(selectedTicket.id, 'pending');
          setSelectedTicket(prev => prev ? { ...prev, status: 'pending' } : null);
        }
      }
    } catch (error) {
      addToast('Lỗi khi gửi phản hồi', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    try {
      await updateTicketStatus(selectedTicket.id, newStatus);
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      setTickets(prev =>
        prev.map(t => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t))
      );
      addToast(`Đã chuyển sang: ${newStatus}`, 'info');
    } catch (error) {
      addToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const filteredTickets = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return tickets.filter(t => {
      if (!q) return true;
      return (
        t.subject.toLowerCase().includes(q) ||
        t.user?.name?.toLowerCase().includes(q) ||
        t.user?.email?.toLowerCase().includes(q)
      );
    });
  }, [tickets, searchTerm]);

  const priorityBadgeClass = (p: string) =>
    p === 'high'
      ? 'bg-rose-50 text-rose-600 border-rose-100'
      : p === 'medium'
        ? 'bg-amber-50 text-amber-600 border-amber-100'
        : 'bg-slate-50 text-slate-500 border-slate-100';

  const statusBadgeClass = (s: string) =>
    s === 'open'
      ? 'bg-rose-100 text-rose-600'
      : s === 'pending'
        ? 'bg-amber-100 text-amber-600'
        : s === 'resolved'
          ? 'bg-blue-100 text-blue-600'
          : 'bg-emerald-100 text-emerald-600';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hỗ Trợ Khách Hàng</h2>
          <p className="text-sm text-slate-500">
            Quản lý và phản hồi yêu cầu hỗ trợ từ khách hàng
          </p>
        </div>
        <button
          onClick={() => loadData()}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="flex-1 flex gap-6">
          {/* Left: Ticket List */}
          <div className="w-96 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Hộp Thư Hỗ Trợ</h3>
                <span className="text-xs text-slate-400">{stats?.total || 0} ticket</span>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, tiêu đề..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  { key: 'all', label: 'Tất cả', count: stats?.total },
                  { key: 'open', label: 'Mở', count: stats?.open },
                  { key: 'pending', label: 'Chờ', count: stats?.pending },
                  { key: 'closed', label: 'Xong', count: stats?.closed },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFilterStatus(item.key as typeof filterStatus)}
                    className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors ${filterStatus === item.key
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {item.label}
                    <span className="text-[10px] opacity-80">({item.count || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredTickets.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  Không có ticket nào
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => handleSelectTicket(ticket.id)}
                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${selectedTicket?.id === ticket.id
                        ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600'
                        : 'border-l-4 border-l-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadgeClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock4 size={10} />
                        {formatTime(ticket.updated_at)}
                      </span>
                    </div>
                    <h4 className={`font-bold text-sm line-clamp-1 mb-1 ${selectedTicket?.id === ticket.id ? 'text-indigo-700' : 'text-slate-800'
                      }`}>
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <User size={10} /> {ticket.user?.name || 'Ẩn danh'}
                      </span>
                      <span className={`border px-2 py-0.5 rounded-full font-medium ${priorityBadgeClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Chat Interface */}
          {selectedTicket ? (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  {selectedTicket.user?.avatar ? (
                    <Image
                      src={selectedTicket.user.avatar}
                      alt={selectedTicket.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {selectedTicket.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {selectedTicket.user?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {selectedTicket.user?.email}
                      </span>
                      <span className={`flex items-center gap-1 border px-2 py-0.5 rounded-full ${priorityBadgeClass(selectedTicket.priority)}`}>
                        <AlertCircle size={12} /> {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={e => handleStatusChange(e.target.value as TicketStatus)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-indigo-300"
                >
                  <option value="open">Mở (Open)</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                  <option value="closed">Đóng</option>
                </select>
              </div>

              {/* Chat Body */}
              <div className="flex-1 bg-slate-50 p-6 overflow-y-auto custom-scrollbar space-y-4">
                {selectedTicket.messages?.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_staff ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex flex-col ${msg.is_staff ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-3 shadow-sm text-sm leading-relaxed ${msg.is_staff
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'
                          }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form
                  onSubmit={handleSendReply}
                  className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2.5"
                >
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    placeholder="Nhập nội dung phản hồi..."
                    className="flex-1 bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {sendingReply ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400 p-10">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Chọn một hội thoại để bắt đầu hỗ trợ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportManager;
