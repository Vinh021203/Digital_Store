"use client";

import React, { memo, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Heart,
  ShoppingCart,
  Star,
  Search,
  Shield,
  Mail,
  Download,
  Clock,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Compass,
  Code,
  Brush,
  Database,
  Monitor,
  Layout,
  MousePointer2,
  FileStack,
  Smartphone,
  Shapes,
  ShoppingBag,
  Gauge,
  Gem,
  ImageIcon,
  Palette,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useSiteMode } from "@/hooks/useSiteSettings";
import type { DbCategory } from "@/lib/categories";
import type { DbBlogPost } from "@/lib/blog";
import type { Product } from "@/types";

// ============================================
// Fallback Data for safety
// ============================================
const fallbackImages = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=600&h=450&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=450&fit=crop&auto=format",
];

const heroSliderImages = [
  "/hero_slider/slide_hero_1.webp",
  "/hero_slider/slide_hero_2.webp",
  "/hero_slider/slide_hero_3.webp",
  "/hero_slider/slide_hero_4.webp",
  "/hero_slider/slide_hero_5.webp",
];

const mockProducts: Product[] = [
  {
    id: 101,
    name: "SaaS Analytics Dashboard UI Template",
    price: 350000,
    originalPrice: 490000,
    description:
      "Bản thiết kế Dashboard SaaS hiện đại tích hợp biểu đồ dữ liệu thống kê trực quan.",
    category: "admin-dashboards",
    image: fallbackImages[0],
    rating: 5,
    reviews: 12,
    author: "CodeCrafter",
    format: "Template",
    isNew: true,
    isBestseller: true,
  },
  {
    id: 102,
    name: "E-Commerce Storefront Next.js Website",
    price: 950000,
    originalPrice: 1250000,
    description:
      "Mẫu storefront demo cho ngành thời trang và công nghệ, hiệu năng cao, tối ưu SEO vượt trội.",
    category: "ecommerce",
    image: fallbackImages[1],
    rating: 4.8,
    reviews: 24,
    author: "DevStudio",
    format: "Template",
    isNew: true,
    isBestseller: true,
  },
  {
    id: 103,
    name: "Crypto Portfolio Tracker Mobile App",
    price: 1200000,
    originalPrice: 1800000,
    description:
      "Ứng dụng di động theo dõi ví tiền mã hóa thời gian thực đa tính năng.",
    category: "mobile-apps",
    image: fallbackImages[2],
    rating: 4.9,
    reviews: 8,
    author: "Web3Genius",
    format: "MiniApp",
    isNew: false,
    isBestseller: true,
  },
  {
    id: 104,
    name: "Modern Startup Agency Landing Page",
    price: 250000,
    originalPrice: 350000,
    description:
      "Landing page tối giản cho các công ty khởi nghiệp giới thiệu dịch vụ và nhân sự.",
    category: "landing",
    image: fallbackImages[3],
    rating: 4.7,
    reviews: 15,
    author: "PixelPerfect",
    format: "Landing",
    isNew: true,
    isBestseller: false,
  },
  {
    id: 105,
    name: "Figma Design System UI Starter Kit",
    price: 450000,
    originalPrice: 600000,
    description:
      "Bộ UI Kit đầy đủ các component trên Figma giúp thiết kế giao diện cực nhanh.",
    category: "figma-templates",
    image: fallbackImages[0],
    rating: 5,
    reviews: 30,
    author: "UIUXDesign",
    format: "Template",
    isNew: false,
    isBestseller: true,
  },
  {
    id: 106,
    name: "Creative Portfolio Vue.js Template",
    price: 680000,
    originalPrice: 850000,
    description:
      "Vue.js template chuyên nghiệp dành cho Designer, Photographer và Agency sáng tạo.",
    category: "vue",
    image: fallbackImages[1],
    rating: 4.6,
    reviews: 19,
    author: "VueStudio",
    format: "Template",
    isNew: false,
    isBestseller: false,
  },
  {
    id: 107,
    name: "Task Planner & Kanban App Source Code",
    price: 1500000,
    originalPrice: 2200000,
    description:
      "Mã nguồn ứng dụng quản lý công việc và Kanban Board phát triển bằng React.",
    category: "source-code",
    image: fallbackImages[2],
    rating: 4.9,
    reviews: 14,
    author: "FullstackKing",
    format: "MiniApp",
    isNew: true,
    isBestseller: false,
  },
  {
    id: 108,
    name: "Gym & Fitness Tracker Landing Page",
    price: 190000,
    originalPrice: 290000,
    description:
      "Mẫu Landing Page quảng bá trung tâm thể hình hoặc huấn luyện viên cá nhân.",
    category: "landing-pages",
    image: fallbackImages[3],
    rating: 4.8,
    reviews: 11,
    author: "FitDesign",
    format: "Landing",
    isNew: false,
    isBestseller: true,
  },
];

const mockBlogs = [
  {
    id: 1,
    slug: "xu-huong-thiet-ke-website-dot-pha-cho-nam-2026",
    title: "Xu Hướng Thiết Kế Website Đột Phá Cho Năm 2026",
    excerpt:
      "Khám phá các xu hướng thiết kế web mới nhất bao gồm glassmorphism, micro-interactions và phối màu gradient hiện đại.",
    cover_image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format",
    category: "Công Nghệ",
    tags: ["UI/UX", "Web Design"],
    views_count: 320,
    published_at: "2026-05-15T08:30:00Z",
    created_at: "2026-05-15T08:30:00Z",
    author: {
      name: "Vinh Nguyễn",
      avatar: "/favicon.png",
    },
  },
  {
    id: 2,
    slug: "xay-dung-saas-landing-page-chuyen-doi-cao",
    title:
      "Làm Thế Nào Để Xây Dựng Một SaaS Landing Page Đạt Tỉ Lệ Chuyển Đổi Cao",
    excerpt:
      "Phân tích cấu trúc lý tưởng cho một landing page giới thiệu phần mềm, vị trí đặt CTA và cách viết tiêu đề thu hút khách hàng.",
    cover_image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format",
    category: "Khởi Nghiệp",
    tags: ["SaaS", "Marketing"],
    views_count: 245,
    published_at: "2026-05-20T10:15:00Z",
    created_at: "2026-05-20T10:15:00Z",
    author: {
      name: "Thảo Vy",
      avatar: "/favicon.png",
    },
  },
  {
    id: 3,
    slug: "react-19-va-nextjs-16-tinh-nang-moi",
    title:
      "React 19 Và Next.js 16: Những Tính Năng Mới Bạn Cần Biết Ngay Hôm Nay",
    excerpt:
      "Tổng hợp chi tiết các cập nhật lớn của React 19 bao gồm Server Actions, Server Components và cơ chế tối ưu hóa tài nguyên mới.",
    cover_image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop&auto=format",
    category: "Học Lập Trình",
    tags: ["NextJS", "ReactJS"],
    views_count: 512,
    published_at: "2026-05-28T14:45:00Z",
    created_at: "2026-05-28T14:45:00Z",
    author: {
      name: "Minh Tuấn",
      avatar: "/favicon.png",
    },
  },
  {
    id: 4,
    slug: "toi-uu-seo-cho-website-nextjs-hieu-qua",
    title: "Tối Ưu SEO Cho Website Next.js Hiệu Quả Nhất",
    excerpt:
      "Hướng dẫn tối ưu hóa hiệu năng, cấu hình file sitemap, robots.txt và các thẻ meta tag chuẩn SEO cho dự án Next.js App Router.",
    cover_image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format",
    category: "SEO",
    tags: ["SEO", "NextJS"],
    views_count: 189,
    published_at: "2026-05-30T09:00:00Z",
    created_at: "2026-05-30T09:00:00Z",
    author: {
      name: "Hoàng Long",
      avatar: "/favicon.png",
    },
  },
];

const categoryIconMap: Record<string, React.ElementType> = {
  themes: Palette,
  "themes-ui-kits": Brush,
  landing: MousePointer2,
  "landing-pages": MousePointer2,
  templates: FileStack,
  "website-templates": Monitor,
  figma: Gem,
  ecommerce: ShoppingBag,
  "admin-dashboards": Gauge,
  "figma-templates": Gem,
  "icons-illustrations": Shapes,
  "mockups-presentations": ImageIcon,
  "mobile-apps": Smartphone,
  miniapps: Smartphone,
};

function Packages(props: any) {
  return <Package {...props} />;
}

// ============================================
// DpMarket Custom Product Card Component
// ============================================
const DpMarketProductCard = memo(
  ({
    product,
    index,
    variant = "default",
    stableMedia = false,
  }: {
    product: Product;
    index: number;
    variant?: "default" | "mobileHorizontal";
    stableMedia?: boolean;
  }) => {
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } =
      useCart();
    const { addToast } = useToast();
    const { isCatalogMode } = useSiteMode();
    const [imgLoaded, setImgLoaded] = useState(false);

    const isLiked = isInWishlist(product.id);
	    const hasDiscount =
	      !isCatalogMode && product.originalPrice && product.originalPrice > product.price;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isCatalogMode) {
        addToast("Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.", "info");
        if (typeof window !== "undefined") {
          window.location.href = `/contact?product=${encodeURIComponent(String(product.slug || product.id))}`;
        }
        return;
      }
      addToCart(product);
      addToast("Đã thêm vào danh sách quan tâm", "success");
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isLiked) {
        removeFromWishlist(product.id);
        addToast("Đã xóa khỏi yêu thích", "info");
      } else {
        addToWishlist(product);
        addToast("Đã thêm vào yêu thích", "success");
      }
    };

    const formattedPrice = isCatalogMode ? "Liên hệ tư vấn" : product.price.toLocaleString("vi-VN") + " VND";
    const formattedOriginalPrice = product.originalPrice
      ? product.originalPrice.toLocaleString("vi-VN") + "₫"
      : "";

    const discountVal =
      hasDiscount && product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;

    return (
      <article
        className={`group bg-white border border-slate-200/80 rounded-[10px] md:rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#ea580c]/20 transition-all duration-300 flex md:h-full ${
          variant === "mobileHorizontal"
            ? "h-[154px] flex-row md:h-full md:flex-col"
            : "h-[288px] flex-col"
        }`}
      >
        {/* 16:9 Image container - hugs the top and sides of the card */}
        <div
          className={`relative overflow-hidden bg-slate-100 flex-shrink-0 ${
            variant === "mobileHorizontal"
              ? "w-[38%] h-full md:w-full md:h-auto md:aspect-[16/9]"
              : "aspect-[16/9] w-full"
          }`}
        >
          <Link
            href={`/product/${product.slug || product.id}`}
            className="relative block w-full h-full"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${stableMedia || imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          </Link>
          <button
            onClick={handleToggleWishlist}
            className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-all duration-200 ${
              isLiked
                ? "text-rose-500 bg-rose-50"
                : "text-slate-400 hover:text-white hover:bg-[#ea580c]"
            }`}
            aria-label="Thêm vào yêu thích"
          >
            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black text-slate-800 bg-white/90 backdrop-blur rounded shadow-sm select-none">
            {product.format}
          </span>
          {hasDiscount && (
            <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-black text-white bg-rose-600 rounded shadow-sm select-none">
              -{discountVal}% OFF
            </span>
          )}
        </div>

        {/* Responsive padding text area - more compact on mobile */}
        <div
          className={`pt-3 pb-3 px-3.5 md:pt-3 md:pb-3 md:px-3.5 flex flex-col flex-1 min-h-0 ${
            variant === "mobileHorizontal"
              ? "w-[62%] p-2.5 md:w-auto md:p-3.5"
              : ""
          }`}
        >
          {/* Title: Larger font, clean colors, responsive height */}
          <Link
            href={`/product/${product.slug || product.id}`}
            className="block mb-0.5 md:mb-1"
          >
            <h3
              className={`md:text-base font-extrabold text-slate-900 line-clamp-2 hover:text-[#ea580c] transition-colors leading-[1.4] md:min-h-[40px] ${
                variant === "mobileHorizontal"
                  ? "text-xs"
                  : "text-[12px] sm:text-sm"
              }`}
            >
              {product.name}
            </h3>
          </Link>

          {/* Row 2: Author (left) & Price (right) - Spacing tightened on mobile */}
          <div
            className={`flex gap-2 mt-0.5 ${
              variant === "mobileHorizontal"
                ? "items-start justify-between"
                : "items-center justify-between"
            } ${variant === "mobileHorizontal" ? "mb-1" : "mb-1.5"}`}
          >
            <span
              className={`text-slate-600 font-semibold truncate md:max-w-[120px] ${
                variant === "mobileHorizontal"
                  ? "text-[10px] max-w-[92px]"
                  : "text-[10px] sm:text-xs max-w-[96px] sm:max-w-[140px]"
              }`}
            >
              {product.author || "Web Giá Rẻ - Portfolio"}
            </span>
            <div
              className={`flex flex-shrink-0 ${
                variant === "mobileHorizontal"
                  ? "items-end gap-1 flex-col"
                  : "items-center gap-1.5"
              }`}
            >
              <span
                className={`${variant === "mobileHorizontal" ? "text-xs" : "text-[12px] sm:text-sm"} font-black text-slate-900`}
              >
                {formattedPrice}
              </span>
              {hasDiscount && (
                <span className="text-[10px] md:text-xs text-slate-400 line-through font-medium">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Divider line & Footer wrapped to fix spacing gaps - tighter margin on mobile */}
          <div className="md:mt-auto">
            <div
              className={`border-t border-slate-100 ${variant === "mobileHorizontal" ? "my-1.5" : "my-2"}`}
            />

            {/* Row 3: Sales/Ratings (left) & Actions (right) */}
            <div className="pt-0.5 flex items-center justify-between gap-2">
              {/* Sales & Rating stars on left */}
              <div className="flex flex-col items-start">
                <span
                  className={`${variant === "mobileHorizontal" ? "text-[10px]" : "text-[10px] sm:text-xs"} md:text-[11px] font-bold text-slate-500 mb-0.5`}
                >
                  {(product.reviews || 0) * 8 + 12} {isCatalogMode ? "Quan tam" : "Sales"}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      fill={
                        i < Math.round(product.rating || 5)
                          ? "currentColor"
                          : "none"
                      }
                      className="stroke-[1.5]"
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons on right */}
              <div
                className={`flex flex-shrink-0 ${
                  variant === "mobileHorizontal"
                    ? "items-center gap-2"
                    : "items-center gap-2 md:gap-1.5"
                }`}
              >
                <button
                  onClick={handleAddToCart}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 shadow-sm transition-all duration-200 hover:border-[#ea580c] hover:bg-[#ea580c] hover:text-white"
                  aria-label={isCatalogMode ? "Nhận tư vấn" : "Thêm vào danh sách"}
                >
	                  {isCatalogMode ? <MessageCircle size={14} strokeWidth={2.5} /> : <Download size={14} strokeWidth={2.5} />}
                </button>
                <Link
                  href={`/product/${product.slug || product.id}`}
                  className={`${variant === "mobileHorizontal" ? "px-2.5 py-1.5 text-[10px]" : "px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs"} md:px-3 md:py-1.5 rounded-full border border-slate-200 md:text-[11px] font-bold text-slate-700 hover:bg-[#ea580c] hover:text-white hover:border-[#ea580c] transition-all duration-200 shadow-sm`}
                >
                  Live Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  },
);
DpMarketProductCard.displayName = "DpMarketProductCard";

// ============================================
// Main HomePage Component
// ============================================
interface HomePageProps {
  initialProducts?: Product[];
  initialCategories?: DbCategory[];
  initialBlogPosts?: DbBlogPost[];
}

const HomePage = ({
  initialProducts = [],
  initialCategories = [],
  initialBlogPosts = [],
}: HomePageProps) => {
  const [allProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<DbCategory[]>(initialCategories);
  const [blogPosts] = useState<DbBlogPost[]>(initialBlogPosts);
  const { isCatalogMode } = useSiteMode();
  const loading = false;

  // States for interactive tabs
  const [arrivalTab, setArrivalTab] = useState<
    "all" | "Theme" | "Landing" | "Template" | "MiniApp"
  >("all");

  // Search inputs
  const [searchVal, setSearchVal] = useState("");
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Circular Text Ref
  const textRefFeaturedAuthor = useRef<HTMLDivElement>(null);
  const textRefPerformance = useRef<HTMLDivElement>(null);
  const authorSliderRef = useRef<HTMLDivElement>(null);
  const bestsellerCarouselRef = useRef<HTMLDivElement>(null);
  const bestsellerDragStartX = useRef(0);
  const bestsellerDragStartScroll = useRef(0);
  const bestsellerDragging = useRef(false);
  const bestsellerPointerInside = useRef(false);

  useEffect(() => {
    let intervalId: number | undefined;
    const initialDelayId = window.setTimeout(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSliderImages.length);
      intervalId = window.setInterval(() => {
        setHeroSlideIndex((current) => (current + 1) % heroSliderImages.length);
      }, 3000);
    }, 8000);

    return () => {
      window.clearTimeout(initialDelayId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const root = document.querySelector<HTMLElement>('[data-home-animate="true"]');
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("section"))
      .filter((section) => !section.classList.contains("hidden") && !section.closest(".hidden"));

    root.classList.add("home-reveal-ready");

    const revealVariants = [
      { x: "0px", y: "24px", scale: "0.985", rotate: "0deg", duration: "720ms" },
      { x: "-18px", y: "12px", scale: "1", rotate: "0deg", duration: "760ms" },
      { x: "18px", y: "12px", scale: "1", rotate: "0deg", duration: "760ms" },
      { x: "0px", y: "10px", scale: "0.975", rotate: "0deg", duration: "820ms" },
      { x: "0px", y: "18px", scale: "1", rotate: "-0.35deg", duration: "780ms" },
    ];

    sections.forEach((section, index) => {
      const variant = revealVariants[index % revealVariants.length];
      section.classList.add("home-reveal");
      section.style.setProperty("--reveal-delay", `${Math.min(index * 35, 160)}ms`);
      section.style.setProperty("--reveal-x", variant.x);
      section.style.setProperty("--reveal-y", variant.y);
      section.style.setProperty("--reveal-scale", variant.scale);
      section.style.setProperty("--reveal-rotate", variant.rotate);
      section.style.setProperty("--reveal-duration", variant.duration);
    });

    sections[0]?.classList.add("is-visible");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    sections.slice(1).forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollAuthorLeft = () => {
    if (authorSliderRef.current) {
      authorSliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollAuthorRight = () => {
    if (authorSliderRef.current) {
      authorSliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // Effect to rotate author text circle
  useEffect(() => {
    const handleCircularText = (
      element: HTMLDivElement | null,
      offsetAngle = 11.5,
    ) => {
      if (element) {
        const rawText = element.innerText;
        element.innerHTML = rawText
          .split("")
          .map(
            (char, i) =>
              `<span style="position: absolute; left: 50%; transform-origin: 0 75px; transform: rotate(${i * offsetAngle}deg); font-size: 10px; font-weight: 800; text-transform: uppercase; color: #ea580c;">${char}</span>`,
          )
          .join("");
      }
    };

    if (!loading) {
      setTimeout(() => {
        handleCircularText(textRefFeaturedAuthor.current, 10.5);
        handleCircularText(textRefPerformance.current, 12);
      }, 300);
    }
  }, [loading]);

  // Client side filters with robust random fallback
  const getNewArrivalProducts = () => {
    const filtered =
      arrivalTab === "all"
        ? allProducts
        : allProducts.filter((p) => p.format === arrivalTab);

    if (filtered.length > 0) {
      return filtered.slice(0, 8);
    }
    // Fallback: shuffle all products if tabs are empty
    if (allProducts.length > 0) {
      return [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
    }
    return mockProducts.slice(0, 8);
  };

  const getFeaturedProducts = () => {
    return allProducts.filter((p) => p.isFeatured).slice(0, 4);
  };

  const getBestSellers = () => {
    return allProducts.filter((p) => p.isBestseller).slice(0, 6);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchVal.trim())}`;
    }
  };

  const displayArrivalProducts = getNewArrivalProducts();
  const displayFeaturedProducts = getFeaturedProducts();
  const displayBestSellers = getBestSellers();
  const shouldLoopBestSellers = displayBestSellers.length > 4;
  const displayBlogs =
    blogPosts.length >= 4
      ? blogPosts.slice(0, 4)
      : [...blogPosts, ...mockBlogs].slice(0, 4);

  useEffect(() => {
    if (bestsellerCarouselRef.current) {
      bestsellerCarouselRef.current.scrollLeft = 0;
    }
  }, [displayBestSellers.length, shouldLoopBestSellers]);

  useEffect(() => {
    const carousel = bestsellerCarouselRef.current;
    if (!carousel || !shouldLoopBestSellers) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopViewport = window.matchMedia("(min-width: 768px)");
    if (reduceMotion.matches || !desktopViewport.matches) return;

    const scrollOneCard = () => {
      if (!bestsellerDragging.current && !bestsellerPointerInside.current) {
        const firstCard = carousel.querySelector<HTMLElement>(".bestseller-marquee-card");
        const track = firstCard?.parentElement;
        const gap = track ? parseFloat(window.getComputedStyle(track).columnGap || "0") : 0;
        const step = (firstCard?.offsetWidth || 290) + gap;
        const loopWidth = carousel.scrollWidth / 2;

        carousel.scrollBy({ left: step, behavior: "smooth" });

        window.setTimeout(() => {
          if (loopWidth > 0 && carousel.scrollLeft >= loopWidth - 4) {
            carousel.scrollLeft -= loopWidth;
          }
        }, 850);
      }
    };

    const intervalId = window.setInterval(scrollOneCard, 4200);
    return () => window.clearInterval(intervalId);
  }, [displayBestSellers.length, shouldLoopBestSellers]);

  useEffect(() => {
    const carousel = bestsellerCarouselRef.current;
    if (!carousel || !shouldLoopBestSellers) return;

    const syncLoopPosition = () => {
      const loopWidth = carousel.scrollWidth / 2;
      if (loopWidth <= 0) return;

      if (carousel.scrollLeft >= loopWidth) {
        carousel.scrollLeft -= loopWidth;
      } else if (carousel.scrollLeft < 0) {
        carousel.scrollLeft += loopWidth;
      }
    };

    carousel.addEventListener("scroll", syncLoopPosition, { passive: true });
    return () => carousel.removeEventListener("scroll", syncLoopPosition);
  }, [displayBestSellers.length, shouldLoopBestSellers]);

  const handleBestsellerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const carousel = bestsellerCarouselRef.current;
    if (!carousel) return;

    bestsellerDragging.current = true;
    bestsellerDragStartX.current = event.clientX;
    bestsellerDragStartScroll.current = carousel.scrollLeft;
    carousel.classList.add("is-dragging");
  };

  const handleBestsellerMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const carousel = bestsellerCarouselRef.current;
    if (!carousel || !bestsellerDragging.current) return;

    event.preventDefault();
    const distance = event.clientX - bestsellerDragStartX.current;
    carousel.scrollLeft = bestsellerDragStartScroll.current - distance;
  };

  const stopBestsellerDrag = () => {
    const carousel = bestsellerCarouselRef.current;
    bestsellerDragging.current = false;
    carousel?.classList.remove("is-dragging");
  };

  // Find a featured creator or show mock top author
  const topAuthorName = allProducts[0]?.author || "CodeCrafter Studio";
  const authorProducts = allProducts
    .filter((p) => p.author === topAuthorName)
    .slice(0, 5);
  const displayAuthorProducts =
    authorProducts.length >= 5
      ? authorProducts
      : allProducts.length >= 5
        ? allProducts.slice(0, 5)
        : [...allProducts, ...mockProducts].slice(0, 5);

  return (
    <main data-home-animate="true" className="overflow-hidden bg-[#fafbfe] text-slate-800 font-sans">
      {/* ============================================================
         1. HERO SECTION (BannerOne)
         ============================================================ */}
      <section className="relative bg-gradient-to-br from-[#fff7ed] via-white to-[#f8fafc] pt-5 pb-8 md:pt-10 md:pb-12 lg:pt-20 lg:pb-16 overflow-hidden">
        {/* Soft Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(251,146,60,0.14),transparent_38%),radial-gradient(circle_at_84%_78%,rgba(244,63,94,0.08),transparent_40%)]"
          />
          {/* Gradient Mesh Blur Spot decorations */}
          <div className="absolute w-[280px] md:w-[420px] h-[280px] md:h-[420px] rounded-full bg-orange-200/20 blur-[90px] md:blur-[130px] -top-16 -left-10 pointer-events-none"></div>
          <div className="absolute w-[360px] md:w-[520px] h-[360px] md:h-[520px] rounded-full bg-rose-100/30 blur-[90px] md:blur-[130px] bottom-0 right-0 pointer-events-none"></div>
        </div>

        {/* Decorative Floating Tech Shapes */}
        <div className="hidden lg:flex absolute top-10 left-[5%] z-1 animate-float pointer-events-none opacity-40 bg-white/80 backdrop-blur border border-slate-100 shadow-md p-3 rounded-2xl items-center justify-center text-[#ea580c]">
          <Code size={22} strokeWidth={2.5} />
        </div>
        <div className="hidden lg:flex absolute bottom-16 right-[5%] z-1 animate-[float_4s_ease-in-out_infinite] pointer-events-none opacity-40 bg-white/80 backdrop-blur border border-slate-100 shadow-md p-3 rounded-2xl items-center justify-center text-amber-500">
          <Layers size={22} strokeWidth={2.5} />
        </div>
        <div className="hidden lg:flex absolute top-24 left-[40%] z-1 animate-[float_3.5s_ease-in-out_infinite] pointer-events-none opacity-30 bg-white/80 backdrop-blur border border-slate-100 shadow-md p-2 rounded-xl items-center justify-center text-orange-300">
          <Sparkles size={14} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-[0.98fr_1.02fr] gap-6 md:gap-8 lg:gap-10 items-center min-w-0">
            {/* Left Content */}
            <div className="w-full min-w-0 lg:max-w-[620px]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-orange-600 shadow-sm">
                <Sparkles size={13} className="text-[#ea580c]" />
                <span>Kho giao diện website dành cho người Việt</span>
              </div>

              <h1 className="max-w-full text-[2.1rem] sm:text-5xl md:text-6xl lg:text-[4.15rem] font-extrabold text-slate-950 tracking-normal leading-[1.08] md:leading-[1.06] mb-4 md:mb-5 break-words">
                {isCatalogMode ? (
                  <>
                    Tham khảo <span className="text-[#ea580c]">giao diện website</span> đẹp,
                    dễ tùy chỉnh và hợp nhu cầu
                  </>
                ) : (
                  <>
                    Tham khảo <span className="text-[#ea580c]">giao diện website</span> đẹp,
                    dễ tùy chỉnh và hợp nhu cầu
                  </>
                )}
              </h1>

              <p className="max-w-xl text-sm sm:text-lg text-slate-600 font-normal leading-relaxed mb-5 md:mb-7">
                {isCatalogMode
                  ? 'Khám phá template website, landing page, UI kit và dashboard chất lượng cao. Xem demo, lọc mẫu phù hợp và gửi nhu cầu để được tư vấn triển khai.'
                  : 'Khám phá portfolio giao diện website, landing page, UI kit và dashboard chất lượng cao. Xem demo, tham khảo thông tin kỹ thuật và gửi nhu cầu tư vấn cho dự án của bạn.'}
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center bg-white p-1.5 sm:p-2 rounded-2xl sm:rounded-full shadow-lg shadow-slate-200/70 border border-slate-100 w-full max-w-xl mb-5 md:mb-7"
              >
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Tìm kiếm theme, landing page, UI Kit..."
                  className="w-full min-w-0 pl-4 sm:pl-5 pr-12 sm:pr-14 py-3 rounded-full text-slate-700 placeholder-slate-400 font-semibold bg-transparent outline-none text-sm md:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-3 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-orange-500/20"
                  aria-label="Tìm kiếm"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </form>

              {/* Technology badges list */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="text-xs md:text-sm font-semibold text-slate-500 mr-1 uppercase tracking-wide block w-full mb-1 md:inline md:w-auto md:mb-0">
                  Phổ biến:
                </span>
                {[
                  {
                    name: "Figma",
                    search: "Figma",
                    color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200",
                    icon: (
                      <img
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg"
                        alt=""
                        className="h-[18px] w-[18px]"
                        loading="lazy"
                      />
                    ),
                  },
                  {
                    name: "Laravel",
                    search: "Laravel",
                    color:
                      "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
                    icon: (
                      <svg
                        className="w-[18px] h-[18px] text-[#ff2d20]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.642 5.43a.364.364 0 0 0-.014-.1.432.432 0 0 0-.038-.09.73.73 0 0 0-.05-.08.436.436 0 0 0-.082-.07.355.355 0 0 0-.07-.05L12.2.017a.5.5 0 0 0-.4 0L.612 5.04a.355.355 0 0 0-.07.05.436.436 0 0 0-.082.07.73.73 0 0 0-.05.08.432.432 0 0 0-.038.09.364.364 0 0 0-.014.1v13.14c0 .2.12.38.3.46l11.188 4.954a.5.5 0 0 0 .4 0l11.188-4.954c.18-.08.3-.26.3-.46V5.43ZM12 1.03l10.02 4.5-3.72 1.67-10.02-4.5L12 1.03ZM6.97 3.29l10.02 4.5L12 10.03 1.98 5.53l4.99-2.24ZM1.36 6.21l10.14 4.56v11.98L1.36 18.26V6.21Zm21.28 12.05-10.14 4.49V10.77l10.14-4.56v12.05Z" />
                      </svg>
                    ),
                  },
                  {
                    name: "PHP",
                    search: "PHP",
                    color:
                      "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200",
                    icon: (
                      <svg
                        className="w-5 h-4 text-[#777bb4]"
                        viewBox="0 0 32 18"
                        fill="currentColor"
                      >
                        <ellipse cx="16" cy="9" rx="16" ry="9" fill="#777BB4" />
                        <path
                          fill="#fff"
                          d="M6.1 5.2h3.1c1.8 0 2.8.8 2.5 2.3-.3 1.7-1.5 2.6-3.5 2.6H6.9l-.5 2.7H4.8l1.3-7.6Zm1.4 1.2-.4 2.5h1.2c1 0 1.6-.4 1.8-1.3.1-.8-.3-1.2-1.3-1.2H7.5Zm6.2-1.2h1.6l-.5 2.7h2.1l.5-2.7H19l-1.3 7.6h-1.6l.6-3.3h-2.1l-.6 3.3h-1.6l1.3-7.6Zm6.7 0h3.1c1.8 0 2.8.8 2.5 2.3-.3 1.7-1.5 2.6-3.5 2.6h-1.3l-.5 2.7h-1.6l1.3-7.6Zm1.4 1.2-.4 2.5h1.2c1 0 1.6-.4 1.8-1.3.1-.8-.3-1.2-1.3-1.2h-1.3Z"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "HTML",
                    search: "HTML",
                    color:
                      "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200",
                    icon: (
                      <svg
                        className="w-[18px] h-[18px] text-[#e34f26]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1.5 0h21l-1.91 21.56L11.98 24l-8.57-2.44L1.5 0Zm4.27 4.42.23 2.58h11.99l-.28 3.12H8.86l.23 2.56h8.4l-.32 3.58-5.17 1.43-5.16-1.43-.35-3.93H3.94l.5 5.95L12 20.42l7.58-2.14.98-13.86H5.77Z" />
                      </svg>
                    ),
                  },
                  {
                    name: "Figma",
                    search: "Figma",
                    color:
                      "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200",
                    icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          d="M8 24c2.21 0 4-1.79 4-4v-4H8c-2.21 0-4 1.79-4 4s1.79 4 4 4z"
                          fill="#0acf83"
                        />
                        <path
                          d="M4 12c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4z"
                          fill="#a259ff"
                        />
                        <path
                          d="M4 4c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4z"
                          fill="#f24e1e"
                        />
                        <path
                          d="M12 4c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4h-4V4z"
                          fill="#ff7262"
                        />
                        <path
                          d="M12 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4h-4v-8z"
                          fill="#1abc9c"
                        />
                      </svg>
                    ),
                  },
                  {
                    name: "Bootstrap",
                    search: "Bootstrap",
                    color:
                      "hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200",
                    icon: (
                      <svg
                        className="w-[18px] h-[18px] text-[#7952b3]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M4.53 3.13C4.23 2.26 4.88 1.36 5.8 1.36h12.4c.92 0 1.57.9 1.27 1.77l-1.13 3.32a4.9 4.9 0 0 1 .5 9.07l1.12 3.35c.3.87-.35 1.77-1.27 1.77H5.31c-.92 0-1.57-.9-1.27-1.77l1.12-3.35a4.9 4.9 0 0 1 .5-9.07L4.53 3.13Zm5.21 4.54v3.11h2.58c1.06 0 1.7-.55 1.7-1.56 0-.98-.64-1.55-1.7-1.55H9.74Zm0 4.63v3.55h2.9c1.2 0 1.9-.62 1.9-1.8 0-1.13-.7-1.75-1.9-1.75h-2.9Z" />
                      </svg>
                    ),
                  },
                  {
                    name: "Tailwind",
                    search: "Tailwind",
                    color:
                      "hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200",
                    icon: (
                      <svg
                        className="w-5 h-4 text-[#38bdf8]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
                      </svg>
                    ),
                  },
                  {
                    name: "React",
                    search: "React",
                    color:
                      "hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200",
                    icon: (
                      <svg
                        className="w-[18px] h-[18px] text-[#00d8ff]"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <ellipse
                          cx="10"
                          cy="10"
                          rx="9"
                          ry="3.5"
                          transform="rotate(0 10 10)"
                        />
                        <ellipse
                          cx="10"
                          cy="10"
                          rx="9"
                          ry="3.5"
                          transform="rotate(60 10 10)"
                        />
                        <ellipse
                          cx="10"
                          cy="10"
                          rx="9"
                          ry="3.5"
                          transform="rotate(120 10 10)"
                        />
                        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                      </svg>
                    ),
                  },
                ].map((tech, index) => (
                  <Link
                    key={`${tech.name}-${tech.search}-${index}`}
                    href={`/products?search=${tech.search}`}
                    className={`px-3.5 py-2 rounded-full border border-slate-200 bg-white/90 text-xs md:text-sm font-semibold text-slate-600 flex items-center gap-2 transition-all duration-200 ${tech.color} shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                  >
                    {tech.icon}
                    <span>{tech.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Banner Image Mockup with Floating Badges */}
	            <div className="relative flex justify-center lg:justify-end w-full min-w-0">
	              <div className="relative w-full max-w-[330px] sm:max-w-[470px] lg:max-w-[680px] aspect-[1.12] pointer-events-none">
		                {heroSliderImages.map((image, index) => (
		                  <Image
		                    key={image}
		                    src={image}
	                    alt="Banner Showcase"
	                    fill
	                    sizes="(max-width: 640px) 330px, (max-width: 1024px) 470px, 680px"
	                    className={`object-contain transition-opacity duration-700 ${
	                      index === heroSlideIndex ? "opacity-100" : "opacity-0"
		                    }`}
		                    priority={index === 0}
		                    fetchPriority={index === 0 ? "high" : "auto"}
		                  />
		                ))}

                {/* Floating Badge 1 (Purple - Left Float) */}
                <div className="absolute left-1 md:left-[-14px] bottom-5 md:bottom-[44px] z-10 animate-float px-3 md:px-5 py-2.5 md:py-3 rounded-2xl bg-[#c2410c] text-center text-white shadow-xl shadow-orange-300/30 min-w-[88px] md:min-w-[125px] border border-white/30 select-none pointer-events-auto cursor-default">
                  <p className="text-base md:text-xl font-extrabold mb-0">
                    50K+
                  </p>
                  <span className="text-[9px] md:text-[10px] font-semibold text-white uppercase tracking-widest leading-none block mt-0.5">
                    Khách hàng
                  </span>
                </div>

                {/* Floating Badge 2 (White - Right Float) */}
                <div className="absolute right-1 md:right-[-12px] top-5 md:top-[34px] z-10 animate-[float_3.5s_ease-in-out_infinite] px-3 md:px-5 py-2.5 md:py-3 rounded-2xl bg-white text-center text-slate-900 shadow-xl shadow-slate-200/80 min-w-[98px] md:min-w-[140px] border border-slate-100 select-none pointer-events-auto cursor-default">
                  <p className="text-base md:text-xl font-extrabold text-slate-900 mb-0">
                    22K+
                  </p>
                  <span className="text-[9px] md:text-[10px] font-semibold text-[#c2410c] uppercase tracking-widest leading-none block mt-0.5">
                    Theme & Plugin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200/70 bg-white py-4 md:py-6">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_48%,#ffffff_100%)] opacity-70 z-0" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent z-0" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0 snap-x">
            {[
              {
                name: "Figma",
                slug: "figma",
                qty: "8,420",
                gradient: "from-[#f24e1e]/15 to-orange-50",
                icon: (
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg"
                    alt=""
                    className="h-7 w-7 md:h-8 md:w-8"
                    loading="lazy"
                  />
                ),
              },
              {
                name: "React",
                slug: "source-code",
                qty: "6,543",
                gradient: "from-[#61dafb]/15 to-cyan-50",
                icon: (
                  <svg
                    className="w-7 h-7 md:w-8 md:h-8"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="2.05" fill="#61dafb" />
                    <g fill="none" stroke="#61dafb" strokeWidth="1.1">
                      <ellipse cx="12" cy="12" rx="10" ry="3.8" />
                      <ellipse
                        cx="12"
                        cy="12"
                        rx="10"
                        ry="3.8"
                        transform="rotate(60 12 12)"
                      />
                      <ellipse
                        cx="12"
                        cy="12"
                        rx="10"
                        ry="3.8"
                        transform="rotate(120 12 12)"
                      />
                    </g>
                  </svg>
                ),
              },
              {
                name: "HTML5",
                slug: "templates",
                qty: "12,987",
                gradient: "from-[#e34f26]/15 to-orange-50",
                icon: (
                  <svg
                    className="w-7 h-7 md:w-8 md:h-8"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 0l2.4 27L16 30l9.6-3L28 0z" fill="#e44d26" />
                    <path d="M16 27.4V2.6H26.1l-2 22.4z" fill="#f16529" />
                    <path
                      d="M9.1 6.3h6.9v3.4H12.8l.2 2.4H16v3.4h-6.2zm.3 8.6H12.7l.3 3.1 3 .8 3-0.8.3-3.5h3.3l-.6 7-6 1.7-6-1.7z"
                      fill="white"
                    />
                    <path
                      d="M16 6.3h6.9l-.2 2.2-.1 1.2H16v-3.4zm0 8.6h3.2l-.3 3.6-2.9.8v3.4l6-1.7.6-7H16z"
                      fill="#ebebeb"
                    />
                  </svg>
                ),
              },
              {
                name: "Next.js",
                slug: "source-code",
                qty: "4,217",
                gradient: "from-slate-200/50 to-slate-50",
                icon: (
                  <svg
                    className="w-7 h-7 md:w-8 md:h-8"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="black" />
                    <path
                      d="M7.7 7.2h1.62l5.86 8.64V7.2h1.62v9.6h-1.62L9.32 8.16v8.64H7.7V7.2z"
                      fill="white"
                    />
                    <path
                      d="M16.75 16.85 9.22 7.2h1.88l5.65 7.25v2.4z"
                      fill="white"
                      fillOpacity="0.75"
                    />
                  </svg>
                ),
              },
              {
                name: "Mobile App",
                slug: "mobile-apps",
                qty: "2,109",
                gradient: "from-[#0070f3]/15 to-blue-50",
                icon: (
                  <svg
                    className="w-7 h-7 md:w-8 md:h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="5"
                      y="1"
                      width="14"
                      height="22"
                      rx="3"
                      fill="#0070f3"
                    />
                    <rect
                      x="7"
                      y="4"
                      width="10"
                      height="13"
                      rx="1"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    <circle cx="12" cy="19.5" r="1.2" fill="white" />
                    <rect
                      x="9"
                      y="6"
                      width="6"
                      height="1"
                      rx="0.5"
                      fill="#0070f3"
                    />
                    <rect
                      x="9"
                      y="8.5"
                      width="4"
                      height="1"
                      rx="0.5"
                      fill="#0070f3"
                      fillOpacity="0.5"
                    />
                  </svg>
                ),
              },
              {
                name: "Figma",
                slug: "figma-templates",
                qty: "3,891",
                gradient: "from-purple-100/50 to-pink-50",
                icon: (
                  <svg
                    className="w-7 h-7 md:w-8 md:h-8"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z"
                      fill="#0acf83"
                    />
                    <path
                      d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z"
                      fill="#a259ff"
                    />
                    <path
                      d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z"
                      fill="#f24e1e"
                    />
                    <path
                      d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z"
                      fill="#ff7262"
                    />
                    <circle cx="16" cy="12" r="4" fill="#1abcfe" />
                  </svg>
                ),
              },
            ].map((cat, i) => (
              <Link
                key={`${cat.name}-${cat.slug}-${i}`}
                href={`/products?category=${cat.slug}`}
                className={`group popular-item flex flex-col items-center text-center p-4 bg-white/95 border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-200/60 hover:shadow-lg hover:-translate-y-1 hover:border-[#ea580c]/30 transition-all duration-300 min-w-[132px] md:min-w-0 flex-shrink-0 snap-start`}
              >
                <span
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:scale-105 shadow-sm ring-1 ring-white`}
                >
                  {cat.icon}
                </span>
                <p className="text-xs md:text-sm font-bold text-slate-900 mb-0.5 group-hover:text-[#ea580c] transition-colors leading-tight">
                  {cat.name}
                </p>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium">
                  {cat.qty} mẫu demo
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-7 md:py-12">
        {/* Soft Background Gradient */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/dpmarket-assets/images/gradients/product-gradient.png"
            alt="Gradient"
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            loading="lazy"
          />
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px), radial-gradient(circle at 18% 20%, rgba(234,88,12,0.08), transparent 28%), radial-gradient(circle at 84% 12%, rgba(59,130,246,0.07), transparent 26%)",
              backgroundSize: "42px 42px, 42px 42px, 100% 100%, 100% 100%",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
          <div className="absolute left-8 top-10 hidden h-20 w-32 rounded-2xl border border-slate-200/70 bg-white/50 shadow-sm backdrop-blur lg:block" />
          <div className="absolute right-10 top-24 hidden h-14 w-44 rounded-2xl border border-orange-200/60 bg-orange-50/50 shadow-sm backdrop-blur lg:block" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-2xl mx-auto mb-4 md:mb-6">
            <span className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[#ea580c] text-[11px] md:text-xs font-bold uppercase tracking-widest mb-2 shadow-sm">
              MẪU DEMO MỚI NHẤT
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-950 leading-tight">
              Tài nguyên số mới cập bến
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#ea580c]" />
          </div>

          {/* centered Pills tabs */}
          <div className="flex justify-start md:justify-center mb-4 md:mb-6 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 p-1.5 bg-white/90 rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/70 backdrop-blur">
              {[
                { id: "all", label: "Tất cả" },
                { id: "Theme", label: "React / Next.js Themes" },
                { id: "Landing", label: "Landing Pages" },
                { id: "Template", label: "HTML/Web Templates" },
                { id: "MiniApp", label: "Mini Apps" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setArrivalTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 select-none ${
                    arrivalTab === tab.id
                      ? "bg-[#c2410c] text-white shadow-md shadow-orange-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid / Horizontal Scroll Carousel on mobile */}
          {loading ? (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 overflow-x-auto no-scrollbar pb-4 md:pb-0 snap-x">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[288px] md:h-[320px] min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] flex-shrink-0 snap-start md:min-w-0 md:w-auto rounded-[10px] md:rounded-2xl bg-slate-100 animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 overflow-x-auto no-scrollbar pb-4 md:pb-0 snap-x">
              {displayArrivalProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] flex-shrink-0 snap-start text-slate-800 md:min-w-0 md:w-auto"
                >
                  <DpMarketProductCard product={product} index={idx} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5 md:mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-full bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs md:text-sm shadow-lg shadow-orange-600/15 hover:shadow-xl hover:shadow-orange-600/25 transition-all duration-200 select-none"
            >
              Khám phá thêm giao diện <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative px-5 py-3 sm:px-6 md:py-5 lg:px-0">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1 no-scrollbar snap-x scroll-px-5 sm:scroll-px-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-8">
          {[
            {
              href: "/products?category=themes",
              image: "/hero_section/banner_1.webp",
              alt: "Portfolio giao diện website và landing page chất lượng cao tại Web Giá Rẻ - Portfolio",
            },
            {
              href: "/products?category=ui-kits",
              image: "/hero_section/banner_2.webp",
              alt: "Bộ sưu tập giao diện, UI kit và landing page tại Web Giá Rẻ - Portfolio",
            },
          ].map((banner) => (
            <Link
              key={banner.image}
              href={banner.href}
              className="group relative aspect-[16/9] w-[82vw] min-w-[82vw] flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-950 shadow-md shadow-slate-200/60 sm:w-[66vw] sm:min-w-[66vw] lg:w-auto lg:min-w-0"
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 66vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </section>

      {(loading || displayFeaturedProducts.length > 0) && (
      <section className="relative pb-7 pt-4 md:pb-12 md:pt-8 overflow-hidden">
        {/* Premium warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff7f0] to-white z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-violet-200/20 to-transparent blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-100/30 to-transparent blur-[100px] pointer-events-none z-0" />
        {/* Spider net background shapes */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none opacity-10 z-1">
          <Image
            src="/dpmarket-assets/images/shapes/spider-net.png"
            alt=""
            fill
            sizes="300px"
            className="object-contain"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 z-10">
          <div className="pointer-events-none absolute left-[54.2%] top-[48%] z-20 hidden h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center lg:flex">
            <svg
              className="absolute inset-0 h-full w-full animate-[spin_16s_linear_infinite]"
              viewBox="0 0 128 128"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="featuredCirclePath"
                  d="M64,64 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0"
                />
              </defs>
              <text
                fill="#94a3b8"
                fontSize="9"
                fontWeight="800"
                letterSpacing="3.5"
              >
                <textPath href="#featuredCirclePath">
                  OUR TOP PERFORMANCE STATS ? OUR TOP PICKS ?
                </textPath>
              </text>
            </svg>
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#ea580c] text-white shadow-xl shadow-orange-500/30 ring-4 ring-white">
              <Shield size={25} strokeWidth={2.6} />
            </span>
          </div>
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-12 items-center">
            {/* Left 2x2 Grid of Featured Products - Order 2 on mobile */}
            <div className="order-2 lg:order-1 w-full overflow-hidden md:overflow-visible">
              {loading ? (
                <div className="flex md:grid md:grid-cols-2 gap-3 md:gap-6 overflow-x-auto no-scrollbar pb-4 md:pb-0 snap-x">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-[288px] md:h-[310px] min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] flex-shrink-0 snap-start md:min-w-0 md:w-auto rounded-[10px] md:rounded-2xl bg-white border border-slate-200/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex md:grid md:grid-cols-2 gap-3 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-2 snap-x">
                  {displayFeaturedProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className={`min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] flex-shrink-0 snap-start text-slate-800 transition-transform duration-300 md:min-w-0 md:w-auto ${
                        idx === 0
                          ? "md:-rotate-1 md:-translate-y-2"
                          : idx === 1
                            ? "md:rotate-1 md:translate-y-2"
                            : idx === 2
                              ? "md:rotate-1 md:-translate-y-1"
                              : "md:-rotate-1 md:translate-y-3"
                      } hover:md:rotate-0 hover:md:-translate-y-1`}
                    >
                      <DpMarketProductCard product={product} index={idx} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Heading and Content - Order 1 on mobile */}
            <div className="order-1 lg:order-2 lg:pl-8 mb-4 lg:mb-0">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-5 md:p-8 shadow-sm shadow-slate-200/70 backdrop-blur">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-100/70 blur-2xl" />
                <div className="absolute bottom-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />
                <div className="relative">
                  <span className="text-[#ea580c] text-xs font-extrabold uppercase tracking-widest mb-1 md:mb-2 block">
                    MẪU DEMO NỔI BẬT
                  </span>
                  <h2 className="text-xl md:text-4xl font-extrabold text-slate-950 leading-snug md:leading-tight mb-3 md:mb-4">
                    Mẫu giao diện tiêu biểu do chúng tôi chọn lọc
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 font-normal leading-relaxed mb-5 md:mb-6">
                    Mỗi tuần, các chuyên gia nội dung của chúng tôi lựa chọn
                    những giao diện website nổi bật nhất về cả thiết kế lẫn mã nguồn
                    để giới thiệu. Đảm bảo giao diện hiện đại, dễ tùy biến và
                    tương thích tốt.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-5 md:mb-6">
                    {[
                      { value: "4.8+", label: "điểm TB" },
                      { value: "24h", label: "duyệt mới" },
                      { value: "100%", label: "có demo" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm"
                      >
                        <div className="text-base md:text-lg font-extrabold text-slate-950 leading-none">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {[
                      {
                        icon: Shield,
                        text: "Kiểm tra bố cục responsive và chất lượng asset",
                      },
                      {
                        icon: Gauge,
                        text: "Ưu tiên template tải nhanh, cấu trúc dễ chỉnh",
                      },
                      {
                        icon: Headphones,
                        text: "Tác giả có lịch sử hỗ trợ và cập nhật ổn định",
                      },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-3.5 py-3"
                      >
                        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#ea580c] shadow-sm">
                          <item.icon size={15} strokeWidth={2.3} />
                        </span>
                        <span className="text-xs md:text-sm font-medium leading-relaxed text-slate-600">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link
                      href="/products?featured=true"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-7 md:py-3.5 rounded-full border border-slate-300 hover:border-[#ea580c] hover:bg-[#ea580c]/5 text-slate-700 hover:text-[#ea580c] font-bold text-xs transition-all duration-200 select-none bg-white shadow-sm"
                    >
                      Xem tất cả nổi bật <ArrowUpRight size={14} />
                    </Link>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Cập nhật mỗi tuần
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {(loading || displayBestSellers.length > 0) && (
      <section
        className="relative overflow-hidden border-y border-slate-200/80 py-7 md:py-12"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #fff7ed 42%, #f0fdff 100%)",
        }}
      >
        {/* Rich aurora-style gradient overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-90px] left-[-60px] w-[520px] h-[520px] rounded-full bg-[#ea580c]/14 blur-[130px]" />
          <div className="absolute bottom-[-70px] right-[-40px] w-[460px] h-[460px] rounded-full bg-cyan-500/12 blur-[110px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[320px] rounded-full bg-violet-700/5 blur-[100px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 z-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[#ea580c] text-xs font-extrabold uppercase tracking-widest mb-3 shadow-sm shadow-orange-100">
                <TrendingUp size={13} />
                {isCatalogMode ? 'ĐƯỢC QUAN TÂM TUẦN NÀY' : 'ĐƯỢC QUAN TÂM TUẦN NÀY'}
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-950 leading-tight">
                {isCatalogMode ? 'Mẫu demo được quan tâm hàng đầu' : 'Mẫu demo được quan tâm hàng đầu'}
              </h2>
              <p className="text-slate-600 text-xs md:text-sm font-normal max-w-xl mt-2 leading-relaxed">
                {isCatalogMode
                  ? 'Danh sách những mẫu giao diện được người dùng xem demo và quan tâm nhiều trong tuần qua.'
                  : 'Danh sách những mẫu giao diện được người dùng xem demo và quan tâm nhiều trong tuần qua.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: isCatalogMode ? "Quan tâm" : "Top sales", value: "7 ngày" },
                  { label: "Rating", value: "4.8+" },
                  { label: "Demo", value: "sẵn sàng" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ea580c]" />
                    {item.label}:{" "}
                    <strong className="font-bold text-slate-900">
                      {item.value}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/products?sort=popular"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#ea580c] text-slate-700 hover:text-white font-bold text-xs transition-all duration-200 select-none border border-slate-200 shadow-sm hover:border-[#ea580c] mt-4 md:mt-0"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* Carousel container - custom slim scrollbar */}
          {loading ? (
            <div className="relative rounded-3xl border border-orange-100/80 bg-white/70 p-3 shadow-lg shadow-orange-100/40 backdrop-blur">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
              <div className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x scroll-smooth pb-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[288px] md:h-[300px] min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] max-w-[310px] flex-shrink-0 snap-start rounded-[10px] md:rounded-2xl bg-slate-100 animate-pulse border border-slate-200/50"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-orange-100/80 bg-white/70 p-3 shadow-lg shadow-orange-100/40 backdrop-blur">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
              <div
                ref={bestsellerCarouselRef}
                className="bestseller-drag-scroll relative overflow-x-auto no-scrollbar pb-1"
                onMouseDown={handleBestsellerMouseDown}
                onMouseMove={handleBestsellerMouseMove}
                onMouseUp={stopBestsellerDrag}
                onMouseLeave={() => {
                  bestsellerPointerInside.current = false;
                  stopBestsellerDrag();
                }}
                onMouseEnter={() => {
                  bestsellerPointerInside.current = true;
                }}
              >
                <div className={`flex snap-x scroll-smooth md:snap-none ${shouldLoopBestSellers ? "w-max" : "w-max md:w-full md:justify-center"}`}>
                  {(shouldLoopBestSellers ? [0, 1] : [0]).map((loopIndex) => (
                    <div
                      key={loopIndex}
                      aria-hidden={loopIndex === 1}
                      className={`flex gap-3 md:gap-5 ${shouldLoopBestSellers ? "md:pr-5" : ""} ${loopIndex === 1 ? "hidden md:flex" : ""}`}
                    >
                      {displayBestSellers.map((product, idx) => (
                        <div
                          key={`${product.id}-${loopIndex}`}
                          className="bestseller-marquee-card relative min-w-[62vw] w-[62vw] sm:min-w-[270px] sm:w-[270px] max-w-[310px] flex-shrink-0 snap-start pt-4 text-slate-800"
                        >
                          <span
                            className={`absolute left-4 top-0 z-20 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg ring-2 ring-white ${
                              idx === 0
                                ? "bg-gradient-to-r from-orange-600 to-red-500 shadow-orange-300/40"
                                : idx === 1
                                  ? "bg-gradient-to-r from-slate-800 to-slate-950 shadow-slate-900/20"
                                  : idx === 2
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-300/30"
                                    : "bg-slate-950 shadow-slate-900/20"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <DpMarketProductCard product={product} index={idx} stableMedia />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      )}

              {/* === FEATURED AUTHOR SECTION - Light Pastel Style === */}
      <section className="hidden">
        {/* Light pastel background matching Stats section */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #fff8f0 48%, #f8fbff 100%)",
          }}
        />
        {/* Wavy topographic lines */}
        <div
          className="absolute inset-0 z-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='500'%3E%3Cpath d='M0 250 Q175 150 350 250 T700 250' fill='none' stroke='%235650f0' stroke-width='1.2'/%3E%3Cpath d='M0 200 Q175 100 350 200 T700 200' fill='none' stroke='%235650f0' stroke-width='1.2'/%3E%3Cpath d='M0 300 Q175 200 350 300 T700 300' fill='none' stroke='%235650f0' stroke-width='1.2'/%3E%3Cpath d='M0 150 Q175 50 350 150 T700 150' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3Cpath d='M0 350 Q175 250 350 350 T700 350' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: "700px 500px",
          }}
        />
        <div className="absolute left-0 top-0 h-full w-[380px] bg-gradient-to-r from-orange-50/70 to-transparent z-0 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid lg:grid-cols-[350px_minmax(0,1fr)] gap-6 lg:gap-8 items-center">
            {/* LEFT: Author Info Panel */}
            <div className="flex flex-col justify-center relative">
              {/* Heading */}
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#ea580c] shadow-sm">
                <Award size={13} />
                Featured creator
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 leading-tight mb-3">
                Top Featured <span className="text-[#ea580c]">Author</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
                Mỗi tháng chúng tôi chọn ra những nhà phát triển xuất sắc nhất
                với mẫu demo chất lượng cao và hỗ trợ khách hàng tích cực nhất.
              </p>

              {/* Author card */}
              <div className="relative mb-5 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-lg shadow-orange-100/45">
                <div className="relative h-24 overflow-hidden bg-orange-50">
	                  <img
	                    src={displayAuthorProducts[0]?.image || fallbackImages[0]}
	                    alt={topAuthorName}
	                    className="h-full w-full object-cover opacity-85"
	                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        fallbackImages[0];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                    Tác giả nổi bật
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar circle */}
                  <div
                    className="-mt-10 w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #ffedd5, #fed7aa)",
                    }}
                  >
	                    <img
                      src={
                        displayAuthorProducts[1]?.image ||
                        displayAuthorProducts[0]?.image ||
                        fallbackImages[1]
                      }
	                      alt={topAuthorName}
	                      className="w-full h-full object-cover"
	                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                        (
                          e.currentTarget as HTMLImageElement
                        ).parentElement!.innerHTML =
                          `<span style="font-size:1.5rem;font-weight:800;color:#ea580c">${(topAuthorName || "A")[0]}</span>`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 mb-0.5">
                      {topAuthorName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Thành viên từ năm 2021
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50/55">
                  {[
                    {
                      value: displayAuthorProducts.length || 5,
                      label: "Mẫu demo",
                    },
                    { value: "4.9", label: "Rating" },
                    { value: "98%", label: "Hỗ trợ" },
                  ].map((item) => (
                    <div key={item.label} className="px-3 py-3 text-center">
                      <div className="text-sm font-extrabold text-slate-950 leading-none">
                        {item.value}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-orange-300 hover:scale-105 select-none"
                  style={{
                    background: "linear-gradient(90deg, #ea580c, #ea580c)",
                  }}
                >
                  Xem hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={() => alert("Đã theo dõi!")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-300 hover:border-[#ea580c] bg-white hover:bg-[#ea580c]/5 text-slate-600 hover:text-[#ea580c] font-semibold text-sm transition-all duration-200 select-none shadow-sm"
                >
                  Theo dõi
                </button>
              </div>

              {/* Slider Control Buttons */}
              <div className="hidden lg:flex items-center gap-2 mt-6">
                <button
                  onClick={scrollAuthorLeft}
                  className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#ea580c] hover:bg-[#ea580c] hover:text-white flex items-center justify-center text-slate-600 transition-all duration-200 shadow-sm"
                  aria-label="Slide Left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={scrollAuthorRight}
                  className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#ea580c] hover:bg-[#ea580c] hover:text-white flex items-center justify-center text-slate-600 transition-all duration-200 shadow-sm"
                  aria-label="Slide Right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Rotating badge - positioned at right edge of left panel, overlapping the grid */}
              <div className="hidden">
                <svg
                  className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]"
                  viewBox="0 0 128 128"
                >
                  <defs>
                    <path
                      id="authorCirclePath"
                      d="M64,64 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"
                    />
                  </defs>
                  <text
                    fill="#f97316"
                    fontSize="8.5"
                    fontWeight="600"
                    letterSpacing="3"
                    fontFamily="sans-serif"
                    opacity="0.7"
                  >
                    <textPath href="#authorCirclePath">
                      DP MARKET ? TOP FEATURED AUTHOR ? DP MARKET ?
                    </textPath>
                  </text>
                </svg>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 border-white z-10"
                  style={{
                    background: "linear-gradient(135deg, #ea580c, #f97316)",
                  }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Card Slider */}
            <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/60 p-3 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ea580c]">
                    Bộ sưu tập tác giả
                  </p>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Mẫu demo nổi bật trong tháng
                  </h3>
                </div>
                <span className="hidden sm:inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-[#ea580c] ring-1 ring-orange-100">
                  Đã kiểm duyệt
                </span>
              </div>
              {/* Slider list */}
              <div
                ref={authorSliderRef}
                className="grid grid-cols-1 gap-3 pb-1 lg:flex lg:gap-4 lg:overflow-x-auto lg:no-scrollbar lg:snap-x lg:scroll-smooth"
              >
                {displayAuthorProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="w-full lg:min-w-[330px] lg:w-[330px] lg:flex-shrink-0 lg:snap-start"
                  >
                    <DpMarketProductCard
                      product={product}
                      index={idx}
                      variant="mobileHorizontal"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === COMPACT PROMO BANNERS === */}
      <section className="hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.9) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {[
            {
              eyebrow: "Theme cao cấp",
              title: "Kho giao diện sẵn sàng triển khai",
              desc: "Landing page, dashboard và website mẫu có demo rõ ràng cho từng nhu cầu.",
              cta: "Khám phá theme",
              href: "/products?category=themes",
              image: displayFeaturedProducts[0]?.image || fallbackImages[1],
              icon: Layout,
            },
            {
              eyebrow: "UI Kit & Plugin",
              title: "Bộ công cụ số cho dự án nhanh hơn",
              desc: "Tài nguyên chọn lọc, dễ tùy biến và phù hợp workflow thiết kế website hiện đại.",
              cta: "Xem bộ sưu tập",
              href: "/products?category=ui-kits",
              image: displayFeaturedProducts[1]?.image || fallbackImages[0],
              icon: Layers,
            },
          ].map((banner) => (
            <Link
              key={banner.title}
              href={banner.href}
              className="group relative min-h-[190px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg shadow-slate-200/70"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImages[0];
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/68 to-slate-950/12" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.28),transparent_34%)]" />
              <div className="relative z-10 flex h-full max-w-[430px] flex-col justify-center p-5 sm:p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#ea580c] shadow-lg shadow-black/20">
                  <banner.icon size={20} strokeWidth={2.5} />
                </span>
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-orange-200">
                  {banner.eyebrow}
                </p>
                <h3 className="text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  {banner.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/78">
                  {banner.desc}
                </p>
                <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#ea580c] px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-orange-950/20 transition-transform duration-200 group-hover:translate-x-1">
                  {banner.cta} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

              {/* === PERFORMANCE STATS SECTION - Blob Pastel Style === */}
      <section className="relative overflow-hidden py-0">
        {/* Light background with subtle topographic lines */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, #fff7ed 50%, #ffffff 100%)",
          }}
        />
        {/* Subtle wavy/topographic lines overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cpath d='M0 300 Q150 200 300 300 T600 300' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3Cpath d='M0 250 Q150 150 300 250 T600 250' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3Cpath d='M0 350 Q150 250 300 350 T600 350' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3Cpath d='M0 200 Q150 100 300 200 T600 200' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3Cpath d='M0 400 Q150 300 300 400 T600 400' fill='none' stroke='%235650f0' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: "600px 600px",
          }}
        />

        <div className="relative w-full z-10">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_460px] items-stretch min-h-[390px] overflow-hidden">
            {/* LEFT: 2x2 Blob Grid */}
            <div className="relative grid grid-cols-2 grid-rows-2 min-h-[540px] sm:min-h-[500px] lg:min-h-[390px]">
                {/* Blob 1 - Yellow-Green (top-left) */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden group">
                <div
                  className="absolute inset-0 rounded-br-[80px] md:rounded-br-[120px] transition-transform duration-500 group-hover:scale-105 origin-top-left"
                  style={{
                    background:
                      "linear-gradient(135deg, #fef9c3 0%, #d9f99d 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-[0.16]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(15,23,42,.22) 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <span className="relative z-10 ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/55 text-lime-700 shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <Mail size={18} strokeWidth={2.4} />
                </span>
                <div className="relative z-10">
                  <p className="text-slate-500 text-xs font-medium mb-2">
                    Email đăng ký
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-none">
                    49,000+
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-white/60">
                      +18% tháng này
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Lead mới
                    </span>
                  </div>
                </div>
              </div>

                {/* Blob 2 - Lavender (top-right) */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden group">
                <div
                  className="absolute inset-0 rounded-bl-[80px] md:rounded-bl-[120px] transition-transform duration-500 group-hover:scale-105 origin-top-right"
                  style={{
                    background:
                      "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                  }}
                />
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                <span className="relative z-10 ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/55 text-indigo-700 shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <Package size={18} strokeWidth={2.4} />
                </span>
                <div className="relative z-10">
                  <p className="text-slate-500 text-xs font-medium mb-2">
                    Tổng mẫu demo
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-none">
                    45,000+
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-white/60">
                      320+ danh mục
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Kho số
                    </span>
                  </div>
                </div>
              </div>

                {/* Blob 3 - Pink/Rose (bottom-left) */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden group">
                <div
                  className="absolute inset-0 rounded-tr-[80px] md:rounded-tr-[120px] transition-transform duration-500 group-hover:scale-105 origin-bottom-left"
                  style={{
                    background:
                      "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
                  }}
                />
                <div className="absolute inset-x-6 bottom-7 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/55 text-pink-700 shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <MessageCircle size={18} strokeWidth={2.4} />
                </span>
                <div className="relative z-10">
                  <p className="text-slate-500 text-xs font-medium mb-2">
                      Luot xem demo
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-none">
                    98,000+
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-white/60">
                      2.4K hôm nay
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Tu van nhanh
                    </span>
                  </div>
                </div>
              </div>

                {/* Blob 4 - Teal/Cyan (bottom-right) */}
              <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-hidden group">
                <div
                  className="absolute inset-0 rounded-tl-[80px] md:rounded-tl-[120px] transition-transform duration-500 group-hover:scale-105 origin-bottom-right"
                  style={{
                    background:
                      "linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)",
                  }}
                />
                <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/55 text-cyan-700 shadow-sm ring-1 ring-white/60 backdrop-blur">
                  <TrendingUp size={18} strokeWidth={2.4} />
                </span>
                <div className="relative z-10">
                  <p className="text-slate-500 text-xs font-medium mb-2">
                    Truy cập / tháng
                  </p>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-none">
                    65,000+
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/55 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-white/60">
                      99.9% ổn định
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Traffic
                    </span>
                  </div>
                </div>
              </div>

                {/* Center Rotating Badge - positioned absolutely at the intersection */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-28 h-28 md:w-32 md:h-32 pointer-events-none select-none">
                {/* Rotating text ring */}
                <svg
                  className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite]"
                  viewBox="0 0 128 128"
                >
                  <defs>
                    <path
                      id="statsCirclePath"
                      d="M64,64 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"
                    />
                  </defs>
                  <text
                    className="fill-slate-400"
                    fontSize="9.5"
                    fontWeight="600"
                    letterSpacing="2.5"
                    fontFamily="sans-serif"
                  >
                    <textPath href="#statsCirclePath">
                      OUR TOP PERFORMANCE STATS ? OUR TOP PERFORMANCE
                    </textPath>
                  </text>
                </svg>
                {/* Center icon */}
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10"
                  style={{
                    background: "linear-gradient(135deg, #ea580c, #f97316)",
                  }}
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* RIGHT: Text + CTA */}
            <div className="relative flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-10 lg:py-10 overflow-hidden bg-white lg:border-l lg:border-slate-100">
              <span className="text-[#c2410c] text-xs font-semibold uppercase tracking-widest mb-3 block">
                Hiệu suất vượt trội
              </span>

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 leading-snug mb-4">
                Hiệu suất ấn tượng{" "}
                <span className="text-[#ea580c]">chứng minh độ tin cậy</span>
              </h2>

              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Hệ thống phục vụ hàng chục ngàn lượt tải và đăng ký mỗi tháng từ
                các lập trình viên trên toàn cầu. Đảm bảo tốc độ và trải nghiệm
                mượt mà.
              </p>

              <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Hệ thống ổn định</span>
                  <span className="text-[#c2410c]">99.9%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#ea580c] to-amber-400" />
                </div>
              </div>

              <div className="space-y-2.5 mb-7">
                {[
                  "Cập nhật tài nguyên liên tục mỗi ngày",
                  "Bảo mật đa lớp chuẩn quốc tế",
                  "Hỗ trợ kỹ thuật 24/7 miễn phí",
                ].map((feat) => (
                  <div
                    key={feat}
                    className="flex items-center gap-2.5 px-0 py-1.5"
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[#ea580c]/10">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-slate-600 text-xs font-medium">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-orange-300 hover:scale-105 select-none"
                style={{
                  background: "linear-gradient(90deg, #ea580c, #ea580c)",
                }}
              >
                Bắt đầu ngay hôm nay
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-7 md:py-12 overflow-hidden border-t border-slate-100">
        {/* Fresh green-to-white gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff7ed] to-white z-0" />
        <div
          className="absolute inset-0 z-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.7) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-amber-200/30 to-transparent blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-orange-200/24 to-transparent blur-[110px] pointer-events-none z-0" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 md:mb-7">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[#ea580c] text-xs font-bold uppercase tracking-widest mb-3">
                <span className="h-2 w-2 rounded-full bg-[#ea580c]" />
                TIN TỨC & BÀI VIẾT
              </span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-slate-950 max-w-xl leading-snug md:leading-tight">
                Đọc các bài viết và tin tức công nghệ mới nhất
              </h2>
              <p className="mt-3 max-w-xl text-sm md:text-base text-slate-500 leading-relaxed">
                Cập nhật xu hướng lập trình, UI/UX và kinh doanh giao diện website với
                các bài viết được chọn lọc.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/85 border border-orange-100 hover:border-[#ea580c] hover:bg-[#ea580c] text-[#ea580c] hover:text-white font-bold text-xs transition-all duration-200 shadow-sm shadow-orange-100/70 select-none"
            >
              Xem tất cả bài viết <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 pb-4 md:pb-0">
            {displayBlogs.map((blog, idx) => {
              const formattedDate = new Date(
                blog.published_at || blog.created_at,
              ).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div key={blog.id} className="w-full text-slate-800">
                  <article className="group flex flex-col bg-white/95 border border-slate-200/70 rounded-2xl md:rounded-[24px] overflow-hidden shadow-sm shadow-slate-200/70 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 h-full">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <Link
                        href={`/blog/${blog.slug || blog.id}`}
                        className="relative block w-full h-full"
                      >
                        <Image
                          src={
                            blog.cover_image ||
                            fallbackImages[idx % fallbackImages.length]
                          }
                          alt={blog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-45" />
                      </Link>
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#ea580c] shadow-sm backdrop-blur md:left-4 md:top-4 md:px-3">
                        {blog.category || "Học Tập"}
                      </span>
                      <span className="absolute right-2 top-2 md:right-4 md:top-4 flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-white/90 text-[10px] md:text-xs font-extrabold text-slate-700 shadow-sm backdrop-blur">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="p-3 md:p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between gap-2 mb-2 md:mb-3 text-[10px] md:text-[11px] text-slate-500 font-semibold select-none">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-[#ea580c]" />
                          <span>{formattedDate}</span>
                        </div>
                        <span className="hidden md:inline rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                          4 phút đọc
                        </span>
                      </div>

                      <Link
                        href={`/blog/${blog.slug || blog.id}`}
                        className="block mb-2"
                      >
                        <h3 className="text-xs md:text-[17px] font-extrabold text-slate-950 line-clamp-2 group-hover:text-[#ea580c] transition-colors leading-snug min-h-[32px] md:min-h-[44px]">
                          {blog.title}
                        </h3>
                      </Link>

                      <p className="hidden md:block text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {blog.excerpt ||
                          "Đọc bài viết chi tiết để hiểu rõ hơn về các kiến thức công nghệ hữu ích."}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 md:pt-4">
                        <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Web Giá Rẻ - Portfolio
                        </span>
                        <Link
                          href={`/blog/${blog.slug || blog.id}`}
                          className="inline-flex h-8 md:h-10 w-full md:w-auto items-center justify-center gap-1.5 md:gap-2 rounded-full border border-slate-200 bg-white px-3 md:px-4 text-[10px] md:text-xs font-bold text-slate-700 transition-all duration-200 hover:border-[#ea580c] hover:bg-[#ea580c] hover:text-white select-none"
                        >
                          Đọc tiếp <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === AFFILIATE & SUPPORT SECTION === */}
      <section className="relative pt-4 md:pt-6 pb-8 md:pb-12 overflow-hidden bg-gradient-to-b from-white via-[#f8fafc] to-white">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.5) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-slate-200/30 blur-[110px]" />
        <div className="absolute left-0 bottom-0 h-[360px] w-[360px] rounded-full bg-pink-100/35 blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 z-10">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-5 md:mb-6">
            {/* Card 1: Affiliate */}
            <div className="relative overflow-hidden p-8 md:p-12 lg:p-14 rounded-3xl shadow-sm z-10 bg-[#F3EBFF] min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <img
                  src="/dpmarket-assets/images/shapes/affiliate-bg.png"
                  alt="Bg shape"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0b0f19] mb-4 leading-tight tracking-tight">
                  {isCatalogMode ? 'Giới thiệu khách cần giao diện website' : 'Giới thiệu khách cần tư vấn template'}
                </h3>
                <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed mb-6 md:mb-8 max-w-xl">
                  {isCatalogMode
                    ? 'Tham gia kênh đối tác giới thiệu của Web Giá Rẻ - Portfolio, chia sẻ link demo và ghi nhận khi khách để lại nhu cầu tư vấn giao diện website, landing page hoặc dự án web.'
                    : 'Tham gia kênh đối tác giới thiệu của Web Giá Rẻ - Portfolio, chia sẻ link demo và ghi nhận khi khách để lại nhu cầu tư vấn giao diện website, landing page hoặc dự án web.'}
                </p>
              </div>
              <Link
                href="/affiliate"
                className="self-start inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3.5 rounded-full border-2 border-[#0b0f19] text-[#0b0f19] hover:bg-[#0b0f19] hover:text-white font-semibold text-sm transition-all duration-300 select-none bg-transparent"
              >
                Trở thành đối tác
              </Link>
            </div>

            {/* Card 2: Custom Service */}
            <div className="relative overflow-hidden p-8 md:p-12 lg:p-14 rounded-3xl shadow-sm z-10 bg-[#FFCBE7] min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <img
                  src="/dpmarket-assets/images/shapes/service-bg.png"
                  alt="Bg shape"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#0b0f19] mb-4 leading-tight tracking-tight">
                  Cần chỉnh sửa giao diện theo thương hiệu?
                </h3>
                <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed mb-6 md:mb-8 max-w-xl">
                  {isCatalogMode
                    ? 'Bạn có thể gửi mẫu giao diện quan tâm rồi yêu cầu tư vấn thay logo, đổi màu, sửa nội dung, gắn form hoặc deploy lên hosting theo nhu cầu thực tế.'
                    : 'Bạn có thể chọn mẫu template quan tâm rồi yêu cầu hỗ trợ thay logo, đổi màu, sửa nội dung, gắn form hoặc deploy lên hosting theo nhu cầu thực tế.'}
                </p>
              </div>
              <Link
                href="/contact"
                className="self-start inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3.5 rounded-full border-2 border-[#0b0f19] text-[#0b0f19] hover:bg-[#0b0f19] hover:text-white font-semibold text-sm transition-all duration-300 select-none bg-transparent"
              >
                Liên hệ tùy chỉnh
              </Link>
            </div>
          </div>

          {/* Support Banner - Pastel Pink with photo */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#fff7ed] via-[#ffeaf1] to-[#fff1d6] p-6 md:p-8 lg:p-10 overflow-hidden min-h-[270px] flex items-center shadow-sm border border-white/70">
            {/* Background shape net */}
            <img
              src="/dpmarket-assets/images/shapes/spider-net-sm.png"
              alt=""
              className="absolute top-0 right-0 h-full w-auto object-contain pointer-events-none opacity-80 z-0"
              loading="lazy"
            />
            {/* Arrow/plane path curve */}
            <img
              src="/dpmarket-assets/images/shapes/arrow-shape.png"
              alt=""
              className="absolute left-[35%] top-[30%] max-w-[20%] pointer-events-none hidden lg:block z-0"
              loading="lazy"
            />
            {/* Background blur circle */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "608px",
                height: "608px",
                backgroundColor: "rgba(255, 80, 143, 0.25)",
                filter: "blur(75px)",
                top: "88%",
                left: "0",
                transform: "rotate(41deg)",
              }}
            />

            <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
              <div className="hidden md:flex md:col-span-4 lg:col-span-5 relative min-h-[210px] items-center justify-center">
                <div className="absolute h-52 w-52 rounded-full bg-white/45 blur-2xl" />
                <div className="relative h-[250px] w-[260px] lg:h-[290px] lg:w-[300px]">
                  <Image
                    src="/support-agent.webp"
                    alt="Nhân viên tư vấn Web Giá Rẻ - Portfolio"
                    fill
                    sizes="(min-width: 1024px) 300px, 260px"
                    className="object-contain drop-shadow-[0_24px_32px_rgba(15,23,42,0.16)]"
                  />
                </div>
                <div className="absolute left-1 top-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-white/80">
                  Phản hồi nhanh
                </div>
                <div className="absolute bottom-4 right-8 rounded-full bg-[#0b0f19] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-950/15">
                  24/7 online
                </div>
                <div className="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#ea580c] text-white shadow-lg shadow-orange-300/50">
                  <Mail size={17} strokeWidth={2.5} />
                </div>
              </div>

              {/* Content */}
              <div className="col-span-1 md:col-span-8 lg:col-span-7 text-center md:text-left flex flex-col items-center md:items-start">
                <h3 className="text-2xl md:text-3.5xl font-black text-[#0b0f19] mb-2 leading-tight">
                  Hỗ trợ khách hàng 24/7
                </h3>
                <p className="text-slate-700 text-sm md:text-base font-semibold mb-6">
                  Bạn có bất kỳ câu hỏi nào cần giải đáp? Hãy gửi tin nhắn cho
                  chúng tôi bất cứ lúc nào.
                </p>
                <Link
                  href="mailto:support@shopwebre.vn"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#0b0f19] text-white hover:bg-transparent border-2 border-[#0b0f19] hover:text-[#0b0f19] font-semibold text-sm transition-all duration-300 shadow-md shadow-slate-950/15"
                >
                  support@shopwebre.vn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoped CSS animations */}
      <style jsx>{`
        @keyframes rotateText {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .bestseller-drag-scroll {
          cursor: grab;
          scroll-behavior: auto;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
        }
        .bestseller-drag-scroll.is-dragging {
          cursor: grabbing;
          user-select: none;
          scroll-snap-type: none;
        }
        .bestseller-marquee-card {
          contain: layout paint;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* Slim custom scrollbar for best sellers dark section */
        .bestsellers-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .bestsellers-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .bestsellers-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #ea580c, #0ae0ef);
          border-radius: 10px;
        }
        .bestsellers-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #c2410c, #06b6d4);
        }
        .bestsellers-scroll {
          scrollbar-width: thin;
          scrollbar-color: #ea580c rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </main>
  );
};

export default memo(HomePage);
