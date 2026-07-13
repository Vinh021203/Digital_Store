'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Calendar,
  Wallet,
  Landmark,
  MoreHorizontal,
  Clock,
  X,
  Check,
  AlertCircle,
  Loader,
  RefreshCcw,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
  getFinanceStats,
  getTransactions,
  getLinkedAccounts,
  requestWithdrawal,
  type FinanceStats,
  type Transaction,
  type LinkedAccount,
  type TransactionType,
} from '@/lib/adminFinance';

type TxFilter = 'all' | 'income' | 'expense' | 'withdraw';

const FinanceManager = () => {
  const { addToast } = useToast();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Real data state
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Transaction filter
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, txData, accountsData] = await Promise.all([
        getFinanceStats(),
        getTransactions(500),
        getLinkedAccounts(),
      ]);
      setStats(statsData);
      setTransactions(txData);
      setLinkedAccounts(accountsData);

      // Set default account
      const defaultAccount = accountsData.find(a => a.is_default);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount.id);
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      addToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter transactions
  const visibleTransactions = useMemo(() => {
    if (txFilter === 'all') return transactions;
    return transactions.filter((t) => t.type === txFilter);
  }, [txFilter, transactions]);

  const totalPages = Math.max(1, Math.ceil(visibleTransactions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return visibleTransactions.slice(start, start + pageSize);
  }, [visibleTransactions, safeCurrentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [txFilter, pageSize]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || Number.isNaN(amount)) {
      addToast('Vui lòng nhập số tiền hợp lệ', 'error');
      return;
    }
    if (amount < 50_000) {
      addToast('Số tiền rút tối thiểu là 50.000₫', 'error');
      return;
    }
    if (stats && amount > stats.availableBalance) {
      addToast('Số dư không đủ', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestWithdrawal(amount, selectedAccount, note);
      if (result.success) {
        addToast(result.message, 'success');
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        setNote('');
        await loadData();
      } else {
        addToast(result.message, 'error');
      }
    } catch (error) {
      addToast('Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Không thể tải dữ liệu</h3>
        <button onClick={loadData} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 md:text-3xl">
            Tài Chính & Dòng Tiền
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCcw size={16} className="text-slate-400" />
            </button>
          </h2>
          <p className="text-sm text-slate-500">
            Tổng quan ví, doanh thu, chi phí và các yêu cầu rút tiền.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} /> Xuất sao kê
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            <ArrowUpRight size={18} /> Rút tiền
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex min-h-[140px] items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Wallet size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Số dư khả dụng
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {formatCurrency(stats.availableBalance)}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-700/70">
              Có thể rút ngay về ngân hàng liên kết.
            </p>
          </div>
        </div>
        <div className="flex min-h-[140px] items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Clock size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-amber-700">
              Đang chờ đối soát
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {formatCurrency(stats.pendingBalance)}
            </p>
            <p className="mt-1 text-xs font-medium text-amber-700/70">
              Từ đơn hàng đang xử lý.
            </p>
          </div>
        </div>
        <div className="flex min-h-[140px] items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <CreditCard size={23} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Dòng tiền tháng này
            </p>
            <p className="text-sm text-emerald-600 font-semibold">
              +{formatCurrency(stats.monthIncome)} thu vào
            </p>
            <p className="text-sm text-rose-600 font-semibold">
              -{formatCurrency(stats.monthExpense)} chi ra
            </p>
          </div>
        </div>
      </div>

      {/* Wallet + Linked accounts */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column: Wallet Cards */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-2 md:grid-cols-2">
          {/* Main Wallet Card */}
          <div className="flex min-h-[270px] flex-col justify-between rounded-2xl border border-indigo-700 bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-200">Ví doanh thu</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{formatCurrency(stats.availableBalance)}</h3>
                <p className="mt-2 text-sm font-medium text-indigo-100">Số dư có thể rút ngay</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20"><Wallet size={24} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-indigo-700/70 p-3 ring-1 ring-white/10"><p className="text-[10px] font-bold uppercase text-indigo-200">Tổng thu</p><p className="mt-1 text-sm font-black">{formatCurrency(stats.totalIncome)}</p></div>
              <div className="rounded-xl bg-indigo-700/70 p-3 ring-1 ring-white/10"><p className="text-[10px] font-bold uppercase text-indigo-200">Đã rút</p><p className="mt-1 text-sm font-black">{formatCurrency(stats.totalWithdrawals)}</p></div>
            </div>
          </div>

          {/* Pending Balance Card */}
          <div className="flex min-h-[270px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.16em] mb-1">
                  Đang chờ xử lý
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                  {formatCurrency(stats.pendingBalance)}
                </h3>
                <p className="text-xs text-slate-500">
                  Tiền từ đơn hàng đang xử lý. Sau khi hoàn tất, số dư sẽ cộng vào ví chính.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">Chi phí platform:</span>
              <span className="font-semibold text-slate-900">
                ~15% phí giao dịch
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Linked accounts */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Landmark size={20} /></div><h3 className="font-black text-slate-900">Tài khoản liên kết</h3></div>
            <span className="text-[11px] text-slate-400">
              Sử dụng khi rút tiền
            </span>
          </div>
          <div className="space-y-3">
            {linkedAccounts.map((account) => (
              <div
                key={account.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${account.is_default ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${account.type === 'bank' ? 'bg-green-50' : 'bg-pink-50'}`}>
                  {account.type === 'bank' ? (
                    <Landmark size={24} className="text-green-600" />
                  ) : (
                    <Wallet size={24} className="text-pink-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">
                    {account.name}
                  </p>
                  <p className="text-xs text-slate-500">{account.account_number}</p>
                </div>
                {account.is_default ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Mặc định
                  </span>
                ) : (
                  <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}

            <button className="mt-1 w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 transition-colors hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600">
              + Thêm tài khoản mới
            </button>
          </div>

          <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
            <p>
              Lưu ý: Tên chủ tài khoản ngân hàng phải trùng với tên doanh
              nghiệp hoặc chủ sở hữu ví để tránh bị ngân hàng từ chối.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Lịch sử giao dịch
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi chi tiết các giao dịch vào/ra ví trong thời gian gần đây.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-xs">
              <button
                onClick={() => setTxFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold ${txFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTxFilter('income')}
                className={`px-3 py-1 rounded-md font-semibold ${txFilter === 'income'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Thu nhập
              </button>
              <button
                onClick={() => setTxFilter('expense')}
                className={`px-3 py-1 rounded-md font-semibold ${txFilter === 'expense'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Chi tiêu
              </button>
              <button
                onClick={() => setTxFilter('withdraw')}
                className={`px-3 py-1 rounded-md font-semibold ${txFilter === 'withdraw'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Rút tiền
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold tracking-wide">
              <tr>
                <th className="px-6 py-3.5">Giao dịch</th>
                <th className="px-6 py-3.5">Nội dung</th>
                <th className="px-6 py-3.5">Thời gian</th>
                <th className="px-6 py-3.5">Phương thức</th>
                <th className="px-6 py-3.5 text-right">Số tiền</th>
                <th className="px-6 py-3.5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedTransactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-600'
                            : trx.type === 'expense'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                      >
                        {trx.type === 'income' ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {trx.id}
                        </p>
                        <p
                          className={`text-[10px] font-semibold uppercase ${trx.status === 'completed'
                              ? 'text-emerald-600'
                              : trx.status === 'pending'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                        >
                          {trx.status}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-600 font-medium">
                    {trx.description}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">
                    {formatDate(trx.created_at)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold">
                      {trx.method}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-3.5 text-right font-bold ${trx.type === 'income'
                        ? 'text-emerald-600'
                        : trx.type === 'expense'
                          ? 'text-slate-900'
                          : 'text-amber-700'
                      }`}
                  >
                    {trx.type === 'income' ? '+' : '-'}
                    {formatCurrency(trx.amount)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-slate-400 hover:text-slate-700">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {visibleTransactions.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-12 text-center"
                    colSpan={6}
                  >
                    <DollarSign size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Không có giao dịch phù hợp với bộ lọc hiện tại.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {visibleTransactions.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Hiển thị <b>{(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, visibleTransactions.length)}</b> / {visibleTransactions.length} giao dịch
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold">Mỗi trang</span>
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value) as 10 | 20 | 50)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Trước</button>
              <span className="min-w-[72px] text-center font-bold">{safeCurrentPage}/{totalPages}</span>
              <button disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight size={20} className="text-indigo-600" />
                Tạo yêu cầu rút tiền
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleWithdraw}
              className="p-5 md:p-6 space-y-5"
            >
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-700 uppercase">
                    Số dư khả dụng
                  </p>
                  <p className="text-lg font-bold text-indigo-900">
                    {formatCurrency(stats.availableBalance)}
                  </p>
                </div>
                <span className="text-[11px] text-indigo-600 bg-white/60 px-2 py-1 rounded-full border border-indigo-100">
                  Rút tối đa 90%/lần
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Số tiền muốn rút
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    placeholder="Nhập số tiền..."
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 font-bold text-slate-900 text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                    VNĐ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> Tối thiểu 50.000₫, tối đa{' '}
                  {formatCurrency(stats.availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nhận qua tài khoản
                </label>
                <div className="space-y-2">
                  {linkedAccounts.map((account) => (
                    <label
                      key={account.id}
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedAccount === account.id
                          ? 'border-indigo-600 bg-indigo-50/60'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="account"
                        className="w-4 h-4 accent-indigo-600"
                        checked={selectedAccount === account.id}
                        onChange={() => setSelectedAccount(account.id)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">
                          {account.name}
                        </p>
                        <p className="text-xs text-slate-500">{account.account_number}</p>
                      </div>
                      {account.is_default && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Khuyến nghị
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Nội dung chuyển khoản để tiện đối soát..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  Xác nhận rút tiền
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Thời gian xử lý dự kiến 5–15 phút với ví điện tử, 1–2 giờ với ngân hàng.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
