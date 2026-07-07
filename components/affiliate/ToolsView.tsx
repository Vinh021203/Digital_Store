// components/affiliate/ToolsView.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, ArrowRight, Link as LinkIcon, QrCode, Share2, ExternalLink, CheckCircle, Home, Package, Star, BookOpen, type LucideIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ToolsViewProps {
    user: {
        affiliateCode: string;
    };
}

export const ToolsView = ({ user }: ToolsViewProps) => {
    const { addToast } = useToast();
    const [genLink, setGenLink] = useState('');
    const [resultLink, setResultLink] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!genLink) return;
        let cleanLink = genLink.split('?')[0];
        setResultLink(`${cleanLink}?ref=${user.affiliateCode}`);
        addToast('Đã tạo link affiliate thành công!', 'success');
    };

    const handleCopy = (text: string, id?: string) => {
        navigator.clipboard.writeText(text);
        addToast('Đã sao chép link!', 'success');
        if (id) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const quickLinks: { id: string; label: string; path: string; icon: LucideIcon }[] = [
        { id: 'home', label: 'Trang chủ', path: '/', icon: Home },
        { id: 'products', label: 'Danh sách mẫu demo', path: '/products', icon: Package },
        { id: 'featured', label: 'Mẫu demo nổi bật', path: '/products?featured=true', icon: Star },
        { id: 'courses', label: 'Khóa học', path: '/products?category=courses', icon: BookOpen },
    ];

    return (
        <div className="space-y-6">
            {/* Link Generator */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <LinkIcon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Tạo Link Affiliate</h2>
                            <p className="text-orange-100 text-sm">Dán link bất kỳ để gắn mã giới thiệu của bạn</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            type="url"
                            placeholder="Ví dụ: https://webgiare.id.vn/product/giao-dien-website"
                            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-orange-500 outline-none transition-colors"
                            value={genLink}
                            onChange={(e) => setGenLink(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                            <LinkIcon size={18} />
                            Tạo Link
                        </button>
                    </form>

                    {resultLink && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Link Affiliate của bạn:</p>
                            <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                <div className="flex-1 bg-white border border-orange-200 p-3 rounded-lg font-mono text-sm text-slate-600 break-all">
                                    {resultLink}
                                </div>
                                <button
                                    onClick={() => handleCopy(resultLink)}
                                    className="flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                                >
                                    <Copy size={16} /> Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Share2 size={18} className="text-orange-600" />
                    Link nhanh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickLinks.map((item) => {
                        const fullLink = `${typeof window !== 'undefined' ? window.location.origin : ''}${item.path}${item.path.includes('?') ? '&' : '?'}ref=${user.affiliateCode}`;
                        const isCopied = copiedId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                        <item.icon size={20} className="text-orange-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-orange-600 transition-colors">{item.label}</span>
                                </div>
                                <button
                                    onClick={() => handleCopy(fullLink, item.id)}
                                    className={`flex items-center gap-1 font-bold text-sm px-3 py-1.5 rounded-lg transition-all ${isCopied
                                        ? 'bg-green-500 text-white'
                                        : 'text-orange-600 hover:bg-orange-100'
                                        }`}
                                >
                                    {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    {isCopied ? 'Đã copy' : 'Copy'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Banner Downloads */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ExternalLink size={18} className="text-orange-600" />
                    Banner quảng cáo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-slate-200 border-dashed rounded-xl p-4 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                        <div className="aspect-[2/1] bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg mb-4 flex items-center justify-center text-white font-bold">
                            Banner 600x300
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Size: 600x300</span>
                            <button
                                type="button"
                                onClick={() => addToast('Banner 600x300 đang được chuẩn bị để tải xuống.', 'info')}
                                className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1"
                            >
                                Tải xuống <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="border-2 border-slate-200 border-dashed rounded-xl p-4 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                        <div className="aspect-square max-h-40 mx-auto bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg mb-4 flex items-center justify-center text-white font-bold">
                            300x300
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Size: 300x300</span>
                            <button
                                type="button"
                                onClick={() => addToast('Banner 300x300 đang được chuẩn bị để tải xuống.', 'info')}
                                className="text-orange-600 font-bold text-sm hover:underline flex items-center gap-1"
                            >
                                Tải xuống <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolsView;
