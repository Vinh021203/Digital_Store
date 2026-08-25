"use client";

import React, { useState, useCallback, memo } from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Send,
  Heart,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Shield,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteMode } from "@/hooks/useSiteSettings";

// ============================================
// TikTok Icon Component
// ============================================
const TikTokIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.88 2.897 2.897 0 0 1-2.897-2.896 2.897 2.897 0 0 1 2.897-2.897c.334 0 .653.06.949.167V9.453a6.31 6.31 0 0 0-.949-.072 6.34 6.34 0 0 0-6.335 6.336 6.34 6.34 0 0 0 6.335 6.336 6.34 6.34 0 0 0 6.336-6.336V8.57a8.214 8.214 0 0 0 4.78 1.547V6.671a4.786 4.786 0 0 1-1.000.015z" />
  </svg>
);

// ============================================
// Social Link - Memoized with authentic brand colors
// ============================================
interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  bgClass: string;
  label: string;
}

const SocialLink = memo<SocialLinkProps>(({ href, icon, bgClass, label }) => (
  <a
    href={href}
    className={`group relative h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${bgClass}`}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span className="relative z-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
      {icon}
    </span>
  </a>
));
SocialLink.displayName = "SocialLink";

// ============================================
// Footer Link - Memoized
// ============================================
interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  color?: string;
}

const FooterLink = memo<FooterLinkProps>(
  ({ href, children, color = "orange" }) => (
    <li>
      <Link
        href={href}
        className={`group flex items-center gap-2 text-slate-400 hover:text-${color}-400 transition-all duration-200 py-0.5`}
        prefetch={true}
      >
        <ChevronRight
          size={12}
          className={`text-${color}-600/50 group-hover:text-${color}-400 group-hover:translate-x-0.5 transition-all flex-shrink-0`}
        />
        <span className="group-hover:translate-x-0.5 transition-transform duration-200 text-sm">
          {children}
        </span>
      </Link>
    </li>
  ),
);
FooterLink.displayName = "FooterLink";

// ============================================
// Category Link - Logo icon thật từ devicon CDN
// ============================================
interface CategoryLinkProps {
  href: string;
  logo: string; // URL ảnh logo
  logoAlt: string;
  children: React.ReactNode;
}

const CategoryLink = memo<CategoryLinkProps>(
  ({ href, logo, logoAlt, children }) => (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2.5 text-slate-400 hover:text-orange-400 transition-all duration-200 py-0.5"
        prefetch={true}
      >
        <span className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <img
            src={logo}
            alt={logoAlt}
            width={16}
            height={16}
            className="object-contain w-4 h-4"
            loading="lazy"
          />
        </span>
        <span className="group-hover:translate-x-0.5 transition-transform duration-200 text-sm">
          {children}
        </span>
      </Link>
    </li>
  ),
);
CategoryLink.displayName = "CategoryLink";

// ============================================
// Affiliate Link - Memoized
// ============================================
const AffiliateLink = memo(() => (
  <li>
    <Link
      href="/affiliate"
      className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200 py-0.5"
      prefetch={true}
    >
      <Sparkles
        size={12}
        className="text-amber-500 animate-pulse flex-shrink-0"
      />
      <span className="group-hover:translate-x-0.5 transition-transform duration-200 text-sm">
        Trở thành Đối Tác
      </span>
    </Link>
  </li>
));
AffiliateLink.displayName = "AffiliateLink";

// ============================================
// Mobile Accordion Section
// ============================================
interface AccordionSectionProps {
  title: string;
  titleGradient: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionSection = memo<AccordionSectionProps>(
  ({ title, titleGradient, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-slate-800/60 lg:border-none">
        {/* Header — chỉ clickable trên mobile */}
        <button
          className="lg:hidden w-full flex items-center justify-between py-3.5 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span
            className={`text-sm font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
          >
            {title}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Desktop: luôn hiện */}
        <div className="hidden lg:block">
          <h4
            className={`text-base font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent mb-1.5`}
          >
            {title}
          </h4>
          <div
            className="w-8 h-0.5 mb-5 rounded-full"
            style={{ background: "linear-gradient(90deg, #f97316, #ef4444)" }}
          />
          <ul className="space-y-2.5">{children}</ul>
        </div>

        {/* Mobile: collapse/expand */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 pb-4" : "max-h-0"}`}
        >
          <ul className="space-y-1">{children}</ul>
        </div>
      </div>
    );
  },
);
AccordionSection.displayName = "AccordionSection";

// ============================================
// Newsletter Form
// ============================================
const NewsletterForm = memo(() => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (email) {
        setIsSubscribed(true);
        setTimeout(() => {
          setIsSubscribed(false);
          setEmail("");
        }, 3000);
      }
    },
    [email],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );

  return (
    <form onSubmit={handleSubscribe} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={handleEmailChange}
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800/50 px-3 text-sm text-white transition-all duration-300 placeholder:text-slate-500 focus:border-orange-500 focus:bg-slate-800 focus:outline-none"
          required
          maxLength={100}
        />
        <button
          type="submit"
          className="flex h-10 flex-shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          }}
        >
          Đăng ký <Send size={13} strokeWidth={2.4} />
        </button>
      </div>

      {isSubscribed && (
        <div className="flex items-center gap-2 text-xs text-orange-400 animate-fade-in">
          <Sparkles size={12} className="animate-pulse" />
          <span className="font-medium">Đã đăng ký thành công!</span>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] leading-tight text-slate-300">
        <Shield size={11} className="flex-shrink-0 text-slate-400" strokeWidth={2.2} />
        <span>Bảo mật thông tin của bạn.</span>
      </p>
    </form>
  );
});
NewsletterForm.displayName = "NewsletterForm";

// ============================================
// Payment Badge
// ============================================
const PaymentBadge = memo<{ children: React.ReactNode; className?: string }>(
  ({ children, className = "" }) => (
    <div
      className={`flex items-center justify-center px-2 py-2 rounded-lg ${className}`}
      style={{
        background: "#1e293b",
        border: "1px solid #475569",
      }}
    >
      {children}
    </div>
  ),
);
PaymentBadge.displayName = "PaymentBadge";

// ============================================
// Danh mục data — logo thật từ devicon CDN
// ============================================
const CATEGORY_ITEMS = [
  {
    href: "/products?category=themes",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
    label: "Themes & UI Kits",
  },
  {
    href: "/products?category=landing",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
    label: "Landing Pages",
  },
  {
    href: "/products?category=templates",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
    label: "Templates",
  },
  {
    href: "/products?category=miniapps",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
    label: "Mini Apps & Tools",
  },
  {
    href: "/products?search=React",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
    label: "React Templates",
  },
  {
    href: "/products?search=Vue",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
    label: "Vue.js Templates",
  },
  {
    href: "/products?category=marketing",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg",
    label: "Marketing & SEO",
  },
  {
    href: "/products?tech=n8n",
    logo: "/icons/n8n.svg",
    label: "n8n Automation",
  },
] as const;

// ============================================
// Main Footer
// ============================================
const Footer = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isCatalogMode } = useSiteMode();
  const showBrandSlider = pathname === "/";

  const socialLinks = React.useMemo(
    () => [
      {
        href: "https://www.facebook.com/Ltvinh212",
        icon: <Facebook size={18} />,
        bgClass: "bg-[#1877F2] text-white shadow-md shadow-blue-600/30 hover:bg-[#166fe5]",
        label: "Facebook",
      },
      {
        href: "https://www.instagram.com/luongvinh_0212?igsh=MWxtM2RlNm16ZjM2MA==",
        icon: <Instagram size={18} />,
        bgClass: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] text-white shadow-md shadow-pink-600/30 hover:brightness-110",
        label: "Instagram",
      },
      {
        href: "https://www.tiktok.com",
        icon: <TikTokIcon size={17} />,
        bgClass: "bg-[#111111] text-white shadow-md shadow-black/40 hover:bg-[#222222]",
        label: "TikTok",
      },
      {
        href: "https://www.youtube.com/@VINHDEV_0212",
        icon: <Youtube size={18} />,
        bgClass: "bg-[#FF0000] text-white shadow-md shadow-red-600/30 hover:bg-[#e60000]",
        label: "YouTube",
      },
      {
        href: "https://www.linkedin.com/in/vinh-l%C6%B0%C6%A1ng-th%E1%BA%BF-69640734b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
        icon: <Linkedin size={18} />,
        bgClass: "bg-[#0A66C2] text-white shadow-md shadow-blue-700/30 hover:bg-[#08539e]",
        label: "LinkedIn",
      },
    ],
    [],
  );

  const brands = React.useMemo(
    () => [
      {
        name: "Angular",
        color: "#dd0031",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg",
      },
      {
        name: "React",
        color: "#61dafb",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      },
      {
        name: "Next.js",
        color: "#000",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
      },
      {
        name: "Vue.js",
        color: "#42b883",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg",
      },
      {
        name: "Laravel",
        color: "#ff2d20",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg",
      },
      {
        name: "Figma",
        color: "#f24e1e",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
      },
      {
        name: "Tailwind",
        color: "#38bdf8",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
      },
      {
        name: "Bootstrap",
        color: "#7952b3",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg",
      },
      {
        name: "TypeScript",
        color: "#3178c6",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
      },
      {
        name: "Node.js",
        color: "#339933",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
      },
    ],
    [],
  );

  const marqueeBrands = React.useMemo(() => [...brands, ...brands], [brands]);

  return (
    <>
      {/* ── Brand Slider (home only) ── */}
      {showBrandSlider && (
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-white via-[#fffaf5] to-white pt-3 md:pt-5 pb-3 md:pb-4">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.7) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <p className="brand-title-glow mx-auto max-w-[300px] md:max-w-none text-center text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-[0.12em] md:tracking-[0.14em] leading-relaxed mb-2 md:mb-3">
              Được tin dùng bởi các thương hiệu & công nghệ hàng đầu
            </p>
            <div className="brand-shelf relative w-full overflow-hidden rounded-[22px] md:rounded-[28px] border border-white/80 bg-white/95 px-3 md:px-4 py-2.5 md:py-3 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ring-1 ring-slate-100/70 backdrop-blur">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
              <div className="pointer-events-none absolute -bottom-12 left-1/2 h-24 w-56 -translate-x-1/2 rounded-full bg-orange-100/50 blur-3xl" />
              <div className="absolute left-0 top-0 w-14 md:w-28 h-full bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
              <div className="absolute right-0 top-0 w-14 md:w-28 h-full bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
              <div
                className="relative z-10 flex gap-8 md:gap-16 brand-marquee select-none py-1 md:py-2"
                style={{ width: "max-content" }}
              >
                {marqueeBrands.map((brand, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 md:gap-3 opacity-85 hover:opacity-100 transition-all duration-300 flex-shrink-0"
                  >
                    <div
                      className="brand-logo-card w-12 h-12 md:w-[72px] md:h-[72px] rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100/90"
                      style={{ color: brand.color }}
                    >
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="brand-logo-img h-7 w-7 md:h-9 md:w-9 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] md:text-xs font-extrabold text-slate-500 whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER CHÍNH ── */}
      <footer id="site-footer" className="relative mt-0 overflow-visible bg-slate-950 pb-2 md:mt-0 md:pb-0">
        {/* Wave */}
        <svg
          className="absolute left-0 right-0 -top-5 md:-top-8 h-5 md:h-8 w-full pointer-events-none"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 H1440 V38 C1220 38 1040 62 720 62 C400 62 220 38 0 38 Z"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
        <div className="absolute inset-x-0 -top-10 h-24 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

        {/* Sparkle dots */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {[
            { top: "10%", left: "8%", size: 2, opacity: 0.55 },
            { top: "22%", left: "18%", size: 1.5, opacity: 0.35 },
            { top: "6%", left: "42%", size: 2, opacity: 0.5 },
            { top: "35%", left: "58%", size: 1.5, opacity: 0.3 },
            { top: "15%", left: "74%", size: 2.5, opacity: 0.5 },
            { top: "45%", left: "85%", size: 1.5, opacity: 0.4 },
            { top: "60%", left: "92%", size: 2, opacity: 0.45 },
            { top: "70%", left: "4%", size: 1.5, opacity: 0.3 },
            { top: "75%", left: "32%", size: 2, opacity: 0.35 },
            { top: "18%", left: "93%", size: 3, opacity: 0.25 },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-orange-400"
              style={{
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                opacity: dot.opacity,
                boxShadow: `0 0 ${dot.size * 3}px rgba(251,146,60,0.8)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-6">
          {/* ── LAYOUT CHÍNH ── */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8 lg:mb-12">
            {/* ── CỘT 1: Brand + Contact + Social ── */}
            <div className="mb-8 lg:mb-0 space-y-5 lg:space-y-6">
              <div className="group relative h-14 w-[230px] mx-auto mb-5 lg:mb-0 lg:mx-0">
                <Image
                  src="/logo_webgiare_footer.webp"
                  alt="Web Giá Rẻ - Portfolio"
                  fill
                  sizes="230px"
                  className="object-contain object-center lg:object-left transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              <p className="hidden lg:block text-sm leading-relaxed text-slate-200">
                Web Giá Rẻ là thư viện tài nguyên số, starter kits và mẫu giao diện được chọn lọc
                cho sinh viên, freelancer, developer và doanh nghiệp tại Việt Nam.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="text-xs lg:text-sm truncate">
                    0971 386 588
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 lg:col-span-1">
                  <Mail size={14} className="text-orange-500 flex-shrink-0" />
                  <a
                    href="mailto:contact@webgiare.id.vn"
                    className="text-xs lg:text-sm truncate hover:text-orange-400 transition-colors"
                  >
                    contact@webgiare.id.vn
                  </a>
                </div>
                <div className="flex items-start gap-2 col-span-2 lg:col-span-1">
                  <MapPin
                    size={14}
                    className="text-orange-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs lg:text-sm">
                    Hạ Long, Quảng Ninh, Việt Nam
                  </span>
                </div>
              </div>

              <div className="flex justify-center lg:justify-start gap-2.5 pt-3 lg:pt-0">
                {socialLinks.map((s) => (
                  <SocialLink key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* ── CỘT 2 + 3: Accordion mobile / Desktop bình thường ── */}
            <div className="lg:contents">
              {/* Khám Phá */}
              <AccordionSection
                title="Khám Phá"
                titleGradient="from-orange-400 to-red-400"
              >
                <FooterLink href="/about">Về Chúng Tôi</FooterLink>
                <FooterLink href="/products">Starter Kits & Mẫu Demo</FooterLink>
                <FooterLink href="/products?category=templates">Combo Tài Nguyên</FooterLink>
                <FooterLink href="/blog">Blog</FooterLink>
                <FooterLink href="/community">Cộng Đồng</FooterLink>
                <AffiliateLink />
                <FooterLink href="/tracking">Tra Cứu Yêu Cầu</FooterLink>
                <FooterLink href="/policy/terms">
                  Chính Sách & Điều Khoản
                </FooterLink>
                <FooterLink href="/faq">
                  Hướng Dẫn & FAQ
                </FooterLink>
              </AccordionSection>

              {/* ── Danh Mục — logo thật ── */}
              <AccordionSection
                title="Danh Mục Demo"
                titleGradient="from-red-400 to-amber-400"
              >
                {CATEGORY_ITEMS.map((cat) => (
                  <CategoryLink
                    key={cat.href}
                    href={cat.href}
                    logo={cat.logo}
                    logoAlt={cat.label}
                  >
                    {cat.label}
                  </CategoryLink>
                ))}
              </AccordionSection>
            </div>

            {/* ── CỘT 4: Newsletter + Payment ── */}
            <div className="mt-4 lg:mt-0 space-y-4">
              {/* Newsletter Card */}
              <div
                className="rounded-2xl p-3.5 lg:p-4"
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                }}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
                    }}
                  >
                    <Mail size={15} className="text-white" strokeWidth={2.4} />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Nhận cập nhật
                  </h4>
                </div>
                <p className="mb-2.5 text-xs leading-relaxed text-slate-300">
                  Starter kits, combo tài nguyên và nội dung mới.
                </p>
                <NewsletterForm />
              </div>

              {isCatalogMode && (
                <div
                  className="rounded-2xl p-3.5 lg:p-4"
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen size={15} className="text-orange-400" strokeWidth={2.3} />
                    <h4 className="text-sm font-bold text-orange-200">
                      Đang ở chế độ catalog
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Xem demo và gửi yêu cầu tư vấn. License, báo giá và thanh toán được xác nhận riêng.
                  </p>
                  <div className="mt-3 flex gap-2 text-xs font-semibold">
                    <Link href="/policy/license" className="rounded-lg bg-slate-800 px-3 py-2 text-orange-200 transition-colors hover:bg-slate-700">
                      License
                    </Link>
                    <Link href="/contact" className="rounded-lg bg-orange-600 px-3 py-2 text-white transition-colors hover:bg-orange-500">
                      Tư vấn
                    </Link>
                  </div>
                </div>
              )}

              {/* Payment Card - only shown in sales mode */}
              {!isCatalogMode && <div
                className="rounded-2xl p-4"
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs lg:text-sm font-bold text-orange-200">
                    Thanh toán & Bảo mật
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-200">
                    <Shield size={9} />
                    <span>Giao dịch an toàn</span>
                  </div>
                </div>
                <div className="grid grid-cols-6 lg:grid-cols-3 gap-1.5 lg:gap-2">
                  <PaymentBadge>
                    <span className="font-black text-blue-200 text-[10px] lg:text-xs tracking-wide">
                      VISA
                    </span>
                  </PaymentBadge>
                  <PaymentBadge className="justify-center">
                    <div className="flex -space-x-1.5">
                      <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-red-500" />
                      <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-amber-400" />
                    </div>
                  </PaymentBadge>
                  <PaymentBadge>
                    <span className="font-black text-pink-200 text-[9px] lg:text-[11px] leading-none text-center">
                      MoMo
                    </span>
                  </PaymentBadge>
                  <PaymentBadge>
                    <span className="font-bold text-[9px] lg:text-[10px] whitespace-nowrap">
                      <span className="text-blue-200">Zalo</span>
                      <span className="text-emerald-200">Pay</span>
                    </span>
                  </PaymentBadge>
                  <PaymentBadge>
                    <span className="font-black text-blue-200 text-[9px] lg:text-[10px]">
                      PayPal
                    </span>
                  </PaymentBadge>
                  <PaymentBadge className="gap-1">
                    <Shield size={8} className="text-emerald-200 flex-shrink-0" />
                    <span className="font-bold text-emerald-200 text-[9px] lg:text-[10px]">
                      SSL
                    </span>
                  </PaymentBadge>
                </div>
              </div>}
            </div>
          </div>

          {/* ── BOTTOM BAR ── */}
          <div className="border-t border-slate-800/50 pt-3 pb-1 sm:pb-0 mt-2 lg:mt-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 text-xs text-slate-400">
              <p className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
                <span>&copy; {new Date().getFullYear()} Web Giá Rẻ - Portfolio.</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1">
                  Made with{" "}
                  <Heart
                    size={10}
                    className="text-rose-500 animate-pulse mx-0.5"
                  />{" "}
                  in Vietnam
                </span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="hidden sm:inline">All rights reserved.</span>
              </p>
              <nav className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-400" aria-label="Chính sách và thông tin pháp lý">
                {[
                  { href: "/policy/privacy", label: "Bảo mật" },
                  { href: "/policy/terms", label: "Điều khoản" },
                  { href: "/policy/refund", label: "Xử lý yêu cầu" },
                  { href: "/policy/license", label: "Chính sách license" },
                  { href: "/contact", label: "Liên hệ" },
                  { href: "/sitemap.xml", label: "Sitemap" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center hover:text-orange-300 transition-colors hover:underline py-0.5"
                    prefetch={true}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }

          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @keyframes brand-title-pulse {
            0%,
            100% {
              opacity: 0.72;
              text-shadow: 0 0 0 rgba(234, 88, 12, 0);
            }
            50% {
              opacity: 1;
              text-shadow: 0 0 18px rgba(234, 88, 12, 0.22);
            }
          }
          .brand-title-glow {
            animation: brand-title-pulse 2.8s ease-in-out infinite;
          }
          .brand-marquee {
            animation: marquee 25s linear infinite;
          }
          .brand-marquee:hover {
            animation-play-state: paused;
          }
          .brand-logo-card {
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }
          .brand-logo-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12);
          }
        `}</style>
      </footer>
    </>
  );
};

export default memo(Footer);
