'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Bot, Check, CheckCircle2, Clock3, Filter, Mail, MessageSquare, RefreshCw, Search, User } from 'lucide-react';

type Status = 'new' | 'contacted' | 'closed';
type Session = { id: string; user_id?: string | null; visitor_email?: string | null; status: Status; source_page: string | null; interested_product: string | null; interested_technology: string | null; visitor_name?: string | null; visitor_phone?: string | null; visitor_avatar?: string | null; last_message_at: string };
type ChatMessage = { id: number; sender: 'user' | 'bot' | 'admin'; message: string; created_at: string };
type Detail = { session: Session; messages: ChatMessage[] };
type UserGroup = { key: string; session: Session; sessions: Session[] };
type DisplaySession = Session & { group: UserGroup };

const labels: Record<Status, string> = { new: 'Mới', contacted: 'Đã liên hệ', closed: 'Đã đóng' };
const statusClass: Record<Status, string> = { new: 'bg-orange-50 text-orange-600', contacted: 'bg-blue-50 text-blue-600', closed: 'bg-emerald-50 text-emerald-600' };
const time = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [status, setStatus] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = status === 'all' ? '' : `?status=${status}`;
      const response = await fetch(`/api/admin/chat-sessions${query}`, { cache: 'no-store' });
      const json = await response.json();
      setSessions(json.data || []);
    } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const openSession = async (id: string) => {
    const response = await fetch(`/api/admin/chat-sessions/${id}`, { cache: 'no-store' });
    const json = await response.json();
    if (json.data) setSelected(json.data);
  };

  const openUser = async (group: UserGroup) => {
    const details = await Promise.all(group.sessions.map(async (item) => {
      const response = await fetch(`/api/admin/chat-sessions/${item.id}`, { cache: 'no-store' });
      const json = await response.json();
      return json.data as Detail | undefined;
    }));
    const messages = details.flatMap((item) => item?.messages || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setSelected({ session: group.session, messages });
  };

  const updateStatus = async (next: Status) => {
    if (!selected) return;
    await fetch(`/api/admin/chat-sessions/${selected.session.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    const selectedGroup = userGroups.find((group) => group.session.id === selected.session.id);
    const ids = selectedGroup?.sessions.map((item) => item.id) || [selected.session.id];
    await Promise.all(ids.filter((id) => id !== selected.session.id).map((id) => fetch(`/api/admin/chat-sessions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })));
    setSelected({ ...selected, session: { ...selected.session, status: next } });
    setSessions((items) => items.map((item) => ids.includes(item.id) ? { ...item, status: next } : item));
  };

  const userGroups = useMemo<UserGroup[]>(() => {
    const groups = new Map<string, UserGroup>();
    sessions.forEach((item) => {
      const key = item.user_id || item.visitor_email || item.visitor_phone || (item.visitor_name ? `name:${item.visitor_name.toLowerCase().trim()}` : `session:${item.id}`);
      const existing = groups.get(key);
      if (existing) {
        existing.sessions.push(item);
        if (new Date(item.last_message_at).getTime() > new Date(existing.session.last_message_at).getTime()) existing.session = item;
      } else {
        groups.set(key, { key, session: item, sessions: [item] });
      }
    });
    return [...groups.values()].sort((a, b) => new Date(b.session.last_message_at).getTime() - new Date(a.session.last_message_at).getTime());
  }, [sessions]);

  const filtered = useMemo<DisplaySession[]>(() => {
    const query = search.trim().toLowerCase();
    const groups = !query ? userGroups : userGroups.filter((group) => group.sessions.some((item) => [item.visitor_name, item.visitor_email, item.interested_product, item.interested_technology, item.source_page].some((value) => value?.toLowerCase().includes(query))));
    return groups.map((group) => ({ ...group.session, group }));
  }, [search, userGroups]);

  const statCards = [
    { label: 'Khách hàng', value: userGroups.length, icon: MessageSquare, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Cần xử lý', value: userGroups.filter((group) => group.sessions.some((item) => item.status === 'new')).length, icon: Clock3, color: 'bg-orange-50 text-orange-600' },
    { label: 'Đã liên hệ', value: userGroups.filter((group) => group.session.status === 'contacted').length, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Đã đóng', value: userGroups.filter((group) => group.session.status === 'closed').length, icon: Check, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">Lịch sử chat AI</h2>
          <p className="text-sm text-slate-500">Theo dõi nhu cầu về mẫu demo và công nghệ khách quan tâm.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}><card.icon size={21} /></div><div><p className="text-xs font-black uppercase text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-black text-slate-950">{card.value}</p></div></div>)}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><Filter size={16} className="text-indigo-500" /> Hộp thư tư vấn</div>
          <div className="flex w-full gap-2 sm:w-auto"><div className="relative w-full sm:w-64"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm, công nghệ..." className="w-full rounded-xl border-0 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div><select value={status} onChange={(event) => setStatus(event.target.value as 'all' | Status)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"><option value="all">Tất cả</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        </div>

        <div className="grid h-[620px] min-h-[520px] grid-cols-1 lg:grid-cols-[370px_1fr]">
          <div className="border-b border-slate-100 lg:border-b-0 lg:border-r">
            <div className="flex justify-between border-b border-slate-100 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-400"><span>Danh sách khách hàng</span><span>{filtered.length}</span></div>
            {loading ? <div className="p-10 text-center text-sm text-slate-400">Đang tải lịch sử...</div> : filtered.length === 0 ? <div className="p-10 text-center"><MessageSquare size={42} className="mx-auto mb-3 text-slate-200" /><p className="text-sm text-slate-500">Chưa có lịch sử chat.</p></div> : filtered.map((item) => <button key={item.group.key} onClick={() => openUser(item.group)} className={`w-full border-b border-slate-100 p-5 text-left transition hover:bg-slate-50 ${selected?.session.id === item.id ? 'border-l-4 border-l-indigo-500 bg-indigo-50/50 pl-4' : ''}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-600">{item.visitor_avatar ? <Image src={item.visitor_avatar} alt="" fill sizes="36px" className="object-cover" /> : <span className="font-bold">{(item.visitor_name || 'K').slice(0, 1).toUpperCase()}</span>}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{item.visitor_name || 'Khách truy cập ẩn danh'}</p><p className="mt-1 truncate text-xs text-slate-400">{item.group.sessions.length} phiên · {item.interested_product || item.interested_technology || 'Chưa xác định nhu cầu'}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusClass[item.status]}`}>{labels[item.status]}</span></div><div className="mt-3 flex justify-between gap-2 text-[11px] text-slate-400"><span className="truncate">{item.interested_technology || item.source_page || 'Không rõ trang'}</span><span className="shrink-0">{time(item.last_message_at)}</span></div></button>)}
          </div>

          <div className="flex min-h-[520px] flex-col bg-white">{!selected ? <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-slate-400"><Bot size={42} className="mb-3 text-indigo-300" /><p className="font-semibold">Chọn một phiên để xem nội dung trao đổi.</p></div> : <><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div className="flex items-center gap-3"><span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-600">{selected.session.visitor_avatar ? <Image src={selected.session.visitor_avatar} alt="" fill sizes="44px" className="object-cover" /> : (selected.session.visitor_name || 'K').slice(0, 1).toUpperCase()}</span><div><h3 className="font-black text-slate-900">{selected.session.visitor_name || 'Khách truy cập ẩn danh'}</h3><p className="mt-1 text-xs text-slate-400">{selected.session.visitor_phone || selected.session.source_page || 'Chưa có số điện thoại'}</p></div></div><div className="flex gap-2">{(['new', 'contacted', 'closed'] as Status[]).map((item) => <button key={item} onClick={() => updateStatus(item)} className={`rounded-lg px-3 py-2 text-xs font-bold ${selected.session.status === item ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{labels[item]}</button>)}</div></div><div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-5 md:p-6">{selected.messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? '' : 'justify-end'}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.sender === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>{message.sender === 'user' ? <User size={14} /> : <Bot size={14} />}</span><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === 'user' ? 'rounded-tl-none bg-white text-slate-700 shadow-sm' : 'rounded-tr-none bg-indigo-50 text-slate-700'}`}><div className="mb-1 text-[10px] font-bold uppercase text-slate-400">{message.sender === 'user' ? 'Khách' : message.sender === 'admin' ? 'Admin' : 'AI'} · {time(message.created_at)}</div>{message.message}</div></div>)}</div><div className="border-t border-slate-100 bg-white px-5 py-3 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><Mail size={13} /> Dùng lịch sử này để theo dõi và chăm sóc khách hàng.</span></div></>}</div>
        </div>
      </section>
    </div>
  );
}
