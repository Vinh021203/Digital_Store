'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Download, Star, TrendingUp, Zap, Shield, Award,
  Users, Package, Sparkles, ChevronRight, Play, Check, Palette,
  Layout, Code, Smartphone, Globe, Heart, Eye
} from 'lucide-react';
import { fetchActiveProducts } from '@/lib/products';
import { fetchCategories } from '@/lib/categories';
import { ProductCard } from '@/components/product';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
// ============================================
// STATS DATA
// ============================================
const STATS = [
  { value: '1,000+', label: 'Sản Phẩm Số', icon: Package },
  { value: '50K+', label: 'Downloads', icon: Download },
  { value: '4.9', label: 'Rating', icon: Star },
  { value: '24/7', label: 'Hỗ Trợ', icon: Shield },
];

// ============================================
// FEATURES DATA
// ============================================
const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Download',
    description: 'Tải xuống ngay sau khi thanh toán',
    color: 'orange',
  },
  {
    icon: Shield,
    title: 'Lifetime Updates',
    description: 'Cập nhật miễn phí trọn đời',
    color: 'red',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Kiểm duyệt chất lượng cao',
    color: 'amber',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Cộng đồng hỗ trợ 24/7',
    color: 'rose',
  },
];

// ============================================
// HERO SECTION
// ============================================
const HeroSection = memo(() => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Premium Digital Products</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Themes & Templates
              <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                Cho Mọi Dự Án
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Khám phá 1,000+ themes, landing pages, templates chất lượng cao.
              React, Next.js, WordPress, Figma và nhiều hơn nữa.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                Khám Phá Ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                <Play className="w-5 h-5" />
                Xem Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`User ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-400">50,000+ Developers tin dùng</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Product Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl">
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <div className="relative w-full h-72">
                    <Image
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                      alt="Premium Theme Preview"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">THEME</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">NEW</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Dashboard Pro React</h2>
                    <p className="text-slate-400 text-sm mb-4">Modern admin dashboard with 50+ pages</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-orange-400">599K₫</span>
                        <span className="text-sm text-slate-500 line-through">1.2M₫</span>
                      </div>
                      <button className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">12,543</p>
                    <p className="text-xs text-slate-500">Downloads</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-xl p-4 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">4.9/5.0</p>
                    <p className="text-xs text-slate-500">Average Rating</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

// ============================================
// ANIMATED COUNTER HOOK
// ============================================
const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
};

// ============================================
// STATS SECTION
// ============================================
const StatsSection = memo(() => {
  const stat1 = useCountUp(1000, 2000);
  const stat2 = useCountUp(50, 2000);
  const stat3 = useCountUp(49, 1500); // 4.9 * 10

  const statsData = [
    { ...STATS[0], displayValue: `${stat1.count.toLocaleString()}+`, ref: stat1.ref },
    { ...STATS[1], displayValue: `${stat2.count}K+`, ref: stat2.ref },
    { ...STATS[2], displayValue: (stat3.count / 10).toFixed(1), ref: stat3.ref },
    { ...STATS[3], displayValue: STATS[3].value, ref: null },
  ];

  return (
    <section className="relative -mt-16 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
              ref={stat.ref}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3">
                <stat.icon className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.displayValue}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';

// ============================================
// CATEGORIES SECTION
// ============================================
const CategoriesSection = memo(() => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data.slice(0, 6));
    };
    loadCategories();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    'themes': <Palette className="w-8 h-8" />,
    'landing': <Layout className="w-8 h-8" />,
    'templates': <Code className="w-8 h-8" />,
    'miniapps': <Smartphone className="w-8 h-8" />,
    'wordpress': <Globe className="w-8 h-8" />,
    'ecommerce': <Package className="w-8 h-8" />,
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm mb-4"
          >
            <Package className="w-4 h-4" />
            Danh Mục Sản Phẩm
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Khám Phá Theo Danh Mục
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tìm kiếm sản phẩm phù hợp với nhu cầu của bạn từ các danh mục đa dạng
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category: any, index: number) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/products?category=${category.slug || category.id}`}
                className="group block p-6 bg-white rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform mb-4">
                  {categoryIcons[category.slug] || <Package className="w-8 h-8" />}
                </div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500">{category.product_count || 0} sản phẩm</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

CategoriesSection.displayName = 'CategoriesSection';

// ============================================
// FEATURED PRODUCTS SECTION
// ============================================
const FeaturedProductsSection = memo(() => {
  const [activeTab, setActiveTab] = useState<'all' | 'themes' | 'landing' | 'templates'>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchActiveProducts({ limit: 20 });
      setAllProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = allProducts.filter((p: Product) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'themes') return p.format === 'Theme';
    if (activeTab === 'landing') return p.format === 'Landing';
    if (activeTab === 'templates') return p.format === 'Template';
    return true;
  }).slice(0, 8);

  const tabs = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'themes', label: 'Themes' },
    { id: 'landing', label: 'Landing Pages' },
    { id: 'templates', label: 'Templates' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6 md:mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-xs md:text-sm mb-3 md:mb-4"
            >
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              Bán Chạy
            </motion.div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900">
              Sản Phẩm Nổi Bật
            </h2>
          </div>

          {/* Tabs - Horizontal scroll on mobile */}
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} viewMode="grid" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all hover:scale-105"
          >
            Xem Tất Cả Sản Phẩm
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
});

FeaturedProductsSection.displayName = 'FeaturedProductsSection';

// ============================================
// FEATURES SECTION - Professional Dark Theme
// ============================================
const FeaturesSection = memo(() => {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-orange-400 rounded-full font-bold text-xs md:text-sm mb-4 md:mb-6"
          >
            <Award className="w-3 h-3 md:w-4 md:h-4" />
            Tại Sao Chọn DigitalMart?
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-6"
          >
            Trải Nghiệm <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Đẳng Cấp</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg px-4"
          >
            Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng cao nhất
          </motion.p>
        </div>

        {/* Features Grid - Horizontal scroll on mobile */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex-shrink-0 w-[280px] md:w-auto snap-start"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl md:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-5 md:p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl md:rounded-3xl hover:border-orange-500/30 transition-all duration-500 h-full">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/25">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';

// ============================================
// TESTIMONIALS SECTION
// ============================================
const TESTIMONIALS = [
  {
    name: 'Minh Tuấn',
    role: 'Senior Developer @ FPT Software',
    avatar: 'M',
    content: 'Đã mua hơn 10 themes từ DigitalMart. Code sạch, documentation đầy đủ, support team phản hồi rất nhanh. Tiết kiệm cho team tôi hàng trăm giờ development.',
    rating: 5,
  },
  {
    name: 'Thu Hương',
    role: 'CEO @ Startup Việt',
    avatar: 'T',
    content: 'Landing page template giúp startup tôi launch sản phẩm chỉ trong 1 tuần. Conversion rate tăng 45% so với design cũ. Đầu tư xứng đáng!',
    rating: 5,
  },
  {
    name: 'Đức Anh',
    role: 'Freelance Designer',
    avatar: 'Đ',
    content: 'Là freelancer, tôi cần template chất lượng để giao dự án nhanh cho khách. DigitalMart chính là partner đáng tin cậy, updates miễn phí lifetime là điểm cộng lớn.',
    rating: 5,
  },
];

const TestimonialsSection = memo(() => {
  // Duplicate testimonials for seamless infinite scroll
  const allTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-12 md:py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-20 md:h-32 bg-gradient-to-b from-slate-900 to-transparent" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-xs md:text-sm mb-4 md:mb-6"
          >
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-orange-500" />
            Đánh Giá Từ Khách Hàng
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-3 md:mb-6"
          >
            Khách Hàng Nói Gì?
          </motion.h2>
        </div>

        {/* Infinite Slider Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          {/* Sliding Track */}
          <div className="flex animate-slide-testimonials">
            {allTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 w-[320px] md:w-[400px] mx-3 md:mx-4"
              >
                <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-lg md:shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 h-full">
                  {/* Stars */}
                  <div className="flex gap-0.5 md:gap-1 mb-4 md:mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-5 md:mb-8 min-h-[80px] md:min-h-[100px]">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-base md:text-xl font-bold shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-xs md:text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slide-testimonials {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-slide-testimonials {
          animation: slide-testimonials 25s linear infinite;
        }
        .animate-slide-testimonials:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
});


TestimonialsSection.displayName = 'TestimonialsSection';

// ============================================
// CTA SECTION - Refined Design
// ============================================
const CTASection = memo(() => {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full font-bold text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Bắt Đầu Ngay Hôm Nay
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Biến Ý Tưởng Thành
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-amber-400">
              Sản Phẩm Thực Tế
            </span>
          </h2>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Tiết kiệm hàng trăm giờ làm việc với themes & templates chất lượng cao từ DigitalMart
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105"
            >
              Khám Phá Sản Phẩm
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all"
            >
              Liên Hệ Tư Vấn
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: Check, text: 'Hoàn Tiền 30 Ngày' },
              { icon: Shield, text: 'Bảo Mật Thanh Toán' },
              { icon: Users, text: 'Hỗ Trợ 24/7' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-slate-400"
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';

// ============================================
// PARTNERS/BRANDS SECTION - Infinite Slider
// ============================================
const PartnersSection = memo(() => {
  // SVG icons for each brand
  const brands = [
    {
      name: 'React',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#61DAFB">
          <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.93zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.482-3.092 2.294-4.11 2.294-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
        </svg>
      )
    },
    {
      name: 'Next.js',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
          <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5765-.0517.5765 0 .6581.0187.7561.1579.0245.0446 1.3407 2.0037 2.9277 4.3544l4.9373 7.3215 2.4517 3.6361.0516-.034c1.1062-.7221 2.2764-1.7555 3.1633-2.7945 1.8524-2.1718 2.9778-4.7758 3.3087-7.6556.1073-.9219.1194-1.8309.0359-2.7621-.3087-3.4784-1.8834-6.6379-4.4423-8.9196-1.7389-1.5498-3.8504-2.5803-6.1378-2.9945-.7234-.1308-1.3913-.1856-2.2455-.1852l-.1571.0008z" />
        </svg>
      )
    },
    {
      name: 'WordPress',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#21759B">
          <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.109m-7.981.105c.647-.034 1.23-.1 1.23-.1.583-.07.514-.93-.067-.897 0 0-1.753.138-2.885.138-1.063 0-2.855-.138-2.855-.138-.585-.033-.659.858-.075.897 0 0 .549.066 1.127.1l1.674 4.587L9.11 18.72l-4.625-13.79c.647-.034 1.23-.1 1.23-.1.583-.07.514-.93-.07-.897 0 0-1.752.138-2.88.138-.203 0-.443-.005-.693-.014C4.87 1.663 8.227 0 12 0c2.813 0 5.378 1.078 7.297 2.84-.047-.004-.091-.01-.141-.01-1.063 0-1.818.928-1.818 1.923 0 .894.515 1.651 1.064 2.547.413.718.894 1.64.894 2.973 0 .922-.354 1.996-.822 3.492L17.06 16.8l-3.573-10.67zM12 22.784c-1.06 0-2.08-.16-3.044-.451l3.235-9.393 3.313 9.08c.024.053.05.1.078.146-1.12.396-2.327.618-3.582.618M1.213 12c0-1.724.377-3.36 1.05-4.83l5.782 15.845C3.816 20.862 1.213 16.772 1.213 12M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0" />
        </svg>
      )
    },
    {
      name: 'Figma',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#F24E1E">
          <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.098-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
        </svg>
      )
    },
    {
      name: 'Tailwind',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#06B6D4">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
        </svg>
      )
    },
    {
      name: 'TypeScript',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#3178C6">
          <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.061.456-.144.623-.25a1.14 1.14 0 0 0 .395-.392.984.984 0 0 0 .137-.524.756.756 0 0 0-.18-.49 1.714 1.714 0 0 0-.51-.396 5.27 5.27 0 0 0-.804-.357 26.137 26.137 0 0 0-1.064-.42c-.448-.181-.85-.39-1.207-.628a3.754 3.754 0 0 1-.906-.79 3.119 3.119 0 0 1-.566-1.003c-.13-.39-.196-.831-.196-1.325 0-.62.123-1.157.37-1.612a3.18 3.18 0 0 1 1.004-1.098 4.282 4.282 0 0 1 1.476-.631 7.1 7.1 0 0 1 1.767-.201zm-9.79.046h6.993v1.906H9.65v8.063H7.078V11.703h-3.44V9.796h5.06z" />
        </svg>
      )
    },
    {
      name: 'Vue.js',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#4FC08D">
          <path d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78L24 1.61zM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43L12 14.08z" />
        </svg>
      )
    },
    {
      name: 'Angular',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#DD0031">
          <path d="M9.931 12.645h4.138l-2.07-4.908zM12 0L1.614 3.628l1.585 13.755L12 24l8.801-6.617 1.585-13.755L12 0zm6.416 18.132h-2.484l-1.332-3.326H9.4L8.07 18.132H5.584L12 3.62l6.416 14.512z" />
        </svg>
      )
    },
  ];

  // Duplicate brands for seamless infinite scroll
  const allBrands = [...brands, ...brands];

  return (
    <section className="py-10 overflow-hidden relative">
      {/* Background with grid pattern */}
      <div className="absolute inset-0 bg-slate-800" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Accent gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-transparent to-orange-600/5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="relative z-10">
        <p className="text-center text-sm font-bold text-orange-400/80 mb-6 uppercase tracking-widest">
          ⚡ Công nghệ tương thích
        </p>

        {/* Infinite Slider Container */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-800 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-800 to-transparent z-10" />

          {/* Sliding Track */}
          <div className="flex animate-slide-infinite">
            {allBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex-shrink-0 mx-4 md:mx-6 group cursor-default"
              >
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/90 rounded-xl border border-slate-700/80 hover:border-orange-500/60 hover:bg-slate-900 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/20">
                  {brand.icon}
                  <span className="text-sm md:text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                    {brand.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes slide-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-slide-infinite {
          animation: slide-infinite 20s linear infinite;
        }
        .animate-slide-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
});

PartnersSection.displayName = 'PartnersSection';

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================
const HomePage = () => {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PartnersSection />
      <CTASection />
    </main>
  );
};

export default memo(HomePage);

