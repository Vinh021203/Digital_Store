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

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, txData, accountsData] = await Promise.all([
        getFinanceStats(),
        getTransactions(20),
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
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
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
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-slate-400/40"
          >
            <ArrowUpRight size={18} /> Rút tiền
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Số dư khả dụng
            </p>
            <p className="text-lg md:text-xl font-bold text-slate-900">
              {formatCurrency(stats.availableBalance)}
            </p>
            <p className="text-[11px] text-slate-400">
              Có thể rút ngay về ngân hàng liên kết.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Đang chờ đối soát
            </p>
            <p className="text-lg md:text-xl font-bold text-slate-900">
              {formatCurrency(stats.pendingBalance)}
            </p>
            <p className="text-[11px] text-slate-400">
              Từ đơn hàng đang xử lý.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-300">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Wallet Card */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-3xl p-7 md:p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Landmark size={200} />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.18em] mb-1">
                    Số dư khả dụng
                  </p>
                  <h3 className="text-3xl md:text-4xl font-mono font-bold tracking-tight">
                    {formatCurrency(stats.availableBalance)}
                  </h3>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded-md border border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-orange-500/80 -mr-3" />
                  <div className="w-6 h-6 rounded-full bg-red-500/80" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-8 mb-5">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Tổng thu
                    </p>
                    <p className="font-medium tracking-wide text-emerald-400">
                      {formatCurrency(stats.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Đã rút
                    </p>
                    <p className="font-medium tracking-wide">
                      {formatCurrency(stats.totalWithdrawals)}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-slate-400 tracking-[0.28em] text-sm">
                  **** **** **** 8899
                </p>
              </div>
            </div>
          </div>

          {/* Pending Balance Card */}
          <div className="bg-white rounded-3xl p-7 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-10 -mt-10 blur-2xl" />
            <div className="space-y-4">
              <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
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
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900">Tài Khoản Liên Kết</h3>
            <span className="text-[11px] text-slate-400">
              Sử dụng khi rút tiền
            </span>
          </div>
          <div className="space-y-3">
            {linkedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-pointer"
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

            <button className="w-full mt-1 py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-colors">
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Lịch Sử Giao Dịch
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi chi tiết các giao dịch vào/ra ví trong thời gian gần đây.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 text-xs">
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
              {visibleTransactions.map((trx) => (
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
      </div>

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight size={20} className="text-indigo-600" />
                Rút tiền về ngân hàng
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
