'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Search,
  DollarSign,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Copy,
  Target,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { createClient } from '@/lib/supabase/client';
import {
  fetchReferrals,
  fetchWithdrawals,
  processWithdrawal,
  updateReferralStatus,
  DbAffiliateReferral,
  DbAffiliateWithdrawal,
} from '@/lib/affiliate';

interface Partner {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  affiliateCode: string;
  isAffiliate: boolean;
  status: 'Active' | 'Pending';
  totalReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  availableBalance: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const AffiliateManager = () => {
  const { addToast } = useToast();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [referrals, setReferrals] = useState<DbAffiliateReferral[]>([]);
  const [withdrawals, setWithdrawals] = useState<DbAffiliateWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Pending'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tab: payouts
  const [payoutTab, setPayoutTab] = useState<'all' | 'pending'>('all');

  // Load data from Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      // Fetch affiliate users
      const { data: affiliateUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar, affiliate_code, is_affiliate')
        .eq('is_affiliate', true);

      if (usersError) throw usersError;

      // Fetch all referrals for stats
      const allReferrals = await fetchReferrals({ limit: 500 });
      setReferrals(allReferrals);

      // Fetch all withdrawals
      const allWithdrawals = await fetchWithdrawals({ limit: 100 });
      setWithdrawals(allWithdrawals);

      // Calculate partner stats
      const partnerList: Partner[] = (affiliateUsers || []).map((user) => {
        const userReferrals = allReferrals.filter(r => r.referrer_id === user.id);
        const userWithdrawals = allWithdrawals.filter(w => w.user_id === user.id);

        const approved = userReferrals.filter(r => r.status === 'approved' || r.status === 'paid');
        const pending = userReferrals.filter(r => r.status === 'pending');
        const paidOut = userWithdrawals.filter(w => w.status === 'completed');

        const totalCommission = approved.reduce((sum, r) => sum + Number(r.commission), 0);
        const pendingCommission = pending.reduce((sum, r) => sum + Number(r.commission), 0);
        const paidAmount = paidOut.reduce((sum, w) => sum + Number(w.amount), 0);

        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          avatar: user.avatar,
          affiliateCode: user.affiliate_code || '',
          isAffiliate: user.is_affiliate,
          status: 'Active' as const,
          totalReferrals: userReferrals.length,
          totalCommission,
          pendingCommission,
          availableBalance: totalCommission - paidAmount,
        };
      });

      setPartners(partnerList);
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      addToast('Lỗi tải dữ liệu affiliate', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return partners.filter(p => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.affiliateCode.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [partners, searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / pageSize));
  const paginatedPartners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPartners.slice(start, start + pageSize);
  }, [filteredPartners, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, pageSize]);

  // Stats
  const stats = useMemo(() => {
    const totalPartners = partners.length;
    const activePartners = partners.filter(p => p.status === 'Active').length;
    const totalRevenue = partners.reduce((sum, p) => sum + p.totalCommission, 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
    const pendingCount = pendingWithdrawals.length;
    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
    const topPartner = [...partners].sort((a, b) => b.totalCommission - a.totalCommission)[0];

    return {
      totalPartners,
      activePartners,
      totalRevenue,
      pendingCount,
      pendingAmount,
      topPartner,
    };
  }, [partners, withdrawals]);

  // Handle withdrawal action
  const handleWithdrawalAction = async (id: number, action: 'approve' | 'reject', userId: string) => {
    const status = action === 'approve' ? 'completed' : 'failed';
    const success = await processWithdrawal(id, status, userId);

    if (success) {
      addToast(
        action === 'approve' ? 'Đã duyệt yêu cầu thanh toán' : 'Đã từ chối yêu cầu thanh toán',
        action === 'approve' ? 'success' : 'error'
      );
      loadData();
    } else {
      addToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      addToast('Đã copy mã affiliate', 'success');
    } catch {
      addToast('Không copy được mã, thử lại', 'error');
    }
  };

  // Visible payouts
  const visibleWithdrawals = useMemo(() => {
    return payoutTab === 'all'
      ? withdrawals.slice(0, 10)
      : withdrawals.filter(w => w.status === 'pending');
  }, [withdrawals, payoutTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Partners */}
        <div className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white shadow-lg shadow-blue-200/60">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng đối tác</p>
              <h3 className="mt-2 text-4xl font-black leading-none">{stats.totalPartners}</h3>
              <p className="mt-3 text-sm font-medium text-white/75">{stats.activePartners} đang hoạt động</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15">
              <UserCheck size={28} />
            </div>
          </div>
          <button onClick={loadData} className="relative mt-5 flex items-center gap-1 text-xs font-bold text-white/90 hover:text-white">
            <RefreshCw size={12} /> Làm mới
          </button>
        </div>

        {/* Revenue */}
        <div className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-6 text-white shadow-lg shadow-emerald-200/60">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Tổng hoa hồng đã trả</p>
              <h3 className="mt-2 text-3xl font-black leading-none">
                {stats.totalRevenue.toLocaleString('vi-VN')}₫
              </h3>
              <p className="mt-3 text-sm font-medium text-white/75">{stats.pendingCount} yêu cầu rút tiền chờ duyệt</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        {/* Top Partner */}
        <div className="group relative min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 p-6 text-white shadow-lg shadow-purple-200/60">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-white/85">Đối tác nổi bật</p>
              {stats.topPartner ? (
                <>
                  <p className="mt-2 text-lg font-black">{stats.topPartner.name}</p>
                  <p className="max-w-[220px] truncate text-xs text-white/75">{stats.topPartner.email}</p>
                  <p className="mt-3 text-sm text-white/80">Hoa hồng: <b className="text-white">{stats.topPartner.totalCommission.toLocaleString('vi-VN')}₫</b></p>
                </>
              ) : (
                <p className="mt-2 text-sm text-white/70">Chưa có dữ liệu</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/20 p-4 ring-1 ring-white/15">
              <Target size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Withdrawal Requests */}
        <div className="xl:col-span-1 space-y-4">
          <div className="h-fit overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Yêu Cầu Rút Tiền</h3>
                <p className="mt-1 text-xs text-slate-500">Quản lý yêu cầu thanh toán hoa hồng</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-amber-700">{stats.pendingCount} chờ duyệt</p>
                <p className="text-sm font-black text-orange-600">{stats.pendingAmount.toLocaleString('vi-VN')}₫</p>
              </div>
            </div>

            <div className="p-5">
            {/* Tabs */}
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                onClick={() => setPayoutTab('all')}
                className={`rounded-lg px-3 py-1.5 ${payoutTab === 'all' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setPayoutTab('pending')}
                className={`rounded-lg px-3 py-1.5 ${payoutTab === 'pending' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-slate-500'}`}
              >
                Chờ duyệt
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {visibleWithdrawals.map(w => (
                <div key={w.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">{w.user?.name || 'User'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          w.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-rose-100 text-rose-700'
                      }`}>
                      {w.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-slate-500">{w.method}</p>
                      <p className="text-xs text-slate-400">{new Date(w.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <p className="font-bold text-indigo-700 text-lg">{Number(w.amount).toLocaleString('vi-VN')}₫</p>
                  </div>
                  {w.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                      <button
                        className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                        onClick={() => handleWithdrawalAction(w.id, 'approve', w.user_id)}
                      >
                        <CheckCircle size={12} /> Duyệt
                      </button>
                      <button
                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                        onClick={() => handleWithdrawalAction(w.id, 'reject', w.user_id)}
                      >
                        <XCircle size={12} /> Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {visibleWithdrawals.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
                  <DollarSign size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">Không có yêu cầu rút tiền</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Partner List */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          {/* Filter bar */}
          <div className="space-y-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 p-5 md:flex md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <div>
                <h3 className="font-bold text-lg text-slate-900">Danh Sách Đối Tác Affiliate</h3>
                <p className="text-xs text-slate-500">{filteredPartners.length} đối tác, trang {currentPage}/{totalPages}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, email, mã AFF..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white bg-white/90 py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="rounded-xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {paginatedPartners.map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md md:px-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 font-black text-indigo-700 ring-2 ring-white shadow-sm">
                      {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600">
                      <span>Referrals: <b>{p.totalReferrals}</b></span>
                      <span>Hoa hồng: <b>{p.totalCommission.toLocaleString('vi-VN')}₫</b></span>
                      <span>Số dư: <b className="text-indigo-600">{p.availableBalance.toLocaleString('vi-VN')}₫</b></span>
                    </div>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
                      <span className="font-mono text-xs font-bold text-slate-800">{p.affiliateCode}</span>
                      <button
                        onClick={() => handleCopyCode(p.affiliateCode)}
                        className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200"
                        title="Copy mã"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPartners.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Không tìm thấy đối tác phù hợp.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-100 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị {filteredPartners.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredPartners.length)} trên {filteredPartners.length} đối tác
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value) || 10)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}/trang</option>
                ))}
              </select>
              <div className="inline-flex items-center gap-1">
                <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>{'<<'}</button>
                <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>{'<'}</button>
                <span className="px-1">{currentPage}/{totalPages}</span>
                <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>{'>'}</button>
                <button className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{'>>'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateManager;
