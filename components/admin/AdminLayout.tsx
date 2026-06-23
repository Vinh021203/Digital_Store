'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, Package, ShoppingBag, Box, MessageSquare, Users,
    BarChart3, Settings, LogOut, BookOpen, Menu, Bell, Search, Home,
    ChevronRight, FileText, Tag, Shield, CreditCard, Globe, HelpCircle,
    UserPlus, LifeBuoy, Image as ImageIcon, History, LayoutGrid,
    Maximize2, Minimize2, Moon, Sun, Bookmark, Command, X, Check,
    TrendingUp, AlertCircle, ChevronDown, Sparkles, Zap, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: 'red' | 'green' | 'blue' | 'amber';
    isNew?: boolean;
    href: string;
}

// ✅ Enhanced Menu Structure for Digital Marketplace
const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
    {
        title: "TỔNG QUAN",
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
            { id: 'reports', label: 'Báo cáo doanh thu', icon: <BarChart3 size={20} />, badge: '↑ 24%', badgeColor: 'green', href: '/admin/reports' },
            { id: 'activity', label: 'Nhật ký hoạt động', icon: <History size={20} />, href: '/admin/reports/activity' },
        ]
    },
    {
        title: "QUẢN LÝ BÁN HÀNG",
        items: [
            { id: 'orders', label: 'Đơn hàng', icon: <ShoppingBag size={20} />, badge: '12', badgeColor: 'red', href: '/admin/orders' },
            { id: 'orders-kanban', label: 'Kanban Board', icon: <LayoutGrid size={20} />, isNew: true, href: '/admin/orders/kanban' },
            { id: 'products', label: 'Giao diện website', icon: <Package size={20} />, href: '/admin/products' },
            { id: 'licenses', label: 'Licenses', icon: <Shield size={20} />, badge: 'New', badgeColor: 'amber', href: '/admin/products/licenses' },
        ]
    },
    {
        title: "MARKETPLACE",
        items: [
            { id: 'sellers', label: 'Người bán', icon: <Users size={20} />, badge: '156', badgeColor: 'blue', href: '/admin/marketplace/sellers' },
            { id: 'pending-products', label: 'Duyệt sản phẩm', icon: <Box size={20} />, badge: '8', badgeColor: 'red', href: '/admin/marketplace/pending' },
            { id: 'transactions', label: 'Giao dịch & Phí', icon: <CreditCard size={20} />, href: '/admin/marketplace/transactions' },
        ]
    },
    {
        title: "KHÁCH HÀNG & HỖ TRỢ",
        items: [
            { id: 'customers', label: 'Khách hàng', icon: <Users size={20} />, href: '/admin/customers' },
            { id: 'reviews', label: 'Đánh giá & Feedback', icon: <MessageSquare size={20} />, href: '/admin/customers/reviews' },
            { id: 'support', label: 'Hỗ trợ (Tickets)', icon: <LifeBuoy size={20} />, badge: '5', badgeColor: 'red', href: '/admin/customers/support' },
        ]
    },
    {
        title: "MARKETING & NỘI DUNG",
        items: [
            { id: 'marketing', label: 'Mã giảm giá', icon: <Tag size={20} />, href: '/admin/marketing' },
            { id: 'blog', label: 'Bài viết Blog', icon: <FileText size={20} />, href: '/admin/marketing/blog' },
            { id: 'comments', label: 'Bình luận Blog', icon: <MessageSquare size={20} />, href: '/admin/marketing/blog/comments' },
            { id: 'affiliate', label: 'Đối tác Affiliate', icon: <Globe size={20} />, badge: 'Hot', badgeColor: 'amber', href: '/admin/marketing/affiliate' },
            { id: 'community', label: 'Cộng đồng', icon: <MessageSquare size={20} />, href: '/admin/community' },
        ]
    },
    {
        title: "HỆ THỐNG",
        items: [
            { id: 'notifications', label: 'Thông báo', icon: <Bell size={20} />, href: '/admin/notifications' },
            { id: 'settings', label: 'Cài đặt hệ thống', icon: <Settings size={20} />, href: '/admin/settings' },
            { id: 'finance', label: 'Tài chính & Rút tiền', icon: <CreditCard size={20} />, href: '/admin/settings/finance' },
            { id: 'roles', label: 'Phân quyền', icon: <Shield size={20} />, badge: 'Pro', badgeColor: 'blue', href: '/admin/settings/roles' },
        ]
    }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsNotiOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const getCurrentTitle = () => {
        for (const group of MENU_GROUPS) {
            const found = group.items.find(i => i.href === pathname);
            if (found) return found.label;
        }
        return 'Dashboard';
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const notifications = [
        { id: 1, title: 'Đơn hàng mới #EDU-009', desc: 'Nguyễn Văn A vừa mua khóa học ReactJS.', time: '5 phút trước', read: false, type: 'order' },
        { id: 2, title: 'Ticket hỗ trợ mới', desc: 'Lỗi không xem được video bài 3.', time: '10 phút trước', read: false, type: 'support' },
        { id: 3, title: 'Cảnh báo tồn kho', desc: 'Sách "Rừng Na Uy" sắp hết hàng (còn 5).', time: '1 giờ trước', read: true, type: 'warning' },
        { id: 4, title: 'Review 5 sao mới', desc: 'Khóa học ReactJS nhận đánh giá 5 sao.', time: '2 giờ trước', read: true, type: 'review' },
    ];

    const badgeColors = {
        red: 'bg-red-500/20 text-red-600',
        green: 'bg-orange-500/20 text-orange-600',
        blue: 'bg-blue-500/20 text-blue-600',
        amber: 'bg-amber-500/20 text-amber-600',
    };

    const notificationIcons = {
        order: <ShoppingBag size={16} className="text-blue-500" />,
        support: <LifeBuoy size={16} className="text-orange-500" />,
        warning: <AlertCircle size={16} className="text-red-500" />,
        review: <MessageSquare size={16} className="text-green-500" />,
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans ${darkMode ? 'dark' : ''}`}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-scale-up">
                        {/* Search Input */}
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Search size={20} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đơn hàng, sản phẩm, học viên..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 text-lg outline-none text-slate-900 placeholder:text-slate-400"
                                    autoFocus
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Quick Actions</p>
                            <div className="space-y-1">
                                {[
                                    { label: 'Tạo đơn hàng mới', icon: <UserPlus size={16} />, shortcut: '⌘N' },
                                    { label: 'Xem báo cáo', icon: <BarChart3 size={16} />, shortcut: '⌘R' },
                                    { label: 'Thêm sản phẩm', icon: <Package size={16} />, shortcut: '⌘P' },
                                ].map((action, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            const paths = ['/admin/orders', '/admin/reports', '/admin/products/new'];
                                            router.push(paths[idx]);
                                            setIsSearchOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 group-hover:text-orange-600">{action.icon}</span>
                                            <span className="text-sm font-medium text-slate-700">{action.label}</span>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{action.shortcut}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIDEBAR --- */}
            <aside
                className={`fixed lg:sticky top-0 h-screen bg-[#0f172a] text-slate-300 z-40 transform transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-r border-slate-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${sidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}
            >
                {/* Logo Area */}
                <div className="relative h-20 flex items-center justify-center px-4 border-b border-slate-800/60 bg-[#0f172a]">
                    {!sidebarCollapsed && (
                        <div className="relative flex h-12 w-[205px] items-center justify-center">
                            <img
                                src="/logo_webgiare_footer.webp"
                                alt="Shop Web rẻ"
                                className="max-h-full w-full object-contain object-center"
                            />
                        </div>
                    )}

                    {/* Collapse Toggle - Desktop Only */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`${sidebarCollapsed ? '' : 'absolute right-4'} hidden lg:flex w-7 h-7 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all`}
                        title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-180" />}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
                    {MENU_GROUPS.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            {!sidebarCollapsed && (
                                <h3 className="px-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
                                    {group.title}
                                </h3>
                            )}
	                            <ul className={sidebarCollapsed ? 'space-y-2' : 'space-y-1'}>
	                                {group.items.map(item => {
	                                    const isActive = pathname === item.href;
	                                    return (
	                                        <li key={item.id} className={`group/item ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
	                                            <Link
	                                                href={item.href}
	                                                onClick={() => setSidebarOpen(false)}
	                                                className={`relative flex items-center text-sm font-medium transition-all duration-200 group ${sidebarCollapsed
	                                                    ? `h-12 w-12 justify-center rounded-2xl p-0 ${isActive
	                                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/40 ring-1 ring-orange-300/25'
	                                                        : 'text-slate-500 hover:bg-slate-800/70 hover:text-slate-200'}`
	                                                    : `w-full justify-between rounded-xl px-4 py-3 ${isActive
	                                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-900/50'
	                                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-orange-300'}`
	                                                    }`}
	                                                title={sidebarCollapsed ? item.label : ''}
	                                            >
	                                                {/* Left side */}
	                                                <div className={`flex items-center min-w-0 ${sidebarCollapsed ? 'justify-center' : 'flex-1 gap-3'}`}>
	                                                    <span className={`flex-shrink-0 transition-all duration-200 ${sidebarCollapsed ? '[&>svg]:h-5 [&>svg]:w-5' : ''} ${isActive ? 'text-white' : sidebarCollapsed ? 'text-slate-500 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-orange-400'}`}>
	                                                        {item.icon}
	                                                    </span>
                                                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                                </div>

                                                {/* Badges - Only show when not collapsed */}
                                                {!sidebarCollapsed && (
                                                    <div className="ml-2 flex-shrink-0">
                                                        {item.badge && (
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isActive ? 'bg-white/20 text-white' : badgeColors[item.badgeColor || 'blue']
                                                                }`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        {item.isNew && !item.badge && (
                                                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 whitespace-nowrap">
                                                                <Sparkles size={10} /> NEW
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Active Indicator */}
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                {!sidebarCollapsed ? (
                    <div className="p-4 border-t border-slate-800 bg-[#0b1120] space-y-3">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                                <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                                    <TrendingUp size={12} />
                                    <span className="text-[10px] font-bold">Doanh thu</span>
                                </div>
                                <p className="text-white text-sm font-bold">156M</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                                <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                                    <ShoppingBag size={12} />
                                    <span className="text-[10px] font-bold">Đơn hàng</span>
                                </div>
                                <p className="text-white text-sm font-bold">342</p>
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer">
                            <div className="relative">
                                <img src={user?.avatar} className="w-10 h-10 rounded-lg border border-slate-600 object-cover" alt="Admin" />
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-slate-800 rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">Super Admin</p>
                            </div>
                            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Đăng xuất">
                                <LogOut size={16} />
                            </button>
                        </div>

                        <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-800 hover:text-white transition-all">
                            <Home size={14} /> Xem Website
                        </Link>
                    </div>
                ) : (
                    // Collapsed Footer
                    <div className="p-4 border-t border-slate-800 bg-[#0b1120] flex flex-col items-center gap-3">
                        <div className="relative">
                            <img src={user?.avatar} className="w-10 h-10 rounded-lg border border-slate-600 object-cover" alt="Admin" />
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-slate-800 rounded-full"></span>
                        </div>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800" title="Đăng xuất">
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">

                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-100/50 dark:from-orange-900/20 to-transparent pointer-events-none"></div>

                {/* Header */}
                <header className="h-20 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm">

                    {/* Left: Title & Time */}
                    <div className="flex items-center gap-6 flex-1">
                        <button className="lg:hidden text-slate-500 hover:text-orange-600 transition-colors" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <Home size={14} />
                            <ChevronRight size={14} />
                            <span className="hover:text-orange-600 cursor-pointer transition-colors">Admin</span>
                            <ChevronRight size={14} />
                            <span className="font-bold text-slate-800">{getCurrentTitle()}</span>
                        </div>

                        {/* Live Time - Desktop Only */}
                        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 transition-all group"
                        >
                            <Search size={16} className="group-hover:text-orange-600" />
                            <span className="text-xs">Tìm kiếm...</span>
                            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300">⌘K</kbd>
                        </button>

                        {/* Mobile Search */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-2.5 text-slate-500 hover:bg-slate-100 hover:text-orange-600 rounded-lg transition-all"
                        >
                            <Search size={20} />
                        </button>

                        {/* Add New Button */}
                        <button
                            type="button"
                            onClick={() => router.push('/admin/products/new')}
                            className="hidden sm:flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-0.5 transition-all"
                        >
                            <UserPlus size={16} /> <span className="hidden lg:inline">Thêm mới</span>
                        </button>

                        <div className="w-px h-8 bg-slate-200"></div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-orange-600 rounded-lg transition-all"
                            title={darkMode ? "Light Mode" : "Dark Mode"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotiOpen(!isNotiOpen)}
                                className={`relative p-2.5 rounded-lg transition-all hover:shadow-md ${isNotiOpen ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-100 hover:text-orange-600'}`}
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>

                            {isNotiOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)}></div>
                                    <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                                        {/* Header */}
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-purple-50">
                                            <div>
                                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                    <Bell size={16} className="text-orange-600" />
                                                    Thông báo
                                                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                                        {notifications.filter(n => !n.read).length}
                                                    </span>
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => router.push('/admin/notifications')}
                                                className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Check size={12} /> Đánh dấu đã đọc
                                            </button>
                                        </div>

                                        {/* Notifications List */}
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 transition-all ${!n.read ? 'bg-orange-50/30' : ''}`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        {notificationIcons[n.type as keyof typeof notificationIcons]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                                            {!n.read && <span className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1"></span>}
                                                        </div>
                                                        <p className="text-xs text-slate-600 mb-1 line-clamp-2">{n.desc}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <Clock size={10} /> {n.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsNotiOpen(false);
                                                    router.push('/admin/notifications');
                                                }}
                                                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                                            >
                                                Xem tất cả thông báo →
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Help */}
                        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 hover:text-orange-600 rounded-lg transition-all" title="Trợ giúp">
                            <HelpCircle size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
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

                @keyframes scale-up {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out;
                }

                .animate-scale-up {
                    animation: scale-up 0.2s ease-out;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
