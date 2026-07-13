'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Brain, ArrowRight, Check, Sparkles, RefreshCw,
    Monitor, Briefcase, Smile, Coffee, TrendingUp, Users, Target,
    Zap, Layers, Award, Clock, ShoppingCart, Heart, Share2, Star, MessageCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';
import confetti from 'canvas-confetti';
import type { Product } from '@/types';
import { getProductTypeSoftStyle } from '@/lib/productTypeDisplay';

const stripHtml = (value?: string | null) =>
    String(value || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

// ========== TYPES ==========
interface AIAnswers {
    goal?: string;
    tech?: string;
    style?: string;
    budget?: string;
}

interface QuestionOption {
    id: string;
    label: string;
    icon: any;
    color: string;
}

interface Question {
    id: string;
    question: string;
    options: QuestionOption[];
}

// ========== DATA CONFIGURATION ==========
const QUESTIONS: Question[] = [
    {
        id: 'goal',
        question: 'Bạn cần giao diện website cho mục đích gì?',
        options: [
            { id: 'business', label: 'Website doanh nghiệp / Landing Page', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
            { id: 'ecommerce', label: 'Cửa hàng online / E-commerce', icon: ShoppingCart, color: 'bg-green-100 text-green-600' },
            { id: 'portfolio', label: 'Portfolio / Blog cá nhân', icon: Users, color: 'bg-purple-100 text-purple-600' },
            { id: 'app', label: 'Ứng dụng Mobile / Dashboard', icon: Monitor, color: 'bg-amber-100 text-amber-600' },
        ],
    },
    {
        id: 'tech',
        question: 'Bạn sử dụng công nghệ/nền tảng nào?',
        options: [
            { id: 'react', label: 'React / Next.js', icon: Zap, color: 'bg-cyan-100 text-cyan-600' },
            { id: 'figma', label: 'Figma / UI Kit', icon: Layers, color: 'bg-purple-100 text-purple-600' },
            { id: 'vue', label: 'Vue.js', icon: Layers, color: 'bg-emerald-100 text-emerald-600' },
            { id: 'backend', label: 'Laravel / Django / .NET', icon: Monitor, color: 'bg-indigo-100 text-indigo-600' },
            { id: 'html', label: 'HTML/CSS Thuần', icon: Award, color: 'bg-orange-100 text-orange-600' },
            { id: 'any', label: 'Khác / Không quan trọng', icon: Target, color: 'bg-pink-100 text-pink-600' },
        ],
    },
    {
        id: 'style',
        question: 'Phong cách thiết kế bạn yêu thích?',
        options: [
            { id: 'minimal', label: 'Tối giản (Minimal)', icon: Coffee, color: 'bg-slate-100 text-slate-600' },
            { id: 'modern', label: 'Hiện đại (Modern)', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
            { id: 'creative', label: 'Sáng tạo (Creative)', icon: Smile, color: 'bg-rose-100 text-rose-600' },
            { id: 'corporate', label: 'Chuyên nghiệp (Corporate)', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
        ],
    },
    {
        id: 'budget',
        question: 'Ngân sách dự kiến của bạn?',
        options: [
            { id: 'low', label: 'Dưới 500K', icon: Zap, color: 'bg-green-100 text-green-600' },
            { id: 'medium', label: '500K - 1 triệu', icon: Layers, color: 'bg-amber-100 text-amber-600' },
            { id: 'high', label: 'Trên 1 triệu', icon: Award, color: 'bg-red-100 text-red-600' },
        ],
    },
];

const ANALYSIS_LOGS = [
    'Đang kết nối tới máy chủ tri thức...',
    'Đang phân tích hành vi học tập...',
    'Đang tổng hợp dữ liệu xu hướng...',
    'Đang cá nhân hóa lộ trình...',
    'Hoàn tất!',
];

// ========== AI LOGIC ==========
// Generate reasoning text based on answers
const generateReasoning = (answers: AIAnswers): string => {
    const goalMap: Record<string, string> = {
        business: 'website doanh nghiệp / landing page',
        ecommerce: 'cửa hàng online / e-commerce',
        portfolio: 'portfolio / blog cá nhân',
        app: 'ứng dụng mobile / dashboard',
    };

    const techMap: Record<string, string> = {
        react: 'React / Next.js',
        figma: 'Figma / UI Kit',
        vue: 'Vue.js',
        backend: 'Laravel / Django / .NET',
        html: 'HTML/CSS thuần',
        any: 'linh hoạt'
    };

    const styleMap: Record<string, string> = {
        minimal: 'tối giản',
        modern: 'hiện đại',
        creative: 'sáng tạo',
        corporate: 'chuyên nghiệp',
    };

    const goal = goalMap[answers.goal || ''] || 'đa dạng mục đích';
    const tech = techMap[answers.tech || ''] || 'công nghệ phổ biến';
    const style = styleMap[answers.style || ''] || 'phong cách đa dạng';

    let intro = `Dựa trên phân tích, bạn đang tìm kiếm giao diện website cho **${goal}** với nền tảng **${tech}**. `;
    intro += `Phong cách thiết kế **${style}** được ưu tiên để phù hợp với thị hiếu của bạn. `;

    let advice = '';
    if (answers.budget === 'low') {
        advice = 'Với ngân sách tiết kiệm, AI đã chọn lọc những mẫu demo có giá trị tốt nhất trong tầm giá. ';
    } else if (answers.budget === 'high') {
        advice = 'Với ngân sách premium, chúng tôi đề xuất những mẫu demo cao cấp nhất với đầy đủ tính năng. ';
    } else {
        advice = 'Chúng tôi đã cân nhắc cả chất lượng và giá thành để đề xuất mẫu phù hợp nhất. ';
    }

    return `${intro}${advice}`;
};

// ========== SUB-COMPONENTS ==========

// Typewriter Text Component
const TypewriterText = memo(({
    text,
    speed = 25,
    onComplete
}: {
    text: string;
    speed?: number;
    onComplete?: () => void;
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Reset states
        setDisplayedText('');
        setIsComplete(false);

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    return (
        <span>
            {displayedText}
            {!isComplete && <span className="animate-pulse">|</span>}
        </span>
    );
});
TypewriterText.displayName = 'TypewriterText';

// Question Card Component
const AIQuestionCard = memo(({
    option,
    onSelect
}: {
    option: QuestionOption;
    onSelect: () => void;
}) => {
    const Icon = option.icon;

    return (
        <button
            onClick={onSelect}
            className="group flex min-h-[72px] w-full items-center rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg active:scale-[0.98] md:p-4"
        >
            <div className={`mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${option.color} group-hover:scale-105`}>
                <Icon size={22} />
            </div>
            <div className="flex-1">
                <span className="text-sm font-bold leading-5 text-slate-700 transition-colors group-hover:text-blue-900 md:text-base">
                    {option.label}
                </span>
            </div>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 transition-all group-hover:border-blue-600 group-hover:bg-blue-600">
                <Check size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
});
AIQuestionCard.displayName = 'AIQuestionCard';

// Product Card Component
const AIProductCard = memo(({
    product,
    index
}: {
    product: Product;
    index: number;
}) => {
    const router = useRouter();
    const { addToCart, addToWishlist, isInWishlist } = useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCatalogMode) {
            addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
            router.push(`/contact?product=${encodeURIComponent(String((product as any).slug || product.id))}`);
            return;
        }
        addToCart(product);
        addToast('Đã thêm vào danh sách quan tâm', 'success');
    }, [product, addToCart, addToast, router, isCatalogMode]);

    const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        addToWishlist(product);
        addToast(
            isInWishlist(product.id) ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích',
            'success'
        );
    }, [product, addToWishlist, isInWishlist, addToast]);

    const isTopChoice = index === 0;
    const isWishlisted = isInWishlist(product.id);

    return (
        <article className="group bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-orange-100 transition-all duration-300 flex flex-col sm:flex-row gap-4 md:gap-6 relative overflow-hidden transform hover:-translate-y-1">
            {isTopChoice && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl z-10 shadow-lg uppercase tracking-wider flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Best Choice
                </div>
            )}

            <div
                className="w-full sm:w-44 md:w-52 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer group/image"
                onClick={() => router.push(`/product/${product.id}`)}
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 208px"
                    className="object-cover group-hover/image:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
            </div>

            <div className="flex-1 flex flex-col py-1">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {product.category}
                    </span>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getProductTypeSoftStyle(product.format)}`}>
                        {product.format}
                    </span>
                </div>

                <h4
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="text-lg md:text-xl font-black text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 cursor-pointer leading-tight"
                >
                    {product.name}
                </h4>

	                <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
	                    {stripHtml(product.description)}
	                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-black text-orange-700">
                            {product.price.toLocaleString('vi-VN')}₫
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                                {product.originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleWishlist}
                            className={`p-2.5 rounded-xl border transition-all ${isWishlisted
                                ? 'text-rose-500 bg-rose-50 border-rose-200'
                                : 'text-slate-400 border-slate-200 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200'
                                }`}
                            title={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
                            aria-label="Add to cart"
                        >
                            <ShoppingCart size={16} />
                            <span className="hidden md:inline">Thêm</span>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
});
AIProductCard.displayName = 'AIProductCard';

// ========== MAIN COMPONENT ==========
export default function AIRecommendationPage() {
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<AIAnswers>({});
    const [results, setResults] = useState<Product[]>([]);
    const [reasoning, setReasoning] = useState('');
    const [poweredByAi, setPoweredByAi] = useState(false);
    const [hasMatches, setHasMatches] = useState(true);
    const [analysisLog, setAnalysisLog] = useState<string[]>([]);
    // Use a ref to track if we already started analysis to prevent double fetching
    const analysisStarted = React.useRef(false);

    const handleShareResults = useCallback(async () => {
        const shareData = {
            title: 'Gợi ý giao diện từ Web Giá Rẻ - Portfolio',
            text: reasoning || 'Xem công cụ AI tư vấn giao diện phù hợp tại Web Giá Rẻ - Portfolio.',
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                addToast('Đã sao chép liên kết kết quả', 'success');
            }
        } catch {
            // Người dùng đóng hộp thoại chia sẻ.
        }
    }, [addToast, reasoning]);

    const handleAnswer = useCallback((key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));

        setTimeout(() => {
            if (step < QUESTIONS.length) {
                setStep(step + 1);
            } else {
                // All questions answered, start analysis
                setStep(QUESTIONS.length + 1); // Move to analysis step (5)
            }
        }, 250);
    }, [step]);

    // Effect to trigger analysis when we reach the analysis step
    useEffect(() => {
        if (step === 5 && !analysisStarted.current) {
            analysisStarted.current = true;
            startAnalysis();
        }
        // Reset ref if step goes back to 0
        if (step === 0) {
            analysisStarted.current = false;
        }
    }, [step]);

    const startAnalysis = async () => {
        setAnalysisLog([]);

        // 1. Simulate Analysis Logs for visual effect
        let i = 0;
        const interval = setInterval(() => {
            if (i < ANALYSIS_LOGS.length) {
                setAnalysisLog(prev => [...prev, ANALYSIS_LOGS[i]]);
                i++;
            } else {
                clearInterval(interval);
                // Animation done, now show results (products already fetched in parallel below)
                finalizeResults();
            }
        }, 600);

        // 2. Fetch AI recommendations from backend in parallel
        try {
            const response = await fetch('/api/ai-recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Không thể tạo gợi ý AI');
            }

            // Store them in state, but wait for animation to clear interval to switch step
            setResults(data.products || []);
            setReasoning(data.reasoning || generateReasoning(answers));
            setPoweredByAi(Boolean(data.poweredByAi));
            setHasMatches(Boolean(data.hasMatches));
        } catch (error) {
            console.error("Failed to fetch AI products", error);
            setResults([]);
            setReasoning(generateReasoning(answers));
            setPoweredByAi(false);
            setHasMatches(false);
        }
    };

    const finalizeResults = () => {
        setStep(6); // Show results step
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#f59e0b', '#10b981'],
        });
    };

    const resetQuiz = useCallback(() => {
        setAnswers({});
        setStep(0);
        setResults([]);
        setAnalysisLog([]);
        setReasoning('');
        setPoweredByAi(false);
        setHasMatches(true);
        analysisStarted.current = false;
    }, []);

    const bundlePrice = useMemo(() =>
        results.reduce((sum, p) => sum + p.price, 0),
        [results]
    );

    const bundleDiscountPrice = useMemo(() =>
        Math.floor(bundlePrice * 0.85),
        [bundlePrice]
    );

    const handleBuyBundle = useCallback(() => {
        if (results.length === 0) {
            addToast(isCatalogMode ? 'Chưa có mẫu phù hợp để tư vấn' : 'Chưa có mẫu phù hợp để thêm vào danh sách quan tâm', 'warning');
            return;
        }
        if (isCatalogMode) {
            const firstProduct = results[0];
            addToast('Mình sẽ chuyển bạn sang trang liên hệ để nhận tư vấn lộ trình.', 'info');
            router.push(`/contact?product=${encodeURIComponent(String((firstProduct as any).slug || firstProduct.id))}`);
            return;
        }
        results.forEach(p => addToCart(p));
        addToast('Đã thêm trọn bộ lộ trình vào danh sách quan tâm!', 'success');
        router.push('/cart');
    }, [results, addToCart, addToast, router, isCatalogMode]);

    // ========== RENDER: INTRO ==========
    if (step === 0) {
        return (
            <div className="relative h-[100dvh] w-full overflow-hidden bg-[#07111f] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.24),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_52%_10%,rgba(249,115,22,0.13),transparent_24%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:56px_56px]" />

                <header className="relative z-20 flex h-14 items-center justify-between border-b border-white/10 px-3 sm:h-16 sm:px-7 lg:px-10">
                    <button onClick={() => router.push('/')} className="flex items-center gap-3 text-left" aria-label="Về trang chủ">
                        <Image src="/logo_webgiare_display.webp" alt="Web Giá Rẻ" width={150} height={48} className="h-7 w-auto object-contain sm:h-9" priority />
                        <span className="hidden h-6 w-px bg-white/15 sm:block" />
                        <span className="hidden text-xs font-bold text-slate-300 sm:block">AI Design Advisor</span>
                    </button>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-[9px] font-bold text-emerald-300 sm:gap-2 sm:px-3 sm:text-[11px]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 sm:h-2 sm:w-2" /> Gemini AI sẵn sàng
                    </div>
                </header>

                <main className="relative z-10 mx-auto grid h-[calc(100dvh-3.5rem)] max-w-7xl grid-rows-[auto_minmax(0,1fr)] items-stretch gap-3 px-3 py-3 sm:h-[calc(100dvh-4rem)] sm:gap-4 sm:px-7 sm:py-4 lg:grid-cols-[0.88fr_1.12fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-10 lg:py-8">
                    <section className="flex min-w-0 flex-col justify-start lg:justify-center">
                        <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-blue-200 sm:mb-3 sm:text-[10px] lg:mb-4">
                            <Sparkles size={13} /> Tư vấn giao diện bằng AI
                        </span>
                        <h1 className="max-w-2xl text-[1.75rem] font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[3.6rem]">
                            Chọn đúng giao diện cho <span className="text-orange-400">dự án của bạn.</span>
                        </h1>
                        <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:mt-3 sm:text-sm sm:leading-6 lg:mt-4 lg:text-base lg:leading-7">
                            Trả lời 4 câu hỏi ngắn. Gemini AI sẽ phân tích mục tiêu, nền tảng, phong cách và ngân sách để đề xuất những mẫu phù hợp nhất.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2 lg:mt-6 lg:gap-2.5">
                            {['4 câu hỏi nhanh', 'Dữ liệu mẫu thực tế', 'Kết quả cá nhân hóa'].map((item) => (
                                <span key={item} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 sm:px-3 sm:py-2 sm:text-xs"><Check size={12} className="text-emerald-400" />{item}</span>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 sm:mt-5 sm:gap-3 lg:mt-7">
                            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-xs font-black text-white shadow-[0_14px_35px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-400 sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm">
                                Bắt đầu tư vấn <ArrowRight size={18} />
                            </button>
                            <button onClick={() => router.push('/')} className="rounded-xl border border-white/10 px-3 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/5 hover:text-white sm:rounded-2xl sm:px-4 sm:py-3.5 sm:text-sm">Về trang chủ</button>
                        </div>
                    </section>

                    <section className="relative mx-auto flex min-h-0 h-full w-full max-w-[650px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-2xl backdrop-blur-xl lg:max-h-[620px] lg:rounded-[32px]">
                        <div className="absolute left-3 top-3 z-10 rounded-xl border border-white/10 bg-slate-950/70 px-2.5 py-1.5 backdrop-blur sm:left-5 sm:top-5 sm:rounded-2xl sm:px-3 sm:py-2">
                            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">AI matching</p><p className="mt-0.5 text-[10px] font-black text-white sm:text-sm">Đề xuất theo thời gian thực</p>
                        </div>
                        <Image src="/ai-assistant-studio.webp" alt="Trợ lý AI tư vấn giao diện website" fill priority sizes="(max-width: 1024px) 100vw, 650px" className="object-cover" />
                        <div className="absolute inset-x-2 bottom-2 grid grid-cols-3 gap-1.5 sm:inset-x-5 sm:bottom-5 sm:gap-2">
                            {[['1.200+', 'Mẫu giao diện'], ['98%', 'Khớp nhu cầu'], ['24/7', 'Tư vấn AI']].map(([value, label]) => (
                                <div key={label} className="rounded-xl border border-white/10 bg-slate-950/75 px-1 py-1.5 text-center backdrop-blur-md sm:rounded-2xl sm:px-2 sm:py-2.5"><p className="text-xs font-black text-white sm:text-lg">{value}</p><p className="text-[7px] font-semibold text-slate-400 sm:text-[10px]">{label}</p></div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        );
    }


    // ========== RENDER: ANALYZING ==========
    if (step === 5) {
        return (
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#07111f] p-4 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_70%_75%,rgba(249,115,22,0.12),transparent_30%)]" />
                <div className="relative mb-7 h-24 w-24">
                    <div className="absolute inset-0 rounded-full border border-blue-400/20 bg-blue-400/5" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-500 border-t-orange-400" />
                    <Brain className="absolute inset-0 m-auto animate-pulse text-cyan-300" size={38} />
                </div>
                <div className="relative mb-6 text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Gemini AI đang làm việc</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Đang tìm lựa chọn phù hợp nhất</h1></div>
                <div className="relative w-full max-w-md space-y-2 rounded-3xl border border-white/10 bg-white/[0.055] p-5 font-mono backdrop-blur-xl">
                    {analysisLog.map((log, idx) => (
                        <div
                            key={idx}
                            className="flex animate-fade-in-up items-center gap-3 text-xs text-slate-300 sm:text-sm"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <Check size={14} className="flex-shrink-0 text-emerald-400" />
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ========== RENDER: RESULT ==========
    if (step === 6) {
        return (
            <div className="h-[100dvh] w-full overflow-hidden bg-[#f4f7fb] px-3 py-3 sm:px-5 sm:py-4">
                <div className="mx-auto flex h-full max-w-7xl flex-col">
                    <header className="mb-3 flex h-14 shrink-0 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                        <button onClick={() => router.push('/')} className="flex items-center gap-3"><Image src="/logo_webgiare_display.webp" alt="Web Giá Rẻ" width={130} height={40} className="h-8 w-auto object-contain" /><span className="hidden text-sm font-black text-slate-800 sm:block">AI Design Advisor</span></button>
                        <div className="flex items-center gap-2"><button onClick={handleShareResults} className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" aria-label="Chia sẻ"><Share2 size={17} /></button><button onClick={resetQuiz} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"><RefreshCw size={15} /> Làm lại</button></div>
                    </header>
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[330px_1fr]">
                        {/* AI Insight Sidebar */}
                        <aside className="hidden min-h-0 lg:block">
                            <div className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-t-2xl" />

                                <div className="mb-4 flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${poweredByAi
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        <Sparkles size={10} /> {poweredByAi ? 'Gemini AI' : 'Smart Fallback'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleShareResults}
                                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-slate-50 rounded-full transition-colors"
                                            title="Chia sẻ"
                                            aria-label="Share"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <button
                                            onClick={resetQuiz}
                                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-slate-50 rounded-full transition-colors"
                                            title="Làm lại"
                                            aria-label="Reset"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h2 className="mb-3 text-2xl font-black text-slate-900">
                                    Lộ Trình Của Bạn
                                </h2>

                                <div className="mb-4 text-slate-600">
                                    <p className="line-clamp-5 text-sm leading-6 italic">
                                        &quot;{reasoning}&quot;
                                    </p>
                                </div>

                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-700 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                        <div className="p-1.5 bg-orange-100 rounded-full text-orange-600">
                                            <Check size={12} />
                                        </div>
                                        <span>Phù hợp 98% với mục tiêu</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-slate-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                                            <Clock size={12} />
                                        </div>
                                        <span>Thời gian hoàn thành: 3 tháng</span>
                                    </div>
                                </div>

                                {/* Bundle Card */}
                                {results.length > 0 && (
                                <div className="group relative overflow-hidden rounded-2xl bg-slate-900 p-4 text-white shadow-lg transition-transform">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                                                    Ưu Đãi Đặc Biệt
                                                </p>
                                                <h3 className="text-lg md:text-xl font-bold">{isCatalogMode ? 'Tư vấn trọn bộ lộ trình' : 'Tư Vấn Trọn Bộ Lộ Trình'}</h3>
                                            </div>
                                            <div className="bg-white/10 p-2 rounded-lg">
                                            {isCatalogMode ? <MessageCircle size={20} className="text-white" /> : <ShoppingCart size={20} className="text-white" />}
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-3 mb-6">
                                            <span className="text-2xl md:text-3xl font-bold text-white">
                                                {bundleDiscountPrice.toLocaleString('vi-VN')}₫
                                            </span>
                                            <span className="text-sm text-slate-400 line-through mb-1">
                                                {bundlePrice.toLocaleString('vi-VN')}₫
                                            </span>
                                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">
                                                -15%
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleBuyBundle}
                                            className="w-full bg-white text-orange-900 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {isCatalogMode ? <MessageCircle size={16} /> : <ShoppingCart size={16} />}
                                            {isCatalogMode ? 'Nhận tư vấn lộ trình' : 'Thêm Tất Cả Vào Giỏ'}
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-600 rounded-full blur-2xl opacity-50" />
                                </div>
                                )}
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <h3 className="mb-3 flex shrink-0 items-center gap-2 text-lg font-black text-slate-900 md:text-xl">
                                <Sparkles className="text-amber-500" size={24} fill="currentColor" />
                                {hasMatches ? 'Đề Xuất Hàng Đầu' : 'Chưa Có Sản Phẩm Khớp'}
                            </h3>
                            {results.length > 0 ? (
                                <div className="min-h-0 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
                                    {results.slice(0, 3).map((product, idx) => (
                                        <AIProductCard key={product.id} product={product} index={idx} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 text-center shadow-sm">
                                    <Target size={44} className="mx-auto text-slate-300 mb-4" />
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Chưa tìm thấy mẫu demo đúng tiêu chí</h4>
                                    <p className="text-slate-500 max-w-lg mx-auto mb-6">
                                        Bạn có thể quay lại và nới ngân sách, chọn nền tảng linh hoạt hơn hoặc đổi phong cách thiết kế để AI tìm thêm lựa chọn.
                                    </p>
                                    <button
                                        onClick={resetQuiz}
                                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700 transition-colors"
                                    >
                                        <RefreshCw size={16} />
                                        Chọn lại tiêu chí
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========== RENDER: QUESTIONS ==========
    const currentQuestion = QUESTIONS[step - 1];

    return (
        <div className="relative flex h-[100dvh] w-full items-center overflow-hidden bg-[#f4f7fb] px-4 py-4 sm:px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.09),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(124,58,237,0.08),transparent_30%)]" />
            <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center">
                <div className="mx-auto flex h-[min(620px,calc(100dvh-2rem))] w-full max-w-4xl flex-col">
                {/* Progress Bar */}
                <div className="mb-4 shrink-0">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                        <span>Bước {step}/{QUESTIONS.length}</span>
                        <span>{Math.round((step / QUESTIONS.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-600 transition-all duration-500 ease-out"
                            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] md:p-7">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Brain size={180} />
                    </div>

                    <h2 className="relative z-10 mb-4 min-h-[2.5em] text-xl font-black leading-tight text-slate-900 md:text-3xl">
                        <TypewriterText text={currentQuestion.question} />
                    </h2>

                    <div className="relative z-10 mt-auto grid min-h-0 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                        {currentQuestion.options.map(option => (
                            <AIQuestionCard
                                key={option.id}
                                option={option}
                                onSelect={() => handleAnswer(currentQuestion.id, option.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-4 shrink-0 text-center">
                    <button
                        onClick={() => (step > 1 ? setStep(step - 1) : router.push('/'))}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                    >
                        {step > 1 ? '← Quay lại câu trước' : 'Hủy bỏ'}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
}
