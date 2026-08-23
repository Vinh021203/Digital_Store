'use client';

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search, Filter, Grid, List, ChevronDown, Star, Eye, Package,
    Heart, Home, ChevronRight, Loader2, X, SlidersHorizontal,
    Check, ArrowUpDown, Tag, Zap, LayoutGrid, Headphones, Send
} from 'lucide-react';
import type { DbCategory } from '@/lib/categories';
import { ProductCard } from '@/components/product';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useCallback } from 'react';
import type { Product } from '@/types';
import { useSiteMode } from '@/hooks/useSiteSettings';
import { getTechnologyIconUrl, normalizeTechnologyName } from '@/lib/technologyIcons';

function useDebouncedValue<T>(value: T, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedValue(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

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
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    ratings,
    setRatings,
    formats,
    setFormats,
    selectedTechnologies,
    setSelectedTechnologies,
    products,
    isOpen,
    onClose,
    isCatalogMode
}: {
    categories: any[];
    selectedCategories: string[];
    setSelectedCategories: (v: string[]) => void;
    priceRange: [number, number];
    setPriceRange: (v: [number, number]) => void;
    ratings: number[];
    setRatings: (v: number[]) => void;
    formats: string[];
    setFormats: (v: string[]) => void;
    selectedTechnologies: string[];
    setSelectedTechnologies: (v: string[]) => void;
    products: any[];
    isOpen: boolean;
    onClose: () => void;
    isCatalogMode: boolean;
}) => {
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllFormats, setShowAllFormats] = useState(false);
    const [showAllTechnologies, setShowAllTechnologies] = useState(false);

    const categoryCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach((product) => {
            if (product.category) counts[product.category] = (counts[product.category] || 0) + 1;
        });
        return counts;
    }, [products]);

    const formatCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};
        products.forEach((product) => {
            if (product.format) counts[product.format] = (counts[product.format] || 0) + 1;
        });
        return counts;
    }, [products]);

    const availableCategories = categories.filter((category) => (categoryCounts[category.slug] || 0) > 0);
    const visibleCategories = showAllCategories ? availableCategories : availableCategories.slice(0, 5);
    const formatOptions = Array.from(new Set(products.map(product => product.format).filter(Boolean))) as string[];
    const visibleFormats = showAllFormats ? formatOptions : formatOptions.slice(0, 5);
    const basePlatformOptions = [
        { label: 'HTML', key: 'html', aliases: ['html', 'html5'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
        { label: 'React', key: 'react', aliases: ['react', 'reactjs'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
        { label: 'Next.js', key: 'next', aliases: ['next.js', 'nextjs'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
        { label: 'Figma', key: 'figma', aliases: ['figma'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
        { label: 'Canva', key: 'canva', aliases: ['canva'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/canva/canva-original.svg', alwaysVisible: true },
        { label: 'Vue.js', key: 'vue', aliases: ['vue', 'vue.js', 'vuejs'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg' },
        { label: 'Nuxt.js', key: 'nuxt', aliases: ['nuxt', 'nuxt.js', 'nuxtjs'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nuxtjs/nuxtjs-original.svg' },
        { label: 'Angular', key: 'angular', aliases: ['angular', 'angularjs'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg' },
        { label: 'Laravel', key: 'laravel', aliases: ['laravel'], logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },
    ];
    const dynamicPlatformOptions = Array.from(new Set(products.flatMap((product: any) =>
        (product.technologyVariants || []).map((variant: any) => String(variant.technology || '').trim()).filter(Boolean)
    ))).map((technology) => {
        const key = normalizeTechnologyName(technology).replace(/[^a-z0-9]+/g, '-');
        return {
            label: technology,
            key,
            aliases: [normalizeTechnologyName(technology)],
            logo: getTechnologyIconUrl(technology) || '/favicon.png',
        };
    }).filter((dynamic) => !basePlatformOptions.some((base) => base.aliases.some((alias) => normalizeTechnologyName(alias) === normalizeTechnologyName(dynamic.label))));
    const platformOptions = [...basePlatformOptions, ...dynamicPlatformOptions];
    // Count products by matching technologyVariants directly (not text matching)
    const hasVariantMatch = (product: any, aliases: string[]) => {
        const variants = product.technologyVariants || [];
        return variants.some((v: any) =>
            aliases.some((alias) => normalizeTechnologyName(v.technology) === normalizeTechnologyName(alias))
        );
    };
    const availablePlatforms = platformOptions.map((platform) => ({
        ...platform,
        count: products.filter((product) => hasVariantMatch(product, platform.aliases)).length,
    }));
    const visiblePlatforms = showAllTechnologies ? availablePlatforms : availablePlatforms.slice(0, 5);

    const CheckboxRow = ({
        label,
        count,
        checked,
        onClick,
        children,
    }: {
        label: string;
        count?: number | string;
        checked?: boolean;
        onClick?: () => void;
        children?: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className="grid w-full grid-cols-[20px_minmax(0,1fr)_52px] items-center gap-2 rounded-md px-1.5 py-1 text-left text-[12px] font-medium text-slate-600 transition hover:bg-orange-50 hover:text-slate-900"
        >
            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${checked ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 bg-white'}`}>
                {checked && <Check size={10} strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1 truncate">{children || label}</span>
            <span className="w-full text-right text-[11px] font-semibold tabular-nums text-slate-400">{count ?? ''}</span>
        </button>
    );

    const SidebarContent = () => (
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <SlidersHorizontal size={15} className="text-slate-600" /> Bộ lọc
                </h2>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCategories([]);
                        setFormats([]);
                        setSelectedTechnologies([]);
                        setRatings([]);
                        setPriceRange([0, 5000000]);
                    }}
                    className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600"
                >
                    Xóa tất cả
                </button>
            </div>

            <div className="space-y-4">
                <section>
                    <h3 className="mb-2 text-[12px] font-extrabold text-slate-900">Danh mục</h3>
                    <div className="space-y-0.5">
                        {visibleCategories.map((cat) => (
                            <CheckboxRow
                                key={cat.id}
                                label={cat.name}
                                count={categoryCounts[cat.slug] || 0}
                                checked={selectedCategories.includes(cat.slug)}
                                onClick={() => setSelectedCategories(selectedCategories.includes(cat.slug) ? selectedCategories.filter(v => v !== cat.slug) : [...selectedCategories, cat.slug])}
                            />
                        ))}
                        {availableCategories.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllCategories((value) => !value)}
                                className="flex w-full items-center justify-between px-1.5 py-1 text-[12px] font-semibold text-orange-600 hover:text-orange-700"
                            >
                                <span>{showAllCategories ? 'Thu gọn' : 'Xem thêm'}</span>
                                <ChevronDown size={13} className={`transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </section>

                <section className="border-t border-slate-100 pt-4">
                    <h3 className="mb-2 text-[12px] font-extrabold text-slate-900">Loại tài nguyên</h3>
                    <div className="space-y-0.5">
                        {visibleFormats.map((item) => (
                            <CheckboxRow
                                key={item}
                                label={item}
                                count={formatCounts[item] || 0}
                                checked={formats.includes(item)}
                                onClick={() => setFormats(formats.includes(item) ? formats.filter(v => v !== item) : [...formats, item])}
                            />
                        ))}
                        {formatOptions.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllFormats((value) => !value)}
                                className="flex w-full items-center justify-between px-1.5 py-1 text-[12px] font-semibold text-orange-600 hover:text-orange-700"
                            >
                                <span>{showAllFormats ? 'Thu gọn' : 'Xem thêm'}</span>
                                <ChevronDown size={13} className={`transition-transform ${showAllFormats ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </section>

                <section className="border-t border-slate-100 pt-4">
                    <h3 className="mb-2 text-[12px] font-extrabold text-slate-900">Công nghệ & định dạng</h3>
                    <div className="space-y-0.5">
                        {visiblePlatforms.map((platform) => (
                            <CheckboxRow
                                key={platform.key}
                                label={platform.label}
                                count={platform.count > 0 ? platform.count : 'Sắp có'}
                                checked={selectedTechnologies.includes(platform.key)}
                                onClick={platform.count > 0 ? () => setSelectedTechnologies(selectedTechnologies.includes(platform.key) ? selectedTechnologies.filter(v => v !== platform.key) : [...selectedTechnologies, platform.key]) : undefined}
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                        <img src={platform.logo} alt={`${platform.label} logo`} className="h-4 w-4 object-contain" loading="lazy" />
                                    </span>
                                    {platform.label}
                                </span>
                            </CheckboxRow>
                        ))}
                        {availablePlatforms.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllTechnologies((value) => !value)}
                                className="flex w-full items-center justify-between px-1.5 py-1 text-[12px] font-semibold text-orange-600 hover:text-orange-700"
                            >
                                <span>{showAllTechnologies ? 'Thu gọn' : 'Xem thêm'}</span>
                                <ChevronDown size={13} className={`transition-transform ${showAllTechnologies ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </section>

                {!isCatalogMode && (
                <section className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-[12px] font-extrabold text-slate-900">Khoảng giá</h3>
                    <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="100000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                        className="w-full accent-orange-600"
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-500">0đ</div>
                        <div className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-slate-500">{priceRange[1].toLocaleString('vi-VN')}đ</div>
                    </div>
                </section>
                )}

                <section className="border-t border-slate-100 pt-4">
                    <h3 className="mb-2 text-[12px] font-extrabold text-slate-900">Đánh giá</h3>
                    <div className="space-y-0.5">
                        {[5, 4, 3, 2, 1].map((r) => (
                            <CheckboxRow key={r} label={`${r} sao`} count={products.filter((p) => {
                                const value = Number(p.rating) || 0;
                                const lowerBound = r === 5 ? 4.5 : r - 0.5;
                                const upperBound = r === 5 ? 5.01 : r + 0.5;
                                return value >= lowerBound && value < upperBound;
                            }).length} checked={ratings.includes(r)} onClick={() => setRatings(ratings.includes(r) ? ratings.filter(v => v !== r) : [...ratings, r])}>
                                <span className="inline-flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < r ? 'currentColor' : 'none'} className={i < r ? 'text-amber-400' : 'text-slate-300'} />
                                    ))}
                                </span>
                            </CheckboxRow>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar - Always visible, sticky */}
            <aside className="hidden lg:block sticky top-20 z-20 w-60 shrink-0">
                <SidebarContent />
            </aside>

            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-extrabold text-slate-900">Bộ lọc</h2>
                        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
};

interface ProductsPageContentProps {
    initialProducts: Product[];
    initialCategories: DbCategory[];
}

function ProductsPageContent({ initialProducts, initialCategories }: ProductsPageContentProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isCatalogMode } = useSiteMode();
    const didMountFiltersRef = useRef(false);
    const isUrlSyncRef = useRef(false);

    const [products] = useState<Product[]>(initialProducts);
    const [categories] = useState<DbCategory[]>(initialCategories);
    const loading = false;
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showSidebar, setShowSidebar] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);

    // Quick View state
    const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const handleQuickView = useCallback((product: any) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    }, []);

    // Filter states
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        const cat = searchParams.get('category') || '';
        return cat ? [cat] : [];
    });
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
    const [ratings, setRatings] = useState<number[]>([]);
    const [formats, setFormats] = useState<string[]>(() => {
        const fmt = searchParams.get('format') || '';
        return fmt ? [fmt] : [];
    });
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(() => {
        const tech = searchParams.get('tech') || searchParams.get('technology') || '';
        return tech ? [tech] : [];
    });
    const [currentPage, setCurrentPage] = useState(() => {
        const page = Number(searchParams.get('page') || 1);
        return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    });
    const ITEMS_PER_PAGE = 12;

    const updatePageParam = useCallback((page: number, mode: 'push' | 'replace' = 'push') => {
        const params = new URLSearchParams(window.location.search);

        if (page <= 1) {
            params.delete('page');
        } else {
            params.set('page', String(page));
        }

        const query = params.toString();
        const href = query ? `/products?${query}` : '/products';

        if (mode === 'replace') {
            router.replace(href, { scroll: false });
        } else {
            router.push(href, { scroll: false });
        }
    }, [router]);

    // Reset page when filters change
    useEffect(() => {
        if (!didMountFiltersRef.current) {
            didMountFiltersRef.current = true;
            return;
        }
        if (isUrlSyncRef.current) {
            isUrlSyncRef.current = false;
            return;
        }

        setCurrentPage(1);
        updatePageParam(1, 'replace');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchTerm, selectedCategories, priceRange, ratings, formats, selectedTechnologies, sortBy]);

    useEffect(() => {
        isUrlSyncRef.current = true;
        const category = searchParams.get('category') || '';
        const newCategories = category ? [category] : [];
        setSelectedCategories(prev => JSON.stringify(prev) === JSON.stringify(newCategories) ? prev : newCategories);

        const format = searchParams.get('format') || '';
        const newFormats = format ? [format] : [];
        setFormats(prev => JSON.stringify(prev) === JSON.stringify(newFormats) ? prev : newFormats);

        const tech = searchParams.get('tech') || searchParams.get('technology') || '';
        const newTechs = tech ? [tech] : [];
        setSelectedTechnologies(prev => JSON.stringify(prev) === JSON.stringify(newTechs) ? prev : newTechs);

        const newSearch = searchParams.get('search') || '';
        setSearchTerm(prev => prev === newSearch ? prev : newSearch);
        const page = Number(searchParams.get('page') || 1);
        const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        setCurrentPage(prev => prev === safePage ? prev : safePage);
    }, [searchParams]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

        if (normalizedSearch) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(normalizedSearch) ||
                p.description?.toLowerCase().includes(normalizedSearch) ||
                p.author?.toLowerCase().includes(normalizedSearch) ||
                p.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearch))
            );
        }

        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        if (formats.length > 0) {
            result = result.filter(p => formats.includes(p.format));
        }

        if (selectedTechnologies.length > 0) {
            const technologyAliases: Record<string, string[]> = {
                react: ['react', 'reactjs'],
                next: ['next.js', 'nextjs'],
                html: ['html', 'html5'],
                figma: ['figma'],
                canva: ['canva'],
                vue: ['vue', 'vue.js', 'vuejs'],
                nuxt: ['nuxt', 'nuxt.js', 'nuxtjs'],
                angular: ['angular', 'angularjs'],
                laravel: ['laravel'],
            };
            result = result.filter((p) => {
                const variants = (p as any).technologyVariants || [];
                return selectedTechnologies.some((techKey) => {
                    const dynamicTech = products
                        .flatMap((product: any) => (product.technologyVariants || []).map((v: any) => String(v.technology || '')))
                        .find((t) => normalizeTechnologyName(t).replace(/[^a-z0-9]+/g, '-') === techKey);
                    const aliases = technologyAliases[techKey]
                        || (dynamicTech ? [normalizeTechnologyName(dynamicTech)] : [techKey]);
                    return variants.some((v: any) =>
                        aliases.some((alias) => normalizeTechnologyName(v.technology) === normalizeTechnologyName(alias))
                    );
                });
            });
        }

        if (ratings.length > 0) {
            result = result.filter(p => {
                const value = Number(p.rating) || 0;
                return ratings.some((r) => {
                    const lowerBound = r === 5 ? 4.5 : r - 0.5;
                    const upperBound = r === 5 ? 5.01 : r + 0.5;
                    return value >= lowerBound && value < upperBound;
                });
            });
        }

        if (!isCatalogMode) {
            result = result.filter(p => p.price >= priceRange[0] && (priceRange[1] >= 5000000 ? true : p.price <= priceRange[1]));
        }

        switch (sortBy) {
            case 'price-asc':
                if (!isCatalogMode) result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                if (!isCatalogMode) result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default: // newest
                result.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
        }

        return result;
    }, [products, debouncedSearchTerm, selectedCategories, sortBy, priceRange, ratings, formats, selectedTechnologies, isCatalogMode]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
    const paginatedProducts = filteredProducts.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
            updatePageParam(totalPages, 'replace');
        }
    }, [currentPage, totalPages, updatePageParam]);

    const handlePageChange = (page: number) => {
        const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
        setCurrentPage(nextPage);
        updatePageParam(nextPage);
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scroll effectively to top of list
    };

    const heroSlides = [
        '/product_slider/slider_products_1.webp',
        '/product_slider/slider_products_2.webp',
        '/product_slider/slider_products_3.webp',
        '/product_slider/slider_products_4.webp',
    ];

    const sortOptions = [
        { value: 'newest', label: 'Moi nhat' },
        { value: 'popular', label: 'Pho bien' },
        ...(!isCatalogMode ? [
            { value: 'price-asc', label: 'Gia tang' },
            { value: 'price-desc', label: 'Gia giam' },
        ] : []),
    ];
    const currentSortLabel = sortOptions.find((option) => option.value === sortBy)?.label || 'Moi nhat';

    return (
        <div className="min-h-screen bg-slate-50 pb-4 md:pb-6">
            {/* Professional Hero Section - Mobile Optimized */}
            <div className="bg-slate-900 relative overflow-hidden text-white">
                <div className="absolute inset-0">
                    {heroSlides.map((slide, index) => (
                        <Image
                            key={slide}
                            src={slide}
                            alt=""
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className={`${heroSlides.length > 1 ? 'product-hero-slide' : 'opacity-100'} object-cover`}
                            style={heroSlides.length > 1 ? { animationDelay: `${index * 3}s` } : undefined}
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/25" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 z-10">
                    <div className="max-w-3xl">
                        {/* Badge - Smaller on mobile */}
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
                            <Star size={10} className="sm:w-3 sm:h-3" fill="currentColor" /> Kho giao diện cao cấp
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

            <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-10 pb-0">
                {/* Mobile Filter Bar - Compact & Functional */}
                <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-slate-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
                    {/* Results Count */}
                    <div className="text-xs text-slate-500 mb-2">
                        <span className="font-bold text-slate-900">{filteredProducts.length}</span> mẫu demo
                        {selectedCategories.length > 0 && <span> trong <span className="text-orange-600 font-semibold">{categories.find(c => c.slug === selectedCategories[0])?.name}{selectedCategories.length > 1 ? ` +${selectedCategories.length - 1}` : ''}</span></span>}
                    </div>

                    {/* Filter & Sort Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-white px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 text-xs sm:text-sm active:scale-[0.98] transition-transform"
                        >
                            <SlidersHorizontal size={14} /> Bộ lọc
                            {(selectedCategories.length > 0 || formats.length > 0 || selectedTechnologies.length > 0 || ratings.length > 0) && (
                                <span className="w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">!</span>
                            )}
                        </button>
                        <div className="relative flex-1">
                            <button
                                type="button"
                                onClick={() => setShowMobileSort((value) => !value)}
                                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition active:scale-[0.98] sm:rounded-xl sm:py-2.5 sm:text-sm"
                            >
                                <span>{currentSortLabel}</span>
                                <ChevronDown size={12} className={`text-slate-400 transition-transform ${showMobileSort ? 'rotate-180' : ''}`} />
                            </button>
                            {showMobileSort && (
                                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-full min-w-[150px] overflow-hidden rounded-xl border border-orange-100 bg-white p-1.5 shadow-xl">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setShowMobileSort(false);
                                            }}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${sortBy === option.value ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                            {sortBy === option.value && <Check size={13} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 lg:gap-8 items-start">
                    {/* Sidebar - Works for both Desktop (visible) and Mobile (fixed overlay) */}
                    <FilterSidebar
                        categories={categories}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        ratings={ratings}
                        setRatings={setRatings}
                        formats={formats}
                        setFormats={setFormats}
                        selectedTechnologies={selectedTechnologies}
                        setSelectedTechnologies={setSelectedTechnologies}
                        products={products}
                        isOpen={showSidebar}
                        isCatalogMode={isCatalogMode}
                        onClose={() => setShowSidebar(false)}
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 w-full">
                        {/* Toolbar */}
                        <div className="hidden lg:flex items-center justify-between mb-5 bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
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
                                        {!isCatalogMode && (
                                            <>
                                                <option value="price-asc">Gia: thap den cao</option>
                                                <option value="price-desc">Gia: cao den thap</option>
                                            </>
                                        )}
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
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2">Không tìm thấy mẫu demo</h3>
                                <p className="text-slate-500 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 max-w-md mx-auto">
                                    Hãy thử điều chỉnh lại từ khóa hoặc bộ lọc.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategories([]);
                                        setPriceRange([0, 5000000]);
                                        setRatings([]);
                                        setFormats([]);
                                        setSelectedTechnologies([]);
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
                                            onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                                            disabled={safeCurrentPage === 1}
                                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all bg-slate-50"
                                        >
                                            <ChevronRight className="rotate-180 w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>

                                        {[...Array(totalPages)].map((_, i) => {
                                            const page = i + 1;
                                            // On mobile, show fewer pages
                                            const isMobileVisible = page === 1 || page === totalPages || page === safeCurrentPage;
                                            const isDesktopVisible = page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1;

                                            if (isMobileVisible || isDesktopVisible) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${safeCurrentPage === page
                                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                (page === safeCurrentPage - 2 && page > 1) ||
                                                (page === safeCurrentPage + 2 && page < totalPages)
                                            ) {
                                                return <span key={page} className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center text-slate-400 text-sm">...</span>;
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                                            disabled={safeCurrentPage === totalPages}
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

	                <div className="mt-6 space-y-5">
		                    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 p-2.5 shadow-sm md:grid-cols-4 md:gap-3 md:p-4">
                        {[
                            { icon: Package, title: 'Mẫu demo chất lượng', desc: 'Đã được kiểm duyệt kỹ lưỡng' },
                            { icon: Eye, title: 'Xem demo trước', desc: 'Đánh giá giao diện rõ ràng' },
                            { icon: Send, title: 'Nhận tư vấn nhanh', desc: 'Gợi ý theo nhu cầu thực tế' },
                            { icon: Headphones, title: 'Hỗ trợ tận tâm 24/7', desc: 'Giải đáp mọi thắc mắc' },
                        ].map((item) => (
		                            <div key={item.title} className="flex items-start gap-2 rounded-xl bg-white/45 px-2 py-2 md:items-center md:gap-3 md:bg-transparent">
		                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-sm ring-1 ring-orange-200/70 md:h-11 md:w-11">
		                                    <item.icon size={16} className="md:h-5 md:w-5" />
		                                </span>
		                                <span className="min-w-0">
		                                    <strong className="block text-[11px] font-extrabold leading-snug text-slate-900 md:text-sm">{item.title}</strong>
		                                    <span className="mt-0.5 block text-[10px] font-semibold leading-snug text-slate-500 md:text-xs">{item.desc}</span>
		                                </span>
		                            </div>
	                        ))}
	                    </div>

	                    <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-100 p-4 shadow-sm md:flex md:items-center md:justify-between md:p-5">
	                        <div className="pointer-events-none absolute -left-6 -top-8 h-24 w-24 rotate-12 rounded-[30px] bg-orange-200/50 blur-2xl" />
	                        <div className="relative flex items-start gap-4">
	                            <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 md:flex">
	                                <Send size={34} />
	                            </span>
	                            <div>
                                <h3 className="text-lg font-extrabold text-orange-700">Cập nhật mẫu giao diện mới mỗi tuần!</h3>
                                <p className="mt-1 text-sm font-medium text-slate-600">Đừng bỏ lỡ các template chất lượng, ý tưởng triển khai và gợi ý lựa chọn phù hợp.</p>
	                            </div>
	                        </div>
		                        <Link href="/blog" className="relative mt-4 inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 md:mt-0">
	                            Xem bài viết mới
		                        </Link>
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

            <style jsx>{`
                :global(.product-hero-slide) {
                    opacity: 0;
                    animation: productHeroFade 12s ease-in-out infinite;
                }

                @keyframes productHeroFade {
                    0% { opacity: 0; transform: scale(1.015); }
                    8% { opacity: 1; transform: scale(1); }
                    22% { opacity: 1; transform: scale(1.01); }
                    30% { opacity: 0; transform: scale(1.02); }
                    100% { opacity: 0; transform: scale(1.02); }
                }
            `}</style>
        </div>
    );
}

interface ProductsPageProps {
    initialProducts?: Product[];
    initialCategories?: DbCategory[];
}

export default function ProductsPage({
    initialProducts = [],
    initialCategories = [],
}: ProductsPageProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-600" /></div>}>
            <ProductsPageContent initialProducts={initialProducts} initialCategories={initialCategories} />
        </Suspense>
    );
}
