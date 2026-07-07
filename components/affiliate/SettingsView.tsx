// components/affiliate/SettingsView.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Bell, Lock, Save, Wallet, Clock,
    CheckCircle, XCircle, AlertCircle, CreditCard, Building2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import {
    createWithdrawalRequest,
    fetchUserWithdrawals,
    getAffiliateStats,
    DbAffiliateWithdrawal
} from '@/lib/affiliate';

interface SettingsViewProps {
    user: {
        id: string;
        name: string;
    };
}

export const SettingsView = ({ user }: SettingsViewProps) => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [withdrawals, setWithdrawals] = useState<DbAffiliateWithdrawal[]>([]);

    const [bankInfo, setBankInfo] = useState({
        bankName: 'Vietcombank',
        accountNumber: '',
        accountHolder: user.name.toUpperCase(),
        branch: ''
    });

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [stats, userWithdrawals] = await Promise.all([
                getAffiliateStats(user.id),
                fetchUserWithdrawals(user.id)
            ]);
            if (stats) {
                setAvailableBalance(stats.availableBalance);
            }
            setWithdrawals(userWithdrawals);
        } catch (error) {
            console.error('Error loading settings data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            addToast('Đã lưu thông tin xác nhận tư vấn thành công!', 'success');
        }, 1000);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);

        if (!amount || amount <= 0) {
            addToast('Vui lòng nhập số tiền hợp lệ', 'error');
            return;
        }

        if (amount > availableBalance) {
            addToast('Số tiền vượt quá số dư khả dụng', 'error');
            return;
        }

        if (amount < 100000) {
            addToast('Số tiền rút tối thiểu là 100.000₫', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const accountInfo = `${bankInfo.bankName} - ${bankInfo.accountNumber} - ${bankInfo.accountHolder}`;
            await createWithdrawalRequest({
                user_id: user.id,
                amount,
                method: 'bank_transfer',
                account_info: accountInfo
            });

            addToast('Yêu cầu rút tiền đã được gửi thành công!', 'success');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            loadData();
        } catch (error) {
            addToast('Có lỗi xảy ra khi gửi yêu cầu', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle size={12} /> Hoàn thành</span>;
            case 'processing':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><Clock size={12} /> Đang xử lý</span>;
            case 'failed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle size={12} /> Thất bại</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold"><AlertCircle size={12} /> Chờ duyệt</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Balance & Withdraw Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-orange-100 text-sm mb-1">Số dư khả dụng</p>
                        <p className="text-3xl font-black">{availableBalance.toLocaleString('vi-VN')}₫</p>
                    </div>
                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={availableBalance < 100000}
                        className="flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Wallet size={18} /> Rút tiền
                    </button>
                </div>
                {availableBalance < 100000 && (
                    <p className="mt-3 text-orange-100 text-sm">⚠️ Số dư tối thiểu để rút tiền là 100.000₫</p>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <Wallet className="text-orange-600" size={22} />
                            Yêu cầu rút tiền
                        </h3>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Số tiền (₫)</label>
                                <input
                                    type="number"
                                    min="100000"
                                    max={availableBalance}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors"
                                    placeholder="Nhập số tiền..."
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Tối thiểu: 100.000₫ | Khả dụng: {availableBalance.toLocaleString('vi-VN')}₫</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Đang gửi...' : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Withdrawal History */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <CreditCard className="text-orange-600" size={18} />
                    <h2 className="font-bold text-slate-900">Lịch sử rút tiền</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-5 py-3">Ngày</th>
                                <th className="px-5 py-3">Số tiền</th>
                                <th className="px-5 py-3">Phương thức</th>
                                <th className="px-5 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {withdrawals.length > 0 ? withdrawals.map((w) => (
                                <tr key={w.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {new Date(w.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                        {w.amount.toLocaleString('vi-VN')}₫
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500">Chuyển khoản</td>
                                    <td className="px-5 py-4">{getStatusBadge(w.status)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-5 py-10 text-center text-slate-400 text-sm">
                                        <CreditCard size={32} className="mx-auto mb-2 text-slate-200" />
                                        Chưa có lịch sử rút tiền
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bank Info Settings */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-orange-600" />
                    Thông tin xác nhận tư vấn
                </h2>

                <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 text-sm">
                    <Lock size={18} />
                    <p>Thông tin xác nhận tư vấn được bảo mật và chỉ dùng để chuyển khoản hoa hồng.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Ngân hàng</label>
                            <select
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors"
                                value={bankInfo.bankName}
                                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                            >
                                <option value="Vietcombank">Vietcombank</option>
                                <option value="Techcombank">Techcombank</option>
                                <option value="MBBank">MBBank</option>
                                <option value="ACB">ACB</option>
                                <option value="VPBank">VPBank</option>
                                <option value="TPBank">TPBank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Chi nhánh</label>
                            <input
                                type="text"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors"
                                value={bankInfo.branch}
                                onChange={(e) => setBankInfo({ ...bankInfo, branch: e.target.value })}
                                placeholder="VD: CN Ho Chi Minh"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Số tài khoản</label>
                            <input
                                type="text"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none font-mono transition-colors"
                                value={bankInfo.accountNumber}
                                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                                placeholder="Nhập số tài khoản..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tên chủ tài khoản</label>
                            <input
                                type="text"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none uppercase transition-colors"
                                value={bankInfo.accountHolder}
                                onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Đang lưu...' : <><Save size={18} /> Lưu thay đổi</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Bell size={18} className="text-orange-600" />
                    Cấu hình thông báo
                </h2>
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl"><DollarSign size={18} /></div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Thông báo hoa hồng mới</p>
                                <p className="text-xs text-slate-500">Nhận email khi có yêu cầu thành công</p>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                        </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Bell size={18} /></div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Tin tức & Chiến dịch mới</p>
                                <p className="text-xs text-slate-500">Nhận thông báo về chương trình bonus</p>
                            </div>
                        </div>
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
