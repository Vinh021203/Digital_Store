'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Brain, ArrowRight, Check, Sparkles, RefreshCw, BookOpen,
    Monitor, Briefcase, Smile, Coffee, TrendingUp, Users, Target,
    Zap, Layers, Award, Clock, ShoppingCart, Heart, Share2, Star
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import confetti from 'canvas-confetti';
import type { Product } from '@/types';

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
        question: 'Bạn cần sản phẩm số cho mục đích gì?',
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
            { id: 'wordpress', label: 'WordPress', icon: Layers, color: 'bg-blue-100 text-blue-600' },
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
        wordpress: 'WordPress',
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

    let intro = `Dựa trên phân tích, bạn đang tìm kiếm sản phẩm số cho **${goal}** với nền tảng **${tech}**. `;
    intro += `Phong cách thiết kế **${style}** được ưu tiên để phù hợp với thị hiếu của bạn. `;

    let advice = '';
    if (answers.budget === 'low') {
        advice = 'Với ngân sách tiết kiệm, AI đã chọn lọc những sản phẩm có giá trị tốt nhất trong tầm giá. ';
    } else if (answers.budget === 'high') {
        advice = 'Với ngân sách premium, chúng tôi đề xuất những sản phẩm cao cấp nhất với đầy đủ tính năng. ';
    } else {
        advice = 'Chúng tôi đã cân nhắc cả chất lượng và giá thành để đề xuất sản phẩm phù hợp nhất. ';
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
            className="w-full p-4 md:p-5 rounded-2xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 transition-all group flex items-center text-left hover:shadow-lg active:scale-[0.98]"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all ${option.color} group-hover:scale-110`}>
                <Icon size={22} />
            </div>
            <div className="flex-1">
                <span className="text-base md:text-lg font-bold text-slate-700 group-hover:text-orange-900 transition-colors">
                    {option.label}
                </span>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-orange-600 group-hover:bg-orange-600 flex items-center justify-center transition-all">
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

    const handleAddToCart = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product);
        addToast('Đã thêm vào giỏ hàng', 'success');
    }, [product, addToCart, addToast]);

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
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${product.format === 'Theme'
                        ? 'bg-blue-50 text-blue-600'
                        : product.format === 'Landing'
                            ? 'bg-purple-50 text-purple-600'
                            : product.format === 'Template'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-orange-50 text-orange-600'
                        }`}>
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
                    {product.description}
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

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<AIAnswers>({});
    const [results, setResults] = useState<Product[]>([]);
    const [reasoning, setReasoning] = useState('');
    const [poweredByAi, setPoweredByAi] = useState(false);
    const [hasMatches, setHasMatches] = useState(true);
    const [analysisLog, setAnalysisLog] = useState<string[]>([]);
    // Use a ref to track if we already started analysis to prevent double fetching
    const analysisStarted = React.useRef(false);

    useEffect(() => {
        // Hide navbar and footer
        const navbar = document.querySelector('nav');
        const footer = document.querySelector('footer');

        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';

        // Show them back on unmount
        return () => {
            if (navbar) navbar.style.display = '';
            if (footer) footer.style.display = '';
        };
    }, []);


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
            addToast('Chưa có sản phẩm phù hợp để thêm vào giỏ hàng', 'warning');
            return;
        }
        results.forEach(p => addToCart(p));
        addToast('Đã thêm trọn bộ lộ trình vào giỏ hàng!', 'success');
        router.push('/cart');
    }, [results, addToCart, addToast, router]);

    // ========== RENDER: INTRO ==========
    if (step === 0) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
                {/* ✨ Premium Gradient Background - BRAND COLORS */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900 via-slate-900 to-black" />

                {/* ✨ Animated Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]" />

                {/* ✨ Floating Orbs - BRAND COLORS */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Large orbs */}
                    <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-gradient-to-br from-orange-500/30 to-red-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-float-slow" />
                    <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-red-500/25 to-amber-600/25 rounded-full mix-blend-screen filter blur-[140px] animate-float-delayed" />
                    <div className="absolute bottom-[10%] left-[40%] w-80 h-80 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-float" />

                    {/* Small accent orbs */}
                    <div className="absolute top-[20%] right-[30%] w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse-slow" />
                    <div className="absolute bottom-[30%] right-[20%] w-48 h-48 bg-gradient-to-br from-red-500/25 to-orange-600/25 rounded-full mix-blend-screen filter blur-[90px] animate-float-slow" />
                </div>

                {/* ✨ Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-orange-400/40 rounded-full animate-float-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`,
                            }}
                        />
                    ))}
                </div>

                {/* ✨ Spotlight Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

                {/* 🎴 Main Card */}
                <div className="relative z-10 w-full max-w-md">
                    {/* Card with glassmorphism */}
                    <div className="relative group">
                        {/* Glow effect - BRAND COLORS */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse-slow" />

                        {/* Card content */}
                        <div className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                            {/* Icon with animated rings */}
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                {/* Animated rings */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 animate-ping opacity-20" />
                                <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 animate-pulse opacity-30" />

                                {/* Main icon */}
                                <div className="relative w-full h-full bg-gradient-to-br from-orange-500 via-red-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:scale-110 transition-transform duration-500">
                                    <Brain className="text-white animate-pulse" size={40} strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Title with gradient */}
                            <h1 className="text-2xl md:text-4xl font-black text-center mb-3 bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent leading-tight">
                                DigitalMart AI
                            </h1>

                            {/* Badge */}
                            <div className="flex justify-center mb-6">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-full text-orange-100 text-xs font-bold backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                                    </span>
                                    Powered by AI
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-orange-100/90 text-sm md:text-base mb-6 leading-relaxed text-center">
                                Trả lời 4 câu hỏi nhanh để AI đề xuất themes, templates phù hợp nhất với dự án của bạn.
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={() => setStep(1)}
                                className="group/btn relative w-full overflow-hidden rounded-xl"
                            >
                                {/* Animated gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 transition-transform duration-300 group-hover/btn:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-red-600 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />

                                {/* Button content */}
                                <span className="relative flex items-center justify-center gap-3 text-white font-bold text-lg py-4">
                                    Bắt đầu ngay
                                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            {/* Back button */}
                            <button
                                onClick={() => router.push('/')}
                                className="mt-6 w-full text-orange-200 hover:text-white text-sm font-semibold transition-colors py-2 rounded-lg hover:bg-white/5"
                            >
                                ← Quay lại trang chủ
                            </button>
                        </div>
                    </div>

                    {/* Floating stats */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        {[
                            { label: 'Người dùng', value: '50K+', icon: Users },
                            { label: 'Độ chính xác', value: '98%', icon: Target },
                            { label: 'Khóa học', value: '10K+', icon: BookOpen },
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all hover:scale-105 hover:border-orange-400/30 group"
                                >
                                    <div className="flex justify-center mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon size={20} className="text-orange-400" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-xs text-orange-200/80">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ✨ Enhanced Animations */}
                <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-40px, 40px) scale(1.1) rotate(5deg); }
          66% { transform: translate(40px, -30px) scale(0.9) rotate(-5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-particle {
          0% { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 15s ease-in-out infinite;
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
            </div>
        );
    }


    // ========== RENDER: ANALYZING ==========
    if (step === 5) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 relative mb-8">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
                    <Brain className="absolute inset-0 m-auto text-orange-400 animate-pulse" size={40} />
                </div>

                <div className="max-w-md w-full space-y-3 font-mono">
                    {analysisLog.map((log, idx) => (
                        <div
                            key={idx}
                            className="text-orange-400 text-sm animate-fade-in-up flex items-center gap-3"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <Check size={14} className="text-orange-500 flex-shrink-0" />
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
            <div className="min-h-screen bg-slate-50 py-8 md:py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* AI Insight Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 sticky top-24">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-t-2xl" />

                                <div className="flex justify-between items-center mb-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${poweredByAi
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        <Sparkles size={10} /> {poweredByAi ? 'Gemini AI' : 'Smart Fallback'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
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

                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                                    Lộ Trình Của Bạn
                                </h2>

                                <div className="prose prose-sm text-slate-600 mb-6">
                                    <p className="leading-relaxed text-sm md:text-base italic">
                                        &quot;{reasoning}&quot;
                                    </p>
                                </div>

                                <div className="space-y-3 mb-6">
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
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                                                    Ưu Đãi Đặc Biệt
                                                </p>
                                                <h3 className="text-lg md:text-xl font-bold">Mua Trọn Bộ Lộ Trình</h3>
                                            </div>
                                            <div className="bg-white/10 p-2 rounded-lg">
                                                <ShoppingCart size={20} className="text-white" />
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
                                            <ShoppingCart size={16} /> Thêm Tất Cả Vào Giỏ
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-600 rounded-full blur-2xl opacity-50" />
                                </div>
                                )}
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="lg:col-span-2">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Sparkles className="text-amber-500" size={24} fill="currentColor" />
                                {hasMatches ? 'Đề Xuất Hàng Đầu' : 'Chưa Có Sản Phẩm Khớp'}
                            </h3>
                            {results.length > 0 ? (
                                <div className="space-y-6">
                                    {results.map((product, idx) => (
                                        <AIProductCard key={product.id} product={product} index={idx} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 text-center shadow-sm">
                                    <Target size={44} className="mx-auto text-slate-300 mb-4" />
                                    <h4 className="text-xl font-black text-slate-900 mb-2">Chưa tìm thấy sản phẩm đúng tiêu chí</h4>
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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 md:py-12 px-4">
            <div className="max-w-2xl w-full mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
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
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Brain size={180} />
                    </div>

                    <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-8 leading-tight min-h-[3em] relative z-10">
                        <TypewriterText text={currentQuestion.question} />
                    </h2>

                    <div className="space-y-4 mt-auto relative z-10">
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
                <div className="text-center mt-8">
                    <button
                        onClick={() => (step > 1 ? setStep(step - 1) : router.push('/'))}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
                    >
                        {step > 1 ? '← Quay lại câu trước' : 'Hủy bỏ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
