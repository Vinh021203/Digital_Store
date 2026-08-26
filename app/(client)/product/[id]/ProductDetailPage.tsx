'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star, RotateCcw, Heart, Check,
    ChevronRight, Copy, Clock, ShoppingCart, ShoppingBag, Download, Package,
    Share2, Play, FileCode, FileCheck2, Layers, Monitor, Smartphone, Tag,
    MessageCircle, Headset, ThumbsUp, ChevronDown, AlertCircle, Plus, Loader2,
    Eye, Users, Calendar, Code, Palette, Zap, Award, Globe, X,
    ArrowRight, Maximize2, Minimize2
} from 'lucide-react';
import { getProductBySlug, getProductById, fetchActiveProducts } from '@/lib/products';
import SafeHTML from '@/components/ui/SafeHTML';
import { useCart } from '@/context/CartContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';
import type { Product } from '@/types';
import { getTechnologyIconUrl } from '@/lib/technologyIcons';

const ReviewsSection = dynamic(() => import('@/components/product/ReviewsSection'), {
    ssr: false,
    loading: () => <div className="mt-8 min-h-56 animate-pulse rounded-2xl bg-slate-50" />,
});

const RelatedProducts = dynamic(() => import('@/components/product/RelatedProducts'), {
    ssr: false,
    loading: () => <div className="mt-6 min-h-64 animate-pulse rounded-2xl bg-slate-50" />,
});

const FAQ_DATA = [
    { q: 'Mẫu demo này phù hợp với dự án nào?', a: 'Mẫu được dùng để tham khảo giao diện và tư vấn triển khai theo nhu cầu website, landing page hoặc dự án thương mại phù hợp.' },
    { q: 'Có thể chọn công nghệ khác không?', a: 'Bạn có thể xem các phiên bản công nghệ có sẵn trong mục bên trên. Nếu chưa có phiên bản phù hợp, hãy gửi yêu cầu để được tư vấn.' },
    { q: 'Tôi nhận được hỗ trợ ở mức nào?', a: 'Web Giá Rẻ hỗ trợ tư vấn phạm vi triển khai, cấu trúc giao diện và các tùy chỉnh cơ bản theo từng mẫu.' },
    { q: 'Có được phân phối lại tài nguyên gốc không?', a: 'Không. Tài nguyên gốc chỉ được sử dụng trong phạm vi dự án đã được tư vấn và xác nhận.' },
    { q: 'Tôi có thể xem demo trước khi liên hệ không?', a: 'Có. Bạn có thể bấm nút xem demo hoặc chọn phiên bản công nghệ tương ứng để kiểm tra giao diện trước khi trao đổi.' },
];

const stripHtml = (value?: string | null) =>
    String(value || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();


// Demo Preview Modal Component
const DemoPreviewModal = ({ isOpen, onClose, demoUrl, productName }: {
    isOpen: boolean;
    onClose: () => void;
    demoUrl: string;
    productName: string;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('demo-preview-open');

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.classList.remove('demo-preview-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) setIsExpanded(false);
    }, [isOpen]);

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 ${isExpanded ? 'p-0' : 'p-0 sm:p-4'}`}>
            <div className={`relative flex w-full flex-col overflow-hidden bg-white shadow-2xl transition-[height,max-width,border-radius] duration-200 ${isExpanded ? 'h-full max-w-none rounded-none' : 'h-full sm:h-[90vh] sm:max-w-[90vw] sm:rounded-2xl'}`}>
                {/* Header */}
                <div className={`z-20 flex shrink-0 items-center bg-white transition-all duration-200 ${isExpanded ? 'absolute bottom-4 right-4 h-auto gap-1.5 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-xl shadow-black/20 backdrop-blur-xl' : 'h-14 w-full justify-between gap-2 border-b border-slate-100 px-3 sm:px-4'}`}>
                    <div className={`min-w-0 items-center gap-2 sm:gap-3 ${isExpanded ? 'hidden' : 'flex'}`}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                            <Play size={16} className="fill-orange-600 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-[9px] font-bold uppercase tracking-wider text-slate-500 ${isExpanded ? 'hidden' : 'hidden sm:block'}`}>Live Preview</p>
                            <h3 className="truncate text-xs font-bold leading-tight text-slate-900 sm:text-sm">{productName}</h3>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setIsExpanded((current) => !current)}
                            className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
                            aria-label={isExpanded ? 'Thu nhỏ bản xem trước' : 'Mở rộng bản xem trước'}
                        >
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            <span className={isExpanded ? 'sr-only' : 'hidden sm:inline'}>{isExpanded ? 'Thu nhỏ' : 'Mở rộng'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                            aria-label="Đóng bản xem trước"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                {/* iframe */}
                <div className="flex-1 bg-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                    <iframe
                        src={demoUrl}
                        className="w-full h-full relative z-10"
                        title={`Demo ${productName}`}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

// Image Lightbox Modal Component
const ImageLightbox = ({
    isOpen,
    onClose,
    images,
    currentIndex,
    onNavigate
}: {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentIndex: number;
    onNavigate: (index: number) => void;
}) => {
    if (!isOpen || images.length === 0) return null;

    const handlePrev = () => {
        onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    };

    const handleNext = () => {
        onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [currentIndex]);

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
            style={{ top: 0, left: 0, right: 0, bottom: 0, marginTop: 0, zIndex: 2147483647 }}
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Main Image - fit actual screenshot ratio */}
            <div
                className="absolute inset-x-4 top-16 bottom-24 flex items-center justify-center md:inset-x-16 md:top-16 md:bottom-28"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex max-h-full max-w-[min(94vw,1600px)] items-center justify-center overflow-hidden rounded-2xl bg-transparent shadow-2xl shadow-black/50">
                    <img
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className="block max-h-[calc(100vh-8.5rem)] max-w-full rounded-2xl object-contain"
                    />
                </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex max-w-[90vw] gap-2 overflow-x-auto rounded-2xl bg-black/55 p-2 backdrop-blur-md">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${idx === currentIndex ? 'ring-2 ring-orange-500 opacity-100' : 'opacity-50 hover:opacity-80'
                                }`}
                        >
                            <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, addToWishlist, isInWishlist, addToCompare, isInCompare, compareList } = useCart();
    const { user } = useSupabaseAuth();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();

    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [quickBuyCollapsed, setQuickBuyCollapsed] = useState(false);

    const productId = params.id as string;

    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                // Try slug first, then ID
                let data = await getProductBySlug(productId);
                if (!data) {
                    const numId = parseInt(productId, 10);
                    if (!isNaN(numId)) {
                        data = await getProductById(numId);
                    }
                }
                setProduct(data);

                // Related products are non-critical content. Load them after the
                // main product has been painted so they do not delay LCP.
                if (data) {
                    fetchActiveProducts()
                        .then((allProducts) => {
                            const categoryName = typeof data.category === 'object' ? data.category?.name : data.category;
                            const related = allProducts
                                .filter((p: any) => {
                                    const pCatName = typeof p.category === 'object' ? p.category?.name : p.category;
                                    return p.id !== data.id && pCatName === categoryName;
                                })
                                .slice(0, 4);
                            setRelatedProducts(related);
                        })
                        .catch((error) => console.error('Error loading related products:', error));
                }
            } catch (error) {
                console.error('Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId]);

    const handleAddToCart = useCallback(() => {
        if (product) {
            if (isCatalogMode) {
                addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
                router.push(`/contact?product=${encodeURIComponent(String(product.slug || product.id))}`);
                return;
            }
            addToCart(product);
            addToast(`Đã thêm "${product.name}" vào danh sách quan tâm`, 'success');
        }
    }, [product, addToCart, addToast, isCatalogMode, router]);

    const handleToggleWishlist = useCallback(() => {
        if (product) {
            addToWishlist(product);
            addToast(
                isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích',
                'success'
            );
        }
    }, [product, addToWishlist, isInWishlist, addToast]);

    const handleToggleCompare = useCallback(() => {
        if (product) {
            if (compareList.length >= 3 && !isInCompare(product.id)) {
                addToast('Chỉ có thể so sánh tối đa 3 mẫu demo', 'error');
                return;
            }
            addToCompare(product);
            addToast(
                isInCompare(product.id) ? 'Đã xóa khỏi so sánh' : 'Đã thêm vào so sánh',
                'success'
            );
        }
    }, [product, addToCompare, isInCompare, compareList, addToast]);

    const discountPercent = useMemo(() => {
        const origPrice = product?.originalPrice || product?.original_price;
        if (origPrice && origPrice > product.price) {
            return Math.round(((origPrice - product.price) / origPrice) * 100);
        }
        return 0;
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                    <p className="text-slate-500 font-medium">Đang tải thông tin mẫu demo...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Package size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Mẫu demo không tồn tại</h2>
                <p className="text-slate-500 mb-8 max-w-md text-center">Mẫu này có thể đã bị xóa hoặc đường dẫn không chính xác. Vui lòng kiểm tra lại.</p>
                <Link href="/products" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg">
                    Khám phá cửa hàng
                </Link>
            </div>
        );
    }

    const isWishlisted = isInWishlist(product.id);
    const isComparing = isInCompare(product.id);

    return (
        <ModernProductDetailLayout
            product={product}
            relatedProducts={relatedProducts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            showLightbox={showLightbox}
            setShowLightbox={setShowLightbox}
            showDemoModal={showDemoModal}
            setShowDemoModal={setShowDemoModal}
            handleAddToCart={handleAddToCart}
            handleToggleWishlist={handleToggleWishlist}
            handleToggleCompare={handleToggleCompare}
            isWishlisted={isWishlisted}
            isComparing={isComparing}
            discountPercent={discountPercent}
            quickBuyCollapsed={quickBuyCollapsed}
            setQuickBuyCollapsed={setQuickBuyCollapsed}
            isCatalogMode={isCatalogMode}
        />
    );

}

const ModernProductDetailLayout = ({
    product,
    relatedProducts,
    activeTab,
    setActiveTab,
    selectedImageIndex,
    setSelectedImageIndex,
    showLightbox,
    setShowLightbox,
    showDemoModal,
    setShowDemoModal,
    handleAddToCart,
    handleToggleWishlist,
    handleToggleCompare,
    isWishlisted,
    isComparing,
    discountPercent,
    quickBuyCollapsed,
    setQuickBuyCollapsed,
    isCatalogMode,
}: any) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileQuickBuyOpen, setMobileQuickBuyOpen] = useState(false);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [isTechnologyVariantVisible, setIsTechnologyVariantVisible] = useState(false);
    const categoryLabel = typeof product.category === 'string'
        ? product.category
        : product.category?.name || 'SaaS Templates';
    const originalPrice = product.originalPrice || product.original_price;
    const demoUrl = product.demo_url || product.demoUrl;
    const fileFormat = product.file_format || product.fileFormat || '';
    const compatibility = product.compatibility || '';
    const techStack = product.tech_stack || product.techStack || [];
    const technologyVariants = Array.isArray(product.technology_variants) ? product.technology_variants : [];
    const currentProductFile = product.product_files?.find((file: any) => file.is_current)
        || product.product_files?.[0];
    const currentVersion = currentProductFile?.version || product.version || '';
    const galleryImages = [product.image, ...(product.images || [])]
        .map((item: any) => typeof item === 'string' ? item : item?.url || item?.src || item?.image)
        .filter(Boolean);
    const images = galleryImages.length ? galleryImages : [product.image].filter(Boolean);
    const currentImage = images[selectedImageIndex] || images[0];
    const thumbnailStart = Math.floor(selectedImageIndex / 4) * 4;
    const visibleThumbnails = images.slice(thumbnailStart, thumbnailStart + 4);
    const rating = product.rating || 4.9;
    const reviewCount = product.reviews || product.review_count || 56;
    const soldCount = product.students || product.downloads_count || product.sales || 128;
    const formatPrice = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
    const consultationPriceLabel = 'Liên hệ tư vấn';
    const displayPrice = isCatalogMode ? consultationPriceLabel : formatPrice(product.price);
    const featureList = (product.features?.length ? product.features : [
        '30+ màn hình được thiết kế sẵn',
        'Dễ dàng tùy biến và mở rộng',
        'Auto layout & Components thông minh',
        'Giao diện hiện đại, tối ưu trải nghiệm',
        'Responsive-ready cho mọi thiết bị',
        'Tài liệu hướng dẫn sử dụng chi tiết',
    ]).slice(0, 6);
    const packageFeatures = product.features?.length ? product.features : [
        'Giao diện responsive trên desktop, tablet và mobile',
        'Các section được thiết kế sẵn theo từng nhu cầu',
        'Trang menu và chi tiết sản phẩm',
        'Trang liên hệ, FAQ và đánh giá khách hàng',
        'Hướng dẫn chỉnh sửa nội dung cơ bản',
    ];
    const heroStats = [
        { value: '12+', label: 'Sections', icon: Layers },
        { value: 'SEO', label: 'Optimized', icon: Globe },
        { value: 'Fast', label: 'Loading', icon: Zap },
        { value: 'Form', label: 'Ready', icon: FileCode },
        { value: 'Motion', label: 'Effects', icon: RotateCcw },
    ];
    const plainDescription = stripHtml(product.description);
    const shortDescription = product.short_description || product.shortDescription || (
        plainDescription
            ? `${plainDescription.slice(0, 190)}${plainDescription.length > 190 ? '...' : ''}`
            : 'Bộ giao diện website hiện đại, dễ tùy biến, giúp bạn triển khai website nhanh chóng và chuyên nghiệp.'
    );
    const shouldCompactDesktopQuickBuy = quickBuyCollapsed;

    useEffect(() => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        let frameId = 0;
        const updateFooterVisibility = () => {
            frameId = 0;
            setIsFooterVisible(footer.getBoundingClientRect().top <= window.innerHeight);
        };
        const handleScroll = () => {
            if (!frameId) frameId = window.requestAnimationFrame(updateFooterVisibility);
        };

        updateFooterVisibility();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (frameId) window.cancelAnimationFrame(frameId);
        };
    }, []);
    useEffect(() => {
        const technologySection = document.getElementById('technology-variants');
        if (!technologySection || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsTechnologyVariantVisible(entry.isIntersecting),
            { threshold: 0.12, rootMargin: '-10% 0px -45% 0px' },
        );

        observer.observe(technologySection);
        return () => observer.disconnect();
    }, [product]);
    const tabs = [
        ['description', 'Mô tả mẫu demo'],
        ['features', 'Tính năng nổi bật'],
        ['package', 'Bộ tài nguyên'],
        ['workflow', 'Quy trình & Ứng dụng'],
        ['reviews', 'Đánh giá'],
        ['license', 'Quyền sử dụng'],
    ];
    const workflowCards = [
        { icon: Eye, title: 'Chọn bố cục phù hợp', tag: 'Bắt đầu' },
        { icon: Palette, title: 'Tùy chỉnh thương hiệu', tag: 'Logo & màu sắc' },
        { icon: Layers, title: 'Cập nhật menu món ăn', tag: 'Nội dung' },
        { icon: Calendar, title: 'Thiết lập đặt bàn', tag: 'Chuyển đổi' },
        { icon: Smartphone, title: 'Kiểm tra responsive', tag: 'Hoàn thiện' },
        { icon: Download, title: 'Xuất bản & bàn giao', tag: 'Triển khai' },
    ];

    const reviewItems = [
        { name: 'Nguyễn Minh Tâm', role: 'Product Manager', text: 'Giao diện đẹp, hiện đại và rất dễ tùy biến. Tiết kiệm cho team rất nhiều thời gian triển khai.' },
        { name: 'Trần Thảo Vy', role: 'Marketing Lead', text: 'Cấu trúc file rõ ràng, dễ chỉnh sửa và có đủ thành phần để dựng landing page nhanh.' },
        { name: 'Lê Hoàng Nam', role: 'Founder', text: 'Demo sát thực tế, responsive ổn và phù hợp để triển khai MVP trong thời gian ngắn.' },
        { name: 'Phạm Gia Bảo', role: 'Frontend Developer', text: 'Component sạch, bố cục dễ đọc, phần gallery và tài liệu giúp bàn giao thuận tiện hơn.' },
        { name: 'Đỗ Minh Anh', role: 'UI Designer', text: 'Thiết kế có hệ thống, màu sắc dễ thay đổi và dùng tốt cho nhiều nhóm giao diện website.' },
        { name: 'Hoàng Khánh Linh', role: 'Agency Owner', text: 'Khách duyệt nhanh hơn vì preview rõ ràng, các section đủ để trình bày mẫu demo chuyên nghiệp.' },
    ];

    const goToTab = (id: string) => {
        setActiveTab(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const closeLightbox = () => {
        setShowLightbox(false);
        window.setTimeout(() => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }, 0);
    };
    const selectPrevImage = () => {
        setSelectedImageIndex((current: number) => current === 0 ? images.length - 1 : current - 1);
    };
    const selectNextImage = () => {
        setSelectedImageIndex((current: number) => current === images.length - 1 ? 0 : current + 1);
    };
    const handleTechnologyVariant = (variant: any) => {
        if (variant.status === 'available' && variant.demo_url) {
            setShowDemoModal(true);
            return;
        }
        const query = new URLSearchParams({
            product: String(product.slug || product.id),
            technology: variant.technology,
        });
        window.location.href = `/contact?${query.toString()}`;
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fffdf9] font-sans">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(234,88,12,0.08),transparent_32%),linear-gradient(180deg,#fffdf9_0%,#ffffff_45%,#fffaf5_100%)]" />
                <div
                    className="absolute inset-0 opacity-[0.055]"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='168' height='168' viewBox='0 0 168 168' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ea580c' stroke-opacity='.42' stroke-width='1.3'%3E%3Crect x='18' y='24' width='48' height='34' rx='7'/%3E%3Cpath d='M18 35h48M29 30h.1M38 30h.1M47 30h.1' stroke-linecap='round'/%3E%3Cpath d='M108 34h28l-4 18h-20l-4-18Zm7 27a3 3 0 1 0 0 .1M130 61a3 3 0 1 0 0 .1'/%3E%3Cpath d='M30 120l-12-12 12-12M138 96l12 12-12 12M76 130h32M76 140h48M82 82h32v24H82zM89 90h18M89 98h12'/%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: '168px 168px',
                    }}
                />
            </div>

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-4 pb-3 md:px-8 md:pt-7 md:pb-12">
                <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-500 no-scrollbar">
                    <Link href="/" className="flex items-center gap-1.5 hover:text-orange-600"><HomeIcon size={15} /> Trang chủ</Link>
                    <ChevronRight size={15} className="text-slate-300" />
                    <Link href="/products" className="hover:text-orange-600">Templates</Link>
                    <ChevronRight size={15} className="text-slate-300" />
                    <span>{categoryLabel}</span>
                    <ChevronRight size={15} className="text-slate-300" />
                    <span className="font-semibold text-orange-700">{product.name}</span>
                </nav>

                <section className="grid items-start gap-6 lg:grid-cols-[0.84fr_1.16fr] lg:gap-8">
                    <div>
                        <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-orange-700">
                            Mẫu được quan tâm
                        </span>
                        <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.2] tracking-normal text-slate-950 md:text-4xl xl:text-[44px]">
                            {product.name}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                ))}
                                <span className="ml-2 font-bold text-slate-900">{rating}</span>
                                <span>{isCatalogMode ? 'Đánh giá tham khảo' : `(${reviewCount} đánh giá)`}</span>
                            </div>
                            <span className="h-4 w-px bg-slate-200" />
                            <span className="inline-flex items-center gap-1.5">
                                <Eye size={16} /> {soldCount} lượt quan tâm
                            </span>
                        </div>
                        <div className="mt-4 flex items-end gap-3">
                            <span className="text-4xl font-extrabold text-orange-600 md:text-5xl">{displayPrice}</span>
                            {!isCatalogMode && originalPrice && <span className="mb-1 text-xl font-semibold text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
                            {!isCatalogMode && discountPercent > 0 && <span className="mb-2 rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600">-{discountPercent}%</span>}
                        </div>
                        <p className="mt-4 max-w-xl text-base font-medium leading-8 text-slate-600">
                            {shortDescription}
                        </p>
                        <div className="mt-4 rounded-2xl border border-orange-100 bg-white/80 p-2 shadow-sm backdrop-blur">
                            <div className="grid grid-cols-5 divide-x divide-orange-100">
                                {heroStats.map((item) => {
                                    const StatIcon = item.icon;
                                    return (
                                    <div key={item.value} className="px-2 py-2 text-center">
                                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
                                            <StatIcon size={16} strokeWidth={2.4} />
                                        </div>
                                        <p className="text-sm font-bold leading-5 text-slate-950">{item.value}</p>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                            {featureList.slice(0, 3).map((feature: string, index: number) => (
                                <div
                                    key={index}
                                    className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1.5 text-[11px] font-semibold text-orange-700 sm:px-3 sm:text-xs"
                                >
                                    <Check size={13} className="shrink-0 text-orange-600" />
                                    <span className="truncate">{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div className={`mt-6 grid gap-3 sm:flex sm:flex-wrap ${demoUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            <button onClick={handleAddToCart} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-xs font-bold text-white shadow-xl shadow-orange-200 transition hover:bg-orange-700 sm:px-7 sm:py-4 sm:text-sm">
                                {isCatalogMode ? <MessageCircle size={18} /> : <ShoppingCart size={18} />} {isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào danh sách'}
                            </button>
                            {demoUrl && (
                                <button onClick={() => setShowDemoModal(true)} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-3 text-xs font-bold text-orange-700 transition hover:bg-orange-50 sm:px-7 sm:py-4 sm:text-sm">
                                    <Play size={18} /> Xem trước demo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div onClick={() => setShowLightbox(true)} className="group relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-orange-100 bg-slate-950 shadow-2xl shadow-orange-100/80">
                            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white">
                                {currentImage && <Image src={currentImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover transition duration-500 group-hover:scale-[1.015]" priority />}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={selectPrevImage}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600 md:flex"
                                aria-label="Ảnh trước"
                            >
                                <ChevronRight size={20} className="rotate-180" />
                            </button>
                            <div className="grid min-w-0 flex-1 grid-cols-4 gap-3 overflow-hidden">
                                {visibleThumbnails.map((img: string, i: number) => {
                                    const imageIndex = thumbnailStart + i;
                                    return (
                                    <button key={`${img}-${imageIndex}`} type="button" onClick={() => setSelectedImageIndex(imageIndex)} className={`relative aspect-[16/9] min-w-0 overflow-hidden rounded-xl border bg-white transition ${imageIndex === selectedImageIndex ? 'border-orange-600 ring-2 ring-orange-200' : 'border-slate-200 opacity-80 hover:opacity-100'}`}>
                                        <Image src={img} alt="" fill className="object-cover" sizes="(min-width: 1024px) 12vw, 22vw" />
                                    </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={selectNextImage}
                                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-orange-600 md:flex"
                                aria-label="Ảnh tiếp theo"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
                            {[
                                { icon: Eye, title: 'Preview rõ ràng', desc: 'Xem trước từng màn hình' },
                                { icon: Eye, title: 'Xem demo rõ ràng', desc: 'Đánh giá trước khi tư vấn' },
                                { icon: MessageCircle, title: 'Hỗ trợ triển khai', desc: 'Tư vấn chỉnh sửa cơ bản' },
                            ].map((item) => (
                                <div key={item.title} className="flex min-w-0 flex-col items-center gap-1 rounded-xl border border-orange-100 bg-white/80 p-1.5 text-center shadow-sm backdrop-blur md:flex-row md:gap-3 md:rounded-2xl md:p-3 md:text-left">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-50 to-sky-50 text-orange-600 md:h-10 md:w-10 md:rounded-xl">
                                        <item.icon size={13} className="md:h-[19px] md:w-[19px]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold leading-tight text-slate-950 md:text-sm md:leading-snug">{item.title}</p>
                                        <p className="hidden truncate text-xs font-medium text-slate-500 md:block">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
	                    </div>
	                </section>

                <div>
                    {(fileFormat || compatibility || currentVersion || techStack.length > 0) && (
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                        <div className="flex items-center gap-2">
                            <FileCode size={20} className="text-orange-600" />
                            <h2 className="text-lg font-bold text-slate-950">Thông tin kỹ thuật</h2>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                            {fileFormat && (
                                <div className="rounded-xl bg-slate-50 p-2.5 sm:p-3">
                                    <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-slate-500 sm:text-xs"><FileCode size={14} className="text-orange-500" /> Định dạng file</dt>
                                    <dd className="mt-1 break-words text-[10px] font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">{fileFormat}</dd>
                                </div>
                            )}
                            {compatibility && (
                                <div className="rounded-xl bg-slate-50 p-2.5 sm:p-3">
                                    <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-slate-500 sm:text-xs"><Monitor size={14} className="text-blue-500" /> Tương thích</dt>
                                    <dd className="mt-1 break-words text-[10px] font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">{compatibility}</dd>
                                </div>
                            )}
                            {currentVersion && (
                                <div className="rounded-xl bg-slate-50 p-2.5 sm:p-3">
                                    <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-slate-500 sm:text-xs"><Tag size={14} className="text-violet-500" /> Phiên bản</dt>
                                    <dd className="mt-1 break-words text-[10px] font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">v{currentVersion}</dd>
                                </div>
                            )}
                            {techStack.length > 0 && (
                                <div className="col-span-2 rounded-xl bg-slate-50 p-2.5 sm:p-3 lg:col-span-1">
                                    <dt className="flex items-center gap-1.5 text-[9px] font-bold uppercase leading-3 tracking-wide text-slate-500 sm:text-xs"><Code size={14} className="text-emerald-500" /> Công nghệ</dt>
                                    <dd className="mt-1 break-words text-[10px] font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">{techStack.join(', ')}</dd>
                                </div>
                            )}
                        </dl>
                    </section>
                    )}
                </div>

                {technologyVariants.length > 0 && (
                    <section id="technology-variants" className="mt-6 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4 md:p-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Code size={20} className="text-orange-600" />
                                    <h2 className="text-lg font-bold text-slate-950">Chọn phiên bản công nghệ</h2>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">Một theme, nhiều lựa chọn công nghệ phù hợp với dự án của bạn.</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                            {technologyVariants.map((variant: any) => {
                                const iconUrl = getTechnologyIconUrl(String(variant.technology || ''));
                                const isAvailable = variant.status === 'available';
                                const statusLabel = isAvailable
                                    ? 'Có sẵn'
                                    : variant.status === 'coming_soon'
                                        ? 'Sắp có'
                                        : variant.status === 'unavailable'
                                            ? 'Chưa hỗ trợ'
                                            : 'Theo yêu cầu';
                                return (
                                    <div key={variant.technology} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-orange-200 hover:bg-orange-50/40 sm:p-3">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
                                                {iconUrl ? <img src={iconUrl} alt="" className="h-5 w-5 object-contain sm:h-6 sm:w-6" /> : <Code size={18} className="text-slate-500 sm:h-[21px] sm:w-[21px]" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{variant.technology}</p>
                                                <p className={`text-[10px] font-semibold leading-4 sm:text-xs ${isAvailable ? 'text-emerald-600' : variant.status === 'coming_soon' ? 'text-amber-600' : 'text-orange-600'}`}>{statusLabel}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={variant.status === 'unavailable'}
                                            onClick={() => handleTechnologyVariant(variant)}
                                            className="mt-2 inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-white px-1.5 py-1.5 text-[10px] font-bold leading-4 text-orange-700 shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:mt-3 sm:px-3 sm:py-2 sm:text-xs"
                                        >
                                            {variant.cta_label || (isAvailable ? 'Xem Live Demo' : 'Nhận tư vấn')}
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:mt-8">
                    <div className="flex min-w-max gap-2">
                        {tabs.map(([id, label]) => (
                            <button key={id} onClick={() => goToTab(id)} className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${activeTab === id ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <section id="description" className="mt-6 scroll-mt-24 md:mt-8">
                    <h2 className="mb-5 text-xl font-bold text-slate-950">1. Mô tả mẫu demo</h2>
                    <div className="mb-6 rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-sm md:p-6">
	                        <div className={`relative max-w-none text-sm font-medium leading-7 text-slate-600 md:text-base md:leading-8 ${showFullDescription ? '' : 'max-h-[340px] overflow-hidden md:max-h-none'}`}>
	                            <SafeHTML
	                                html={product.description || ''}
	                                className="product-rich-content"
	                                fallback="<p>Mẫu demo được thiết kế để giúp bạn hình dung website nhanh hơn, đẹp hơn và dễ tùy biến theo từng nhu cầu thực tế.</p>"
	                            />
	                            {!showFullDescription && (
	                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent md:hidden" />
	                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFullDescription((value) => !value)}
	                            className="-mt-1 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 md:hidden"
                        >
                            {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                            <ChevronDown size={14} className={`transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                        </button>
                        {(product.tags?.length || techStack.length) && (
		                            <div className="mt-5 hidden flex-wrap gap-2 border-t border-slate-100 pt-5 md:flex">
	                                {[...(product.tags || []), ...techStack].slice(0, 12).map((tag: string, index: number) => (
	                                    <span key={`${tag}-${index}`} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">#{tag}</span>
	                                ))}
		                            </div>
	                        )}
                    </div>
                    <h3 id="features" className="mb-4 scroll-mt-24 text-xl font-bold text-slate-950">Tổng quan mẫu demo</h3>
                    <div className="mb-6 grid grid-cols-2 gap-2">
                        {featureList.map((feature: string, index: number) => (
                            <div
                                key={`${feature}-${index}`}
                                className={`flex min-h-12 items-start gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2 py-2.5 text-[11px] font-semibold leading-4 text-slate-700 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:gap-2 sm:px-3 sm:text-sm sm:leading-5 ${featureList.length % 2 === 1 && index === featureList.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
                            >
                                <Check size={15} className="mt-0.5 shrink-0 text-orange-600 sm:h-4 sm:w-4" />
                                <span className="break-words">{feature}</span>
                            </div>
                        ))}
                    </div>
                </section>

	                <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[0.95fr_1.05fr]">
	                    <section id="package" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
		                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-5 md:text-xl">2. Bộ tài nguyên bao gồm</h2>
	                        <div className="grid gap-4 md:grid-cols-[0.9fr_1fr] md:gap-5">
	                            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-orange-50 md:aspect-square">
                                {product.image && <Image src={product.image} alt="" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />}
	                            </div>
	                            <ul className="grid grid-cols-2 gap-2 md:block md:space-y-3">
	                                {packageFeatures.map((item: string) => (
	                                    <li key={item} className="flex gap-2 rounded-xl bg-orange-50/50 px-2.5 py-2 text-[11px] font-semibold leading-4 text-slate-700 md:bg-transparent md:px-0 md:py-0 md:text-sm"><Check size={15} className="mt-0.5 shrink-0 text-orange-600 md:h-[18px] md:w-[18px]" /> {item}</li>
	                                ))}
	                            </ul>
	                        </div>
	                    </section>

                    <section id="workflow" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:h-full">
	                        <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
		                            <h2 className="text-lg font-bold text-slate-950 md:text-xl">3. Quy trình & Ứng dụng</h2>
	                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">6 bước</span>
	                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-rows-3 md:gap-3">
	                            {workflowCards.map((item, index) => (
                                <div key={index} className="flex min-w-0 items-start gap-2 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-sky-50/40 p-2.5 md:items-center md:gap-3 md:p-3 md:h-full">
	                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm md:h-11 md:w-11">
	                                        <item.icon size={17} className="md:h-5 md:w-5" />
	                                    </div>
	                                    <div className="min-w-0 flex-1">
	                                        <div className="flex items-center gap-1.5 md:gap-2">
	                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white md:h-6 md:w-6 md:text-xs">{index + 1}</span>
                                            <h3 className="line-clamp-2 text-xs font-bold leading-4 text-slate-900 md:text-sm">{item.title}</h3>
	                                        </div>
	                                        <p className="mt-1 text-[11px] font-semibold text-orange-700 md:text-xs">{item.tag}</p>
	                                    </div>
	                                </div>
                            ))}
                        </div>
                    </section>
                </div>

	                <div id="license" className="mt-6 grid scroll-mt-24 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
	                    <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
	                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-4 md:text-xl">5. So sánh phiên bản</h2>
	                        <div className="overflow-x-auto rounded-xl border border-slate-100">
	                            <table className="w-full min-w-[560px] table-fixed border-collapse text-xs md:text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
	                                        <th className="border-b border-r border-slate-100 p-2 md:p-3">Tính năng</th>
	                                        <th className="border-b border-r border-slate-100 p-2 text-center md:p-3">Personal</th>
	                                        <th className="border-b border-r border-orange-200 bg-orange-50 p-2 text-center text-orange-700 md:p-3">Business</th>
	                                        <th className="border-b border-slate-100 p-2 text-center md:p-3">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Số lượng Screens', '20+', '30+', '30+'],
                                        ['UI Components', '100+', '150+', '150+'],
                                        ['Responsive Ready', 'âœ“', 'âœ“', 'âœ“'],
                                        ['Hỗ trợ', 'Email', 'Ưu tiên', '24/7'],
                                        ['Cập nhật miễn phí', '6 tháng', 'Trọn đời', 'Trọn đời'],
                                        ['Quyền truy cập', 'Demo tham khảo', 'Tư vấn triển khai', 'Theo nhu cầu'],
                                        ['Chi phí', isCatalogMode ? 'Liên hệ tư vấn' : formatPrice(Math.max(product.price * 0.65, 0)), isCatalogMode ? 'Liên hệ tư vấn' : formatPrice(product.price), isCatalogMode ? 'Theo dự án' : formatPrice(product.price * 2.6)],
                                    ].map((row) => (
                                        <tr key={row[0]} className="text-slate-700">
                                            {row.map((cell, index) => (
	                                                <td key={index} className={`border-b ${index < row.length - 1 ? 'border-r' : ''} border-slate-100 p-2 md:p-3 ${index > 0 ? 'text-center font-bold' : 'font-medium'} ${index === 2 ? 'bg-orange-50/60 text-orange-700' : ''}`}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

	                    <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm md:p-6">
	                        <h2 className="mb-3 text-lg font-bold text-slate-950 md:mb-5 md:text-xl">Quyền sử dụng & phạm vi tư vấn</h2>
	                        <div className="mb-4 flex h-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-white text-indigo-600 ring-1 ring-indigo-100 md:mb-5 md:h-28">
	                            <FileCheck2 size={42} className="md:h-[70px] md:w-[70px]" />
	                        </div>
	                        <div className="space-y-2 md:space-y-3">
	                            {['Truy cập mẫu demo để tham khảo', 'Tư vấn triển khai theo nhu cầu', 'Không phân phối lại tài nguyên gốc', 'Bàn giao theo phạm vi từng mẫu', 'Hỗ trợ kỹ thuật theo nhu cầu'].map((item) => (
	                                <div key={item} className="flex items-center gap-2.5 text-xs font-semibold leading-5 text-slate-700 md:gap-3 md:text-sm"><Check size={16} className="shrink-0 text-orange-600 md:h-[18px] md:w-[18px]" /> {item}</div>
	                            ))}
	                        </div>
	                        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs leading-5 text-slate-600 md:mt-6 md:p-4 md:text-sm md:leading-6">
	                            <b className="text-indigo-700">Lưu ý quan trọng:</b> Quyền truy cập mẫu demo dùng để tham khảo và tư vấn triển khai theo nhu cầu dự án.
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-6">
                        <div className="mb-4 flex items-center gap-2 md:mb-5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
                                <MessageCircle size={19} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-950 md:text-xl">Câu hỏi thường gặp</h2>
                                <p className="text-xs font-medium text-slate-500 md:text-sm">Thông tin nhanh trước khi bạn liên hệ tư vấn.</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {FAQ_DATA.map((item, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div key={item.q}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : index)}
                                            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-xs font-bold text-slate-800 transition hover:bg-orange-50/60 md:px-4 md:py-3.5 md:text-sm"
                                            aria-expanded={isOpen}
                                        >
                                            <span>{item.q}</span>
                                            <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
                                        </button>
                                        {isOpen && <p className="px-3 pb-3 text-xs leading-5 text-slate-600 md:px-4 md:pb-4 md:text-sm md:leading-6">{item.a}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <section id="reviews-testimonials" className="hidden mt-5 scroll-mt-24 md:mt-8">
                    <h2 className="mb-5 text-xl font-bold text-slate-950">4. Khách hàng nói gì về {product.name}</h2>
                    <div className="relative overflow-hidden rounded-2xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#fffdf9] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#fffdf9] to-transparent" />
                        <div className="flex w-max gap-5 py-1 will-change-transform hover:[animation-play-state:paused]" style={{ animation: 'reviewsMarquee 38s linear infinite' }}>
                            {[...reviewItems, ...reviewItems].map((review, index) => (
                                <div key={`${review.name}-${index}`} className="w-[360px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:w-[420px]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 font-bold text-orange-700">{review.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-slate-900">{review.name}</p>
                                            <p className="text-xs font-semibold text-slate-500">{review.role}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex">{[...Array(5)].map((_, i) => <Star key={i} size={15} className="fill-amber-400 text-amber-400" />)}</div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <ReviewsSection
                    productId={product.id}
                    productRating={product.rating}
                    productReviewCount={product.reviews || product.review_count}
                    productName={product.name}
                    productCategory={typeof product.category === 'string' ? product.category : product.category?.name}
                    productTechnologies={(product.technology_variants || []).map((variant: any) => String(variant.technology || '')).filter(Boolean)}
                    isCatalogMode={isCatalogMode}
                />

                {relatedProducts.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <RelatedProducts currentProduct={product} relatedProducts={relatedProducts} />
                    </div>
                )}

                <div className="fixed left-0 top-1/2 z-30 -translate-y-1/2 md:hidden">
                    {mobileQuickBuyOpen ? (
                        <div className="ml-3 w-[min(82vw,280px)] overflow-hidden rounded-2xl border border-orange-100 bg-white/95 text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur-xl">
                            <div className="border-b border-orange-50 bg-gradient-to-r from-white to-orange-50/80 p-3">
                                <div className="flex items-start gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-200">
                                        {isCatalogMode ? <MessageCircle size={19} strokeWidth={2.4} /> : <ShoppingBag size={19} strokeWidth={2.4} />}
                                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">Tư vấn nhanh</p>
                                        <p className="truncate text-sm font-bold leading-5 text-slate-950">{product.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileQuickBuyOpen(false)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition active:scale-95 hover:bg-orange-50 hover:text-orange-600"
                                        aria-label="Thu gọn tư vấn nhanh"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex items-end justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-500">{isCatalogMode ? 'Giá tham khảo' : 'Giá hiện tại'}</p>
	                                        <p className="truncate text-2xl font-extrabold leading-none text-orange-600">{displayPrice}</p>
                                    </div>
	                                    {!isCatalogMode && discountPercent > 0 && (
                                        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">-{discountPercent}%</span>
                                    )}
                                </div>
                                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                                    <button onClick={handleAddToCart} className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-orange-100 transition active:scale-[0.98]">
	                                        {isCatalogMode ? <MessageCircle size={18} /> : <ShoppingCart size={18} />} {isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào danh sách'}
                                    </button>
                                    {demoUrl && (
                                        <button onClick={() => setShowDemoModal(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-white text-orange-700 transition active:scale-[0.98]" aria-label="Xem demo">
                                            <Play size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMobileQuickBuyOpen(true)}
                            className="group flex h-12 min-w-16 flex-row items-center justify-center gap-2 rounded-r-2xl border border-l-0 border-orange-100 bg-slate-950 px-3 text-white shadow-[0_12px_32px_rgba(15,23,42,0.24)] transition active:scale-95"
                            aria-label="Mở tư vấn nhanh"
                            aria-expanded={mobileQuickBuyOpen}
                        >
	                            {isCatalogMode ? <MessageCircle size={19} strokeWidth={2.4} /> : <ShoppingCart size={19} strokeWidth={2.4} />}
                            <ChevronRight size={15} className="rotate-180 text-orange-300 transition group-active:-translate-x-0.5" />
                        </button>
                    )}
                </div>

                {!isFooterVisible && <div className="fixed bottom-0 left-1/2 z-[35] hidden -translate-x-1/2 xl:block">
                    {shouldCompactDesktopQuickBuy || isTechnologyVariantVisible ? (
                        <button
                            type="button"
                            onClick={() => isTechnologyVariantVisible ? handleAddToCart() : setQuickBuyCollapsed(false)}
                            className="group flex items-center gap-2 rounded-t-lg border border-b-0 border-indigo-800 bg-slate-950/95 px-2.5 py-1.5 text-white shadow-[0_12px_35px_rgba(15,23,42,0.28)] backdrop-blur-xl transition hover:border-indigo-600"
                            aria-label="Mở tư vấn nhanh"
                        >
                            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-950/40 transition group-hover:bg-indigo-500">
                                {isCatalogMode ? <Headset size={19} strokeWidth={2.4} /> : <ShoppingBag size={19} strokeWidth={2.4} />}
                                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                            </span>
                            <span className="min-w-0 text-left">
                                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-indigo-300">Tư vấn nhanh</span>
                                <span className="block max-w-[220px] truncate text-sm font-extrabold text-white">{product.name}</span>
                            </span>
                            <ChevronRight size={18} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600" />
                        </button>
                    ) : (
                        <div className="w-[min(860px,calc(100vw-32px))] overflow-hidden rounded-t-lg border border-b-0 border-indigo-800 bg-slate-950/95 text-white shadow-[0_16px_45px_rgba(15,23,42,0.3)] backdrop-blur-2xl">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-950/40">
                                        {isCatalogMode ? <Headset size={20} strokeWidth={2.4} /> : <ShoppingBag size={20} strokeWidth={2.4} />}
                                        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-300">Tư vấn nhanh</p>
	                                            {!isCatalogMode && discountPercent > 0 && (
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-black text-rose-600">-{discountPercent}%</span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 truncate text-base font-extrabold leading-5 text-white">{product.name}</p>
                                        <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-slate-300">
                                            Gửi nhu cầu để nhận tư vấn mẫu phù hợp.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <div className="mr-0.5 text-right">
                                        <p className="text-[10px] font-bold text-slate-300">{isCatalogMode ? 'Giá tham khảo' : 'Giá hiện tại'}</p>
                                        <p className="text-lg font-black leading-none text-orange-300">{displayPrice}</p>
                                    </div>

                                    <button onClick={handleAddToCart} className="flex h-9 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-500 active:scale-[0.98]">
                                        {isCatalogMode ? <Headset size={18} strokeWidth={2.4} /> : <ShoppingBag size={18} strokeWidth={2.4} />}
                                        {isCatalogMode ? 'Nhận tư vấn' : 'Thêm vào danh sách'}
                                    </button>
                                    {demoUrl && (
                                        <button onClick={() => setShowDemoModal(true)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-700 bg-slate-900 text-indigo-200 transition hover:bg-indigo-900" aria-label="Xem demo">
                                            <Play size={18} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setQuickBuyCollapsed(true)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-indigo-500 hover:bg-indigo-900 hover:text-white"
                                        aria-label="Thu gọn tư vấn nhanh"
                                    >
                                        <ChevronDown size={19} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>}

                <ImageLightbox
                    isOpen={showLightbox}
                    onClose={closeLightbox}
                    images={images}
                    currentIndex={selectedImageIndex}
                    onNavigate={setSelectedImageIndex}
                />
                <style jsx>{`
                    @keyframes reviewsMarquee {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                `}</style>
                <style jsx global>{`
                    .product-rich-content {
                        color: #475569;
                        font-weight: 500;
                        line-height: 1.8;
                    }
                    .product-rich-content h1,
                    .product-rich-content h2,
                    .product-rich-content h3,
                    .product-rich-content h4 {
                        margin: 1.45rem 0 0.85rem;
                        color: #0f172a;
                        font-weight: 900;
                        letter-spacing: 0;
                        line-height: 1.22;
                    }
                    .product-rich-content h1 {
                        font-size: clamp(1.75rem, 3vw, 2.35rem);
                    }
                    .product-rich-content h2 {
                        display: flex;
                        align-items: center;
                        gap: 0.85rem;
                        font-size: clamp(1.35rem, 2.5vw, 1.85rem);
                    }
                    .product-rich-content h2::before {
                        content: "";
                        display: inline-block;
                        width: 6px;
                        height: 1.35em;
                        flex: 0 0 auto;
                        border-radius: 999px;
                        background: linear-gradient(180deg, #fb923c, #ea580c);
                    }
                    .product-rich-content h3 {
                        font-size: 1.22rem;
                    }
                    .product-rich-content p {
                        margin: 0 0 0.9rem;
                    }
                    .product-rich-content ul,
                    .product-rich-content ol {
                        margin: 0.9rem 0 1.25rem;
                        padding-left: 1.5rem;
                    }
                    .product-rich-content ul { list-style: disc; }
                    .product-rich-content ol { list-style: decimal; }
                    .product-rich-content li {
                        margin: 0.52rem 0;
                        padding-left: 0.15rem;
                    }
                    .product-rich-content h2 + ul,
                    .product-rich-content h2 + ol,
                    .product-rich-content h3 + ul,
                    .product-rich-content h3 + ol {
                        border-radius: 1rem;
                        background: #f8fafc;
                        padding: 1rem 1.25rem 1rem 2.55rem;
                    }
                    .product-rich-content div {
                        max-width: 100%;
                    }
                    .product-rich-content blockquote {
                        margin: 1.25rem 0;
                        border-left: 4px solid #f97316;
                        border-radius: 0 1rem 1rem 0;
                        background: #fff7ed;
                        padding: 1rem 1.1rem;
                        color: #475569;
                    }
                    .product-rich-content a {
                        color: #ea580c;
                        font-weight: 700;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                    }
                    .product-rich-content img {
                        margin: 1.25rem 0;
                        max-width: 100%;
                        height: auto;
                        border-radius: 1rem;
                        border: 1px solid #fed7aa;
                        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
                    }
                    .product-rich-content table {
                        margin: 1rem 0;
                        width: 100%;
                        border-collapse: collapse;
                        overflow: hidden;
                        border-radius: 0.9rem;
                        font-size: 0.92rem;
                    }
                    .product-rich-content th,
                    .product-rich-content td {
                        border: 1px solid #e2e8f0;
                        padding: 0.75rem;
                        text-align: left;
                    }
                    .product-rich-content th {
                        background: #f8fafc;
                        color: #0f172a;
                        font-weight: 800;
                    }
                    .product-rich-content code {
                        border-radius: 0.4rem;
                        background: #f1f5f9;
                        padding: 0.15rem 0.35rem;
                        color: #c2410c;
                        font-size: 0.9em;
                    }
                    .product-rich-content pre {
                        overflow-x: auto;
                        border-radius: 1rem;
                        background: #0f172a;
                        padding: 1rem;
                        color: #e2e8f0;
                    }
                    .product-rich-content hr {
                        margin: 1.4rem 0;
                        border: 0;
                        border-top: 1px solid #e2e8f0;
                    }
                `}</style>
            </main>

            {demoUrl && (
                <DemoPreviewModal
                    isOpen={showDemoModal}
                    onClose={() => setShowDemoModal(false)}
                    demoUrl={demoUrl}
                    productName={product.name}
                />
            )}
        </div>
    );
};

// Helper Components
const HomeIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
)

const ArrowRightLeftIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
)



