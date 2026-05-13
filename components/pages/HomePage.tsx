'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BadgePercent,
  Boxes,
  Brush,
  Code,
  Command,
  CreditCard,
  Database,
  Download,
  Eye,
  FileStack,
  Gauge,
  Gem,
  ImageIcon,
  Layout,
  Monitor,
  MousePointer2,
  Package,
  Palette,
  Rocket,
  Search,
  Shield,
  Shapes,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { fetchCategories } from '@/lib/categories';
import { fetchActiveProducts } from '@/lib/products';
import type { Product } from '@/types';

type CategoryPreview = {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
};

type ProductFormatFilter = 'all' | 'Theme' | 'Landing' | 'Template' | 'MiniApp';

const aiThemeThumbnail = '/ai-theme-marketplace-thumbnail.webp';

const fallbackImages = [
  aiThemeThumbnail,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=1200&h=800&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop&auto=format',
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);

const quickSearches = ['Landing page SaaS', 'Dashboard admin', 'Theme WordPress', 'UI kit Figma', 'Template bán hàng'];

const assetTypes = [
  { label: 'Mẫu website', href: '/products?format=Template', icon: Monitor, count: '8K+', color: 'from-cyan-500 to-blue-600' },
  { label: 'Landing page', href: '/products?format=Landing', icon: Layout, count: '3K+', color: 'from-orange-500 to-red-600' },
  { label: 'Bộ UI kit', href: '/products?category=figma-templates', icon: Brush, count: '1K+', color: 'from-fuchsia-500 to-pink-600' },
  { label: 'Mã nguồn', href: '/products?category=source-code', icon: Code, count: '2K+', color: 'from-emerald-500 to-teal-600' },
  { label: 'Gói dữ liệu', href: '/products?category=templates', icon: Database, count: '900+', color: 'from-violet-500 to-indigo-600' },
  { label: 'File ra mắt', href: '/products?category=assets', icon: FileStack, count: '700+', color: 'from-amber-500 to-orange-600' },
];

const categoryVisuals = [
  'bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.22),transparent_24%),linear-gradient(135deg,rgba(14,165,233,0.18),rgba(37,99,235,0.08))]',
  'bg-[radial-gradient(circle_at_80%_18%,rgba(249,115,22,0.24),transparent_25%),linear-gradient(135deg,rgba(249,115,22,0.14),rgba(220,38,38,0.08))]',
  'bg-[radial-gradient(circle_at_78%_20%,rgba(217,70,239,0.24),transparent_25%),linear-gradient(135deg,rgba(217,70,239,0.14),rgba(219,39,119,0.08))]',
  'bg-[radial-gradient(circle_at_80%_18%,rgba(16,185,129,0.24),transparent_25%),linear-gradient(135deg,rgba(16,185,129,0.14),rgba(20,184,166,0.08))]',
  'bg-[radial-gradient(circle_at_78%_18%,rgba(139,92,246,0.24),transparent_25%),linear-gradient(135deg,rgba(139,92,246,0.14),rgba(79,70,229,0.08))]',
  'bg-[radial-gradient(circle_at_80%_18%,rgba(245,158,11,0.24),transparent_25%),linear-gradient(135deg,rgba(245,158,11,0.14),rgba(234,88,12,0.08))]',
];

const featureCards = [
  {
    icon: Rocket,
    title: 'Launch nhanh',
    text: 'Chọn mẫu, xem demo, tải file và bắt đầu chỉnh brand trong cùng một buổi làm việc.',
    color: 'from-orange-500 to-rose-600',
  },
  {
    icon: BadgeCheck,
    title: 'Duyệt chất lượng',
    text: 'Ưu tiên sản phẩm có preview rõ, cấu trúc gọn, thông tin license và hướng dẫn triển khai.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: CreditCard,
    title: 'Mua mượt',
    text: 'Luồng CTA được đặt theo hành vi xem sản phẩm để giảm bước thừa trước thanh toán.',
    color: 'from-sky-500 to-indigo-600',
  },
  {
    icon: Wand2,
    title: 'Cảm giác curated',
    text: 'Trang chủ dẫn người dùng qua bộ sưu tập, xu hướng và asset type thay vì chỉ ném card sản phẩm.',
    color: 'from-fuchsia-500 to-purple-700',
  },
];

const categoryIconMap: Record<string, React.ElementType> = {
  themes: Palette,
  'themes-ui-kits': Brush,
  landing: MousePointer2,
  'landing-pages': MousePointer2,
  templates: FileStack,
  'website-templates': Monitor,
  wordpress: Boxes,
  ecommerce: ShoppingBag,
  'admin-dashboards': Gauge,
  'figma-templates': Gem,
  'icons-illustrations': Shapes,
  'mockups-presentations': ImageIcon,
  'mobile-apps': Smartphone,
  miniapps: Smartphone,
};

const getProductImage = (product?: Product, index = 0) =>
  product?.image || product?.gallery?.[0] || fallbackImages[index % fallbackImages.length];

const MobileHeroPreview = memo(() => (
  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl md:hidden">
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900">
      <Image
        src={aiThemeThumbnail}
        alt="Thumbnail theme và template website"
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-xs font-black uppercase tracking-wide text-lime-200">Template marketplace</p>
        <p className="mt-1 line-clamp-2 text-lg font-black text-white">Theme, landing page và UI kit sẵn sàng bán hàng</p>
      </div>
    </div>
  </div>
));

MobileHeroPreview.displayName = 'MobileHeroPreview';

const ProductUniverse = memo(({ products }: { products: Product[] }) => {
  const displayProducts = products.length > 0 ? products.slice(0, 6) : [];
  const fallbackTiles = Array.from({ length: 6 }, (_, index) => ({
    id: `fallback-${index}`,
    name: ['Commerce Kit', 'SaaS Dashboard', 'Creator Landing', 'UI System', 'Storefront', 'Analytics Pack'][index],
    image: fallbackImages[index % fallbackImages.length],
    format: ['Template', 'Dashboard', 'Landing', 'UI Kit', 'Theme', 'Pack'][index],
  }));

  const tiles = displayProducts.length
    ? displayProducts.map((product, index) => ({
        id: product.id,
        name: product.name,
        image: getProductImage(product, index),
        format: product.format,
      }))
    : fallbackTiles;

  return (
    <div className="relative min-h-[330px] sm:min-h-[420px] lg:min-h-[620px]">
      <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl" />
      <div className="absolute inset-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]" />

      <div
        className="absolute left-5 top-6 h-[132px] w-[43%] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/30 sm:left-5 sm:top-8 sm:h-56 sm:w-[46%] sm:rounded-3xl"
      >
        <Image src={tiles[0].image} alt={tiles[0].name} fill sizes="280px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-orange-200 sm:text-xs">{tiles[0].format}</p>
          <p className="line-clamp-1 text-sm font-black text-white sm:text-lg">{tiles[0].name}</p>
        </div>
      </div>

      <div
        className="absolute right-5 top-10 h-[148px] w-[43%] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/40 sm:right-4 sm:top-16 sm:h-72 sm:w-[48%] sm:rounded-[2rem]"
      >
        <Image src={tiles[1].image} alt={tiles[1].name} fill sizes="320px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-cyan-200 sm:text-xs">{tiles[1].format}</p>
          <p className="line-clamp-2 text-sm font-black leading-tight text-white sm:text-xl">{tiles[1].name}</p>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-5 h-[118px] w-[43%] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/30 sm:bottom-16 sm:left-8 sm:h-44 sm:w-[42%] sm:rounded-[1.75rem]"
      >
        <Image src={tiles[2].image} alt={tiles[2].name} fill sizes="260px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <p className="line-clamp-1 text-sm font-black text-white sm:text-base">{tiles[2].name}</p>
        </div>
      </div>

      <div
        className="absolute bottom-8 right-5 h-[118px] w-[43%] overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/30 sm:bottom-8 sm:right-8 sm:h-44 sm:w-[45%] sm:rounded-3xl"
      >
        <Image src={tiles[3].image} alt={tiles[3].name} fill sizes="280px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <p className="line-clamp-1 text-sm font-black text-white sm:text-base">{tiles[3].name}</p>
        </div>
      </div>

      <div className="absolute left-[42%] top-[44%] hidden -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
            <Command className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-white/60">Nhịp marketplace</p>
            <p className="font-black">Tài nguyên chọn lọc</p>
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-[48%] hidden rounded-2xl border border-white/15 bg-lime-300 px-4 py-3 text-slate-950 shadow-2xl sm:block">
        <p className="text-xs font-black uppercase">Conversion ready</p>
        <p className="text-2xl font-black">+38%</p>
      </div>
    </div>
  );
});

ProductUniverse.displayName = 'ProductUniverse';

const HeroSection = memo(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<ProductFormatFilter>('all');

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const syncDesktop = () => setIsDesktop(media.matches);

    syncDesktop();
    media.addEventListener('change', syncDesktop);

    return () => media.removeEventListener('change', syncDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const loadProducts = async () => {
      try {
        const data = await fetchActiveProducts({ limit: 8 });
        setProducts(data);
      } catch (error) {
        console.error('Failed to load hero products:', error);
      }
    };

    loadProducts();
  }, [isDesktop]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const query = searchTerm.trim();

    if (query) params.set('search', query);
    if (searchCategory !== 'all') params.set('format', searchCategory);

    window.location.href = `/products${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <section className="relative overflow-hidden bg-[#070711] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_72%_12%,rgba(244,63,94,0.2),transparent_30%),radial-gradient(circle_at_46%_88%,rgba(132,204,22,0.16),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

      <div className="relative mx-auto grid min-h-[auto] max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:min-h-[calc(100vh-72px)] lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div>
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100 backdrop-blur sm:text-sm">
            <Sparkles className="h-4 w-4 text-lime-300" />
            <span className="truncate">Marketplace sản phẩm số cho dự án cần nổi bật</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Tìm asset đẹp.
            <span className="block bg-gradient-to-r from-cyan-200 via-lime-200 to-orange-200 bg-clip-text text-transparent">
              Build thương hiệu nổi bật.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Trang chủ được dựng như một marketplace hiện đại: search nhanh, collection nổi bật, preview sản phẩm thật và các CTA dẫn khách tới mua hàng tự nhiên hơn.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-7 rounded-[1.35rem] border border-white/15 bg-white p-2 shadow-2xl shadow-black/30 sm:flex sm:items-center sm:gap-2"
          >
            <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl px-3 text-slate-950">
              <Search className="h-5 w-5 flex-shrink-0 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm landing page, dashboard, UI kit..."
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400 sm:text-base"
              />
            </label>
            <select
              value={searchCategory}
              onChange={(event) => setSearchCategory(event.target.value as ProductFormatFilter)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 outline-none sm:mt-0 sm:w-40"
              aria-label="Chọn loại asset"
            >
              <option value="all">Tất cả</option>
              <option value="Theme">Theme</option>
              <option value="Landing">Landing</option>
              <option value="Template">Template</option>
              <option value="MiniApp">MiniApp</option>
            </select>
            <button
              type="submit"
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-orange-600 sm:mt-0 sm:w-auto"
            >
              Khám phá
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchTerm(term)}
                className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
            {[
              ['1,000+', 'tài nguyên'],
              ['50K+', 'lượt tải'],
              ['4.9/5', 'chất lượng'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur">
                <p className="text-xl font-black text-white sm:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <MobileHeroPreview />
        <div className="hidden md:block">
          <ProductUniverse products={products} />
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

const AssetTypeRail = memo(() => (
  <section className="bg-[#070711] px-4 pb-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-2 backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {assetTypes.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex min-w-0 items-center gap-2 rounded-[1.2rem] p-2.5 text-white transition hover:bg-white/10 sm:gap-3 sm:p-3"
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg sm:h-12 sm:w-12 sm:rounded-2xl`}>
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{item.label}</p>
              <p className="text-[11px] font-bold text-slate-400 sm:text-xs">{item.count} chọn lọc</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
));

AssetTypeRail.displayName = 'AssetTypeRail';

const CategorySection = memo(() => {
  const [categories, setCategories] = useState<CategoryPreview[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.slice(0, 8));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  return (
    <section className="bg-slate-50 py-10 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 grid gap-4 sm:mb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-lime-200 sm:text-sm">Khám phá danh mục</p>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-5xl">Duyệt tài nguyên theo mục tiêu dự án.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:ml-auto">
            Người dùng marketplace không muốn đọc quá nhiều. Họ muốn nhìn đúng nhóm tài nguyên, thấy số lượng, bấm vào và bắt đầu lọc sản phẩm.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = categoryIconMap[category.slug] || Package;
            const color = assetTypes[index % assetTypes.length].color;

            return (
              <div key={category.id}>
                <Link
                  href={`/products?category=${category.slug || category.id}`}
                  className="group relative flex min-h-[118px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200 sm:min-h-[150px] sm:rounded-[1.4rem] sm:p-4"
                >
                  <div className={`absolute inset-0 ${categoryVisuals[index % categoryVisuals.length]}`} />
                  <div className="absolute bottom-3 right-3 grid grid-cols-2 gap-1 opacity-60 transition group-hover:opacity-90">
                    <span className="h-8 w-10 rounded-lg bg-white/55 shadow-sm" />
                    <span className="h-8 w-10 rounded-lg bg-white/35 shadow-sm" />
                    <span className="h-8 w-10 rounded-lg bg-white/35 shadow-sm" />
                    <span className="h-8 w-10 rounded-lg bg-white/55 shadow-sm" />
                  </div>
                  <div className="relative flex h-full w-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg sm:h-12 sm:w-12`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="mt-2 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-600 sm:h-5 sm:w-5" />
                    </div>
                    <div className="mt-5 max-w-[75%] sm:max-w-[70%]">
                      <h3 className="line-clamp-2 text-sm font-black leading-tight text-slate-950 sm:text-lg">{category.name}</h3>
                      <p className="mt-2 text-xs font-bold text-slate-500 sm:text-sm">{category.product_count || 0} sản phẩm</p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

CategorySection.displayName = 'CategorySection';

const EditorialProductCard = memo(({ product, index }: { product: Product; index: number }) => {
  const palette = [
    'from-orange-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-lime-500 to-emerald-600',
    'from-fuchsia-500 to-purple-700',
  ][index % 4];

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200 sm:rounded-[1.6rem]"
    >
      <Link href={`/product/${product.slug || product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image src={getProductImage(product, index)} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-90" />
          <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-950 backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
            {product.format}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className={`absolute right-2.5 top-2.5 rounded-full bg-gradient-to-r ${palette} px-2.5 py-1 text-[10px] font-black text-white sm:right-4 sm:top-4 sm:px-3 sm:text-xs`}>
              Deal
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4 sm:gap-3">
            <div>
              <p className="hidden text-xs font-bold uppercase tracking-wide text-white/60 sm:block">Xem trước</p>
              <h3 className="line-clamp-2 text-sm font-black leading-tight text-white sm:text-lg">{product.name}</h3>
            </div>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-950 transition group-hover:bg-lime-300 sm:h-10 sm:w-10">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
            <p className="line-clamp-1 text-xs font-bold text-slate-500 sm:text-sm">by {product.author || 'DigitalMart'}</p>
            <p className="text-xs font-black text-amber-600 sm:text-sm">{product.rating || '4.9'}/5</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Giá</p>
              <p className="text-sm font-black text-slate-950 sm:text-lg">{formatPrice(product.price)}</p>
            </div>
            <span className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-black text-white transition group-hover:bg-orange-600 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs">Xem</span>
          </div>
        </div>
      </Link>
    </article>
  );
});

EditorialProductCard.displayName = 'EditorialProductCard';

const FeaturedProductsSection = memo(() => {
  const [activeTab, setActiveTab] = useState<ProductFormatFilter>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveProducts({ limit: 20 });
        setProducts(data);
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => activeTab === 'all' || product.format === activeTab).slice(0, 8),
    [activeTab, products]
  );

  const tabs: Array<{ id: ProductFormatFilter; label: string }> = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Theme', label: 'Themes' },
    { id: 'Landing', label: 'Landing' },
    { id: 'Template', label: 'Templates' },
    { id: 'MiniApp', label: 'MiniApp' },
  ];

  return (
    <section className="bg-white py-10 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-lime-200 px-4 py-2 text-sm font-black text-slate-950">Gian hàng chọn lọc</p>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-5xl">Sản phẩm không chỉ để xem. Chúng phải muốn được bấm.</h2>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                  activeTab === tab.id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100 sm:h-80 sm:rounded-[1.6rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <EditorialProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-600 px-7 font-black text-white shadow-xl shadow-orange-500/20 transition hover:bg-slate-950">
            Mở toàn bộ marketplace
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
});

FeaturedProductsSection.displayName = 'FeaturedProductsSection';

const ShowcaseSection = memo(() => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchActiveProducts({ limit: 4 });
        setProducts(data);
      } catch (error) {
        console.error('Failed to load showcase products:', error);
      }
    };

    loadProducts();
  }, []);

  const mainProduct = products[0];
  const supportingProducts = products.slice(1, 4);

  return (
    <section className="bg-[#f5f7fb] py-10 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-300 sm:rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[420px] lg:min-h-[620px]">
            <Image src={aiThemeThumbnail} alt="AI thumbnail website theme marketplace" fill sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" priority={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/15 bg-slate-950/78 p-4 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:rounded-[1.5rem] sm:p-6">
              <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-wide">
                  <BadgePercent className="h-3.5 w-3.5" />
                  Ảnh theme AI
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/75">Xem trước rồi mua</span>
              </div>
              <h2 className="line-clamp-2 text-xl font-black sm:text-4xl">Theme bán site & template marketplace cao cấp</h2>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300 sm:mt-3 sm:text-base sm:leading-7">
                Thumbnail AI riêng cho website: không còn ảnh điện thoại lạc chủ đề, tập trung vào theme, landing page, dashboard và CTA bán hàng.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-8 lg:p-10">
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-cyan-200">Vì sao nhìn cao cấp</p>
            <h2 className="text-2xl font-black leading-tight sm:text-5xl">Nổi bật bằng nhịp điệu, không chỉ bằng màu sắc.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
              Trang chủ mới dùng nhiều lớp: hero chuyển động, cards editorial, collection lớn, category rail và CTA gọn. Người dùng sẽ có cảm giác đang bước vào một cửa hàng sản phẩm số được tuyển chọn.
            </p>

            <div className="mt-5 grid gap-2 sm:mt-8 sm:gap-3">
              {supportingProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug || product.id}`}
                  className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 transition hover:bg-white/[0.1] sm:gap-4 sm:rounded-[1.25rem] sm:p-3"
                >
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 sm:h-20 sm:w-24 sm:rounded-2xl">
                    <Image src={getProductImage(product, index + 1)} alt={product.name} fill sizes="96px" className="object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-black text-white group-hover:text-lime-200 sm:text-base">{product.name}</p>
                    <p className="mt-1 text-xs font-bold text-orange-300 sm:mt-2 sm:text-sm">{formatPrice(product.price)}</p>
                  </div>
                  <ArrowRight className="mt-2 h-5 w-5 flex-shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
            </div>

            <Link href="/products?sort=popular" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-black text-slate-950 transition hover:bg-lime-200">
              Xem sản phẩm đang nổi
              <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

ShowcaseSection.displayName = 'ShowcaseSection';

const ExperienceSection = memo(() => (
    <section className="bg-white py-10 sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-orange-200">Hệ thống gian hàng thông minh</p>
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-5xl">Một trang chủ phải dẫn khách đi, không chỉ trưng đồ.</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((feature, index) => (
          <div
            key={feature.title}
            className="group relative min-h-[210px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-slate-950 hover:text-white hover:shadow-2xl hover:shadow-slate-200 sm:min-h-[260px] sm:rounded-[1.6rem] sm:p-5"
          >
            <div className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${feature.color} opacity-20 blur-2xl transition group-hover:opacity-35`} />
            <div className={`relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg sm:mb-8 sm:h-14 sm:w-14 sm:rounded-2xl`}>
              <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="relative text-base font-black sm:text-xl">{feature.title}</h3>
            <p className="relative mt-2 text-xs leading-5 text-slate-600 transition group-hover:text-slate-300 sm:mt-3 sm:text-sm sm:leading-7">{feature.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

ExperienceSection.displayName = 'ExperienceSection';

const SocialProofSection = memo(() => (
  <section className="bg-slate-950 py-10 text-white sm:py-24">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <p className="mb-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-black text-lime-200 sm:text-sm">Tạo niềm tin</p>
        <h2 className="text-2xl font-black leading-tight sm:text-5xl">Có nhịp, có lực, có lý do để bấm tiếp.</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { icon: Shield, title: 'License rõ', text: 'Thông tin sử dụng và tải file minh bạch.' },
          { icon: Download, title: 'Tải nhanh', text: 'Tập trung vào trải nghiệm sau khi mua.' },
          { icon: Award, title: 'Đáng tin', text: 'Sản phẩm có preview, rating và tác giả.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:rounded-[1.5rem] sm:p-5">
            <item.icon className="mb-3 h-5 w-5 text-orange-300 sm:mb-6 sm:h-7 sm:w-7" />
            <h3 className="text-sm font-black sm:text-lg">{item.title}</h3>
            <p className="mt-1 line-clamp-3 text-[11px] leading-5 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

SocialProofSection.displayName = 'SocialProofSection';

const FinalCTASection = memo(() => (
  <section className="bg-white pb-24 pt-16 sm:py-24">
    <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
      <p className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">Sẵn sàng nâng cấp trang chủ</p>
      <h2 className="mx-auto max-w-4xl text-3xl font-black leading-tight text-slate-950 sm:text-6xl">
        Biến trang chủ thành nơi khách muốn khám phá, không chỉ ghé qua.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
        Nếu sản phẩm là trái tim của website, trang chủ là ánh đèn sân khấu. Bản này đặt search, collection, sản phẩm thật và CTA vào đúng nhịp.
      </p>
      <div className="mt-8 grid justify-center gap-3 sm:flex">
        <Link href="/products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-8 font-black text-white transition hover:bg-orange-600">
          Khám phá marketplace
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 px-8 font-bold text-slate-800 transition hover:bg-slate-50">
          Cần tư vấn chọn mẫu
        </Link>
      </div>
    </div>
  </section>
));

FinalCTASection.displayName = 'FinalCTASection';

const MobileStickyCTA = memo(() => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
    <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] items-center gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-950">Tài nguyên nổi bật</p>
        <p className="text-xs text-slate-500">Search, xem demo, mua nhanh</p>
      </div>
      <Link href="/products" className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange-600 px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20">
        Mở shop
      </Link>
    </div>
  </div>
));

MobileStickyCTA.displayName = 'MobileStickyCTA';

const DeferredSection = memo(({ children }: { children: React.ReactNode }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '480px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{shouldRender ? children : <div className="min-h-24" />}</div>;
});

DeferredSection.displayName = 'DeferredSection';

const HomePage = () => {
  return (
    <main className="overflow-hidden bg-white">
      <HeroSection />
      <AssetTypeRail />
      <CategorySection />
      <DeferredSection>
        <FeaturedProductsSection />
      </DeferredSection>
      <DeferredSection>
        <ShowcaseSection />
      </DeferredSection>
      <DeferredSection>
        <ExperienceSection />
      </DeferredSection>
      <DeferredSection>
        <SocialProofSection />
      </DeferredSection>
      <DeferredSection>
        <FinalCTASection />
      </DeferredSection>
      <MobileStickyCTA />
    </main>
  );
};

export default memo(HomePage);
