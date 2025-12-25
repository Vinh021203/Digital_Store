'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search, Filter, Grid, List, ChevronDown, Star, Download, Eye,
    Heart, ShoppingCart, Home, ChevronRight, Loader2, X, SlidersHorizontal,
    Check, ArrowUpDown, Tag, Zap, LayoutGrid
} from 'lucide-react';
import { fetchActiveProducts, type DbProduct } from '@/lib/products';
import { fetchCategories } from '@/lib/categories';
import { ProductCard } from '@/components/product';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useCart } from '@/context/CartContext';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useCallback } from 'react';

// Filter Section Accordion Component
const FilterSection = ({
    title,
    icon: Icon,
    children,
    defaultOpen = true
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-100 py-3 sm:py-4 first:pt-0 last:border-0 last:pb-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full group ${isOpen ? 'mb-3' : 'mb-0'}`}
            >
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 group-hover:text-orange-600 transition-colors">
                    <Icon size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" /> {title}
                </h3>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Filter Sidebar Component
const FilterSidebar = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    rating,
    setRating,
    format,
    setFormat,
    isOpen,
    onClose
}: {
    categories: any[];
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    priceRange: [number, number];
    setPriceRange: (v: [number, number]) => void;
    rating: number | null;
    setRating: (v: number | null) => void;
    format: string;
    setFormat: (v: string) => void;
    isOpen: boolean;
    onClose: () => void;
}) => {
    return (
        <>
            {/* Desktop Sidebar - Always visible, sticky */}
            <aside className="hidden lg:block sticky top-20 z-40 flex-shrink-0 w-72">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    {/* Categories */}
                    <FilterSection title="Danh mục" icon={LayoutGrid}>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${!selectedCategory ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <span>Tất cả sản phẩm</span>
                                {!selectedCategory && <Check size={14} />}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${selectedCategory === cat.slug ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span>{cat.name}</span>
                                    {selectedCategory === cat.slug && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Price Range */}
                    <FilterSection title="Khoảng giá" icon={Tag}>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>{priceRange[0].toLocaleString()}đ</span>
                                <span>{priceRange[1] >= 5000000 ? '5tr+' : priceRange[1].toLocaleString() + 'đ'}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="5000000"
                                step="100000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                            />
                            <div className="flex flex-wrap gap-2">
                                {[0, 200000, 500000, 1000000].map(price => (
                                    <button
                                        key={price}
                                        onClick={() => setPriceRange([0, price > 0 ? price : 5000000])}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${priceRange[1] === (price || 5000000) ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                                    >
                                        {price === 0 ? 'Tất cả' : `<${(price / 1000)}k`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FilterSection>

                    {/* Format */}
                    <FilterSection title="Định dạng" icon={Zap}>
                        <div className="space-y-2">
                            {['All', 'Theme', 'Template', 'Landing', 'MiniApp'].map(f => (
                                <label key={f} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${format === f || (format === '' && f === 'All') ? 'bg-orange-600 border-orange-600' : 'bg-white border-slate-300 group-hover:border-orange-400'}`}>
                                        {(format === f || (format === '' && f === 'All')) && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="format"
                                        className="hidden"
                                        checked={format === f || (format === '' && f === 'All')}
                                        onChange={() => setFormat(f === 'All' ? '' : f)}
                                    />
                                    <span className={`text-sm ${format === f || (format === '' && f === 'All') ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                        {f === 'All' ? 'Tất cả' : f}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </FilterSection>

                    {/* Rating */}
                    <FilterSection title="Đánh giá" icon={Star} defaultOpen={false}>
                        <div className="space-y-2">
                            {[5, 4, 3].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRating(rating === r ? null : r)}
                                    className={`flex items-center justify-between text-sm w-full p-2.5 rounded-lg transition-colors group ${rating === r ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < r ? 'currentColor' : 'none'} className={i >= r ? 'text-slate-300' : ''} />
                                            ))}
                                        </div>
                                        <span>Trở lên</span>
                                    </div>
                                    {rating === r && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </FilterSection>
                </div>
            </aside>

            {/* Mobile Sidebar - Fixed overlay */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full overflow-y-auto p-4 sm:p-5 custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Bộ Lọc</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="bg-white">
                        <FilterSection title="Danh mục" icon={LayoutGrid}>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${!selectedCategory ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span>Tất cả sản phẩm</span>
                                    {!selectedCategory && <Check size={14} />}
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${selectedCategory === cat.slug ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <span>{cat.name}</span>
                                        {selectedCategory === cat.slug && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Range */}
                        <FilterSection title="Khoảng giá" icon={Tag}>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                    <span>{priceRange[0].toLocaleString()}đ</span>
                                    <span>{priceRange[1] >= 5000000 ? '5tr+' : priceRange[1].toLocaleString() + 'đ'}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000000"
                                    step="100000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {[0, 200000, 500000, 1000000].map(price => (
                                        <button
                                            key={price}
                                            onClick={() => setPriceRange([0, price > 0 ? price : 5000000])}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${priceRange[1] === (price || 5000000) ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                                        >
                                            {price === 0 ? 'Tất cả' : `<${(price / 1000)}k`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FilterSection>

                        {/* Format */}
                        <FilterSection title="Định dạng" icon={Zap}>
                            <div className="space-y-2">
                                {['All', 'Theme', 'Template', 'Landing', 'MiniApp'].map(f => (
                                    <label key={f} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${format === f || (format === '' && f === 'All') ? 'bg-orange-600 border-orange-600' : 'bg-white border-slate-300 group-hover:border-orange-400'}`}>
                                            {(format === f || (format === '' && f === 'All')) && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="format"
                                            className="hidden"
                                            checked={format === f || (format === '' && f === 'All')}
                                            onChange={() => setFormat(f === 'All' ? '' : f)}
                                        />
                                        <span className={`text-sm ${format === f || (format === '' && f === 'All') ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                            {f === 'All' ? 'Tất cả' : f}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Rating */}
                        <FilterSection title="Đánh giá" icon={Star} defaultOpen={false}>
                            <div className="space-y-2">
                                {[5, 4, 3].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRating(rating === r ? null : r)}
                                        className={`flex items-center justify-between text-sm w-full p-2.5 rounded-lg transition-colors group ${rating === r ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < r ? 'currentColor' : 'none'} className={i >= r ? 'text-slate-300' : ''} />
                                                ))}
                                            </div>
                                            <span>Trở lên</span>
                                        </div>
                                        {rating === r && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>
                    </div>
                </div>
            </aside>
        </>
    );
};

function ProductsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showSidebar, setShowSidebar] = useState(false);

    // Quick View state
    const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const handleQuickView = useCallback((product: any) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    }, []);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [formatFilter, setFormatFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, priceRange, ratingFilter, formatFilter, sortBy]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    fetchActiveProducts(),
                    fetchCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);

                // Get URL params
                const cat = searchParams.get('category');
                const search = searchParams.get('search');
                if (cat) setSelectedCategory(cat);
                if (search) setSearchTerm(search);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [searchParams]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            result = result.filter(p => p.category?.slug === selectedCategory);
        }

        if (formatFilter) {
            result = result.filter(p => p.format === formatFilter);
        }

        if (ratingFilter) {
            result = result.filter(p => (p.rating || 0) >= ratingFilter);
        }

        result = result.filter(p => p.price >= priceRange[0] && (priceRange[1] >= 5000000 ? true : p.price <= priceRange[1]));

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => b.downloads_count - a.downloads_count);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default: // newest
                result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return result;
    }, [products, searchTerm, selectedCategory, sortBy, priceRange, ratingFilter, formatFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll effectively to top of list
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Professional Hero Section - Mobile Optimized */}
            <div className="bg-slate-900 relative overflow-hidden text-white">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 z-10">
                    <div className="max-w-3xl">
                        {/* Badge - Smaller on mobile */}
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
                            <Star size={10} className="sm:w-3 sm:h-3" fill="currentColor" /> Premium Marketplace
                        </div>

                        {/* Title - Responsive sizes */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-3 sm:mb-4 md:mb-6 leading-tight">
                            Khám phá Kho Tài Nguyên{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200 block sm:inline">
                                Chất Lượng Cao
                            </span>
                        </h1>

                        {/* Description - Hidden on very small screens */}
                        <p className="hidden sm:block text-slate-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-2xl">
                            Hàng ngàn theme, template, và công cụ hỗ trợ công việc của bạn.
                        </p>

                        {/* Search Bar - Compact on mobile */}
                        <div className="relative max-w-xl">
                            <input
                                type="text"
                                placeholder="Tìm kiếm themes, plugins..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:bg-white/20 focus:border-orange-500/50 outline-none backdrop-blur-sm transition-all shadow-xl text-sm sm:text-base"
                            />
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-4 sm:py-6 md:py-10">
                {/* Mobile Filter Bar - Compact & Functional */}
                <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-slate-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
                    {/* Results Count */}
                    <div className="text-xs text-slate-500 mb-2">
                        <span className="font-bold text-slate-900">{filteredProducts.length}</span> sản phẩm
                        {selectedCategory && <span> trong <span className="text-orange-600 font-semibold">{categories.find(c => c.slug === selectedCategory)?.name}</span></span>}
                    </div>

                    {/* Filter & Sort Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-white px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 text-xs sm:text-sm active:scale-[0.98] transition-transform"
                        >
                            <SlidersHorizontal size={14} /> Bộ lọc
                            {(selectedCategory || formatFilter || ratingFilter) && (
                                <span className="w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">!</span>
                            )}
                        </button>
                        <div className="flex-1 relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full appearance-none px-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none shadow-sm pr-7"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="popular">Phổ biến</option>
                                <option value="price-asc">Giá ↑</option>
                                <option value="price-desc">Giá ↓</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 lg:gap-8 items-start">
                    {/* Sidebar - Works for both Desktop (visible) and Mobile (fixed overlay) */}
                    <FilterSidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        rating={ratingFilter}
                        setRating={setRatingFilter}
                        format={formatFilter}
                        setFormat={setFormatFilter}
                        isOpen={showSidebar}
                        onClose={() => setShowSidebar(false)}
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 w-full">
                        {/* Toolbar */}
                        <div className="hidden lg:flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4">
                                <span className="text-slate-500 font-medium text-sm">Hiển thị {filteredProducts.length} kết quả</span>
                                <div className="h-4 w-px bg-slate-200" />
                                <div className="flex gap-2">
                                    {['newest', 'popular', 'rating'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setSortBy(opt)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sortBy === opt ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            {opt === 'newest' ? 'Mới nhất' : opt === 'popular' ? 'Phổ biến' : 'Đánh giá'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Sắp xếp:</span>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer"
                                    >
                                        <option value="newest">Mặc định</option>
                                        <option value="price-asc">Giá: Thấp đến Cao</option>
                                        <option value="price-desc">Giá: Cao đến Thấp</option>
                                    </select>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Loading / Error / Empty States */}
                        {loading ? (
                            <ProductGridSkeleton count={6} viewMode={viewMode} />
                        ) : filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center border border-slate-100 shadow-sm">
                                <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Search size={24} className="text-slate-300 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
                                <p className="text-slate-500 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 max-w-md mx-auto">
                                    Hãy thử điều chỉnh lại từ khóa hoặc bộ lọc.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('');
                                        setPriceRange([0, 5000000]);
                                        setRatingFilter(null);
                                        setFormatFilter('');
                                    }}
                                    className="bg-slate-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold hover:bg-orange-600 transition-colors text-xs sm:text-sm"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Product Grid - Optimized gaps for mobile */}
                                <div className={`grid gap-2 sm:gap-3 md:gap-4 lg:gap-5 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                                    {paginatedProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product as any}
                                            viewMode={viewMode}
                                            onQuickView={handleQuickView}
                                        />
                                    ))}
                                </div>

                                {/* Pagination Controls - Mobile Optimized */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-6 sm:mt-8 md:mt-12 gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all bg-slate-50"
                                        >
                                            <ChevronRight className="rotate-180 w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // On mobile, show fewer pages
                                            const isMobileVisible = page === 1 || page === totalPages || page === currentPage;
                                            const isDesktopVisible = page >= currentPage - 1 && page <= currentPage + 1;

                                            if (isMobileVisible || isDesktopVisible) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${currentPage === page
                                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                (page === currentPage - 2 && page > 1) ||
                                                (page === currentPage + 2 && page < totalPages)
                                            ) {
                                                return <span key={page} className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center text-slate-400 text-sm">...</span>;
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all bg-slate-50"
                                        >
                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Quick View Modal */}
                <QuickViewModal
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                />
            </div>

            {/* Backdrop for Mobile Sidebar */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
