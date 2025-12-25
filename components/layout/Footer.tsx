'use client';

import React, { useState, useCallback, memo } from 'react';
import {
  Facebook, Instagram, Twitter, Youtube, Mail,
  Package, Send, Heart, Sparkles, MapPin, Phone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

// ============================================
// Social Link Component - Memoized
// ============================================
interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  gradient: string;
  label: string;
}

const SocialLink = memo<SocialLinkProps>(({ href, icon, gradient, label }) => (
  <a
    href={href}
    className="group relative w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
  >
    <span className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
    <span className="relative z-10 text-slate-400 group-hover:text-white transition-colors">
      {icon}
    </span>
  </a>
));

SocialLink.displayName = 'SocialLink';

// ============================================
// Footer Link Component - Memoized
// ============================================
interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  color?: string;
}

const FooterLink = memo<FooterLinkProps>(({ href, children, color = 'orange' }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-start gap-2 text-slate-400 hover:text-${color}-400 transition-all duration-200`}
      prefetch={true}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex-shrink-0`} />
      <span className="group-hover:translate-x-1 transition-transform duration-200">
        {children}
      </span>
    </Link>
  </li>
));

FooterLink.displayName = 'FooterLink';

// ============================================
// Special Footer Link (Affiliate) - Memoized
// ============================================
const AffiliateLink = memo(() => (
  <li>
    <Link
      href="/affiliate"
      className="group flex items-start gap-2 text-slate-400 hover:text-amber-400 transition-all duration-200"
      prefetch={true}
    >
      <Sparkles size={12} className="text-amber-500 animate-pulse mt-1 flex-shrink-0" />
      <span className="group-hover:translate-x-1 transition-transform duration-200">
        Trở thành Đối Tác
      </span>
    </Link>
  </li>
));

AffiliateLink.displayName = 'AffiliateLink';

// ============================================
// Newsletter Form - Separated Component
// ============================================
const NewsletterForm = memo(() => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  }, [email]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubscribe} className="space-y-3">
      <div className="relative group">
        <input
          type="email"
          placeholder="Email của bạn..."
          value={email}
          onChange={handleEmailChange}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-white focus:outline-none focus:border-orange-500 focus:bg-slate-800 placeholder-slate-500 transition-all duration-300"
          required
          maxLength={100}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white hover:shadow-lg hover:shadow-orange-600/50 transition-all duration-300 hover:scale-110 active:scale-90"
          aria-label="Subscribe"
        >
          <Send size={16} />
        </button>
      </div>

      {isSubscribed && (
        <div className="flex items-center gap-2 text-xs text-orange-400 animate-fade-in">
          <Sparkles size={12} className="animate-pulse" />
          <span className="font-medium">Đã đăng ký thành công!</span>
        </div>
      )}

      <p className="text-xs text-slate-500 flex items-center gap-1.5">
        <Heart size={10} className="text-rose-500 flex-shrink-0" />
        <span>Chúng tôi cam kết bảo mật thông tin của bạn.</span>
      </p>
    </form>
  );
});

NewsletterForm.displayName = 'NewsletterForm';

// ============================================
// Main Footer Component
// ============================================
const Footer = () => {
  const { t } = useTranslation();

  // Memoized social links data
  const socialLinks = React.useMemo(() => [
    { href: 'https://facebook.com', icon: <Facebook size={18} />, gradient: 'from-blue-600 to-blue-400', label: 'Facebook' },
    { href: 'https://instagram.com', icon: <Instagram size={18} />, gradient: 'from-pink-600 to-orange-500', label: 'Instagram' },
    { href: 'https://twitter.com', icon: <Twitter size={18} />, gradient: 'from-sky-500 to-blue-400', label: 'Twitter' },
    { href: 'https://youtube.com', icon: <Youtube size={18} />, gradient: 'from-red-600 to-red-400', label: 'Youtube' },
  ], []);

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="mb-12">
          {/* Desktop: 4 columns grid, Mobile: Stack layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8">

            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="/favicon.png"
                    alt="DigitalMart Logo"
                    className="relative w-12 h-12 rounded-2xl shadow-lg transform group-hover:rotate-6 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-serif text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
                    DigitalMart
                  </h3>
                  <span className="text-[10px] font-semibold text-orange-500 -mt-1 tracking-wider">DIGITAL PRODUCTS</span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-400">
                Marketplace sản phẩm số hàng đầu. Themes, Templates, Landing Pages chất lượng cao cho mọi dự án của bạn.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Hạ Long, Quảng Ninh, Việt Nam</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-red-500 flex-shrink-0" />
                  <span>0971 386 588</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-amber-500 flex-shrink-0" />
                  <span>veutong961@gmail.com</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <SocialLink key={social.label} {...social} />
                ))}
              </div>
            </div>

            {/* Mobile: 2 columns for links, Desktop: separate columns */}
            <div className="grid grid-cols-2 gap-8 lg:gap-0 lg:col-span-2 lg:grid-cols-2">
              {/* Quick Links */}
              <div>
                <h4 className="text-base font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-5">
                  Khám Phá
                </h4>
                <ul className="space-y-3 text-sm">
                  <FooterLink href="/about">Về Chúng Tôi</FooterLink>
                  <FooterLink href="/products">Sản Phẩm Số</FooterLink>
                  <FooterLink href="/blog">Blog</FooterLink>
                  <FooterLink href="/community">Cộng Đồng</FooterLink>
                  <AffiliateLink />
                  <FooterLink href="/tracking">Tra Cứu Đơn Hàng</FooterLink>
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-base font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent mb-5">
                  Danh Mục Sản Phẩm
                </h4>
                <ul className="space-y-3 text-sm">
                  <FooterLink href="/products?category=themes" color="orange">Themes & UI Kits</FooterLink>
                  <FooterLink href="/products?category=landing" color="orange">Landing Pages</FooterLink>
                  <FooterLink href="/products?category=templates" color="orange">Templates</FooterLink>
                  <FooterLink href="/products?category=miniapps" color="orange">Mini Apps & Tools</FooterLink>
                  <FooterLink href="/products?category=wordpress" color="orange">WordPress</FooterLink>
                  <FooterLink href="/products?category=ecommerce" color="orange">E-commerce</FooterLink>
                </ul>
              </div>
            </div>

            {/* Newsletter - Full width on mobile */}
            <div>
              <h4 className="text-base font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-5">
                Đăng Ký Nhận Tin
              </h4>
              <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                Nhận thông báo về sản phẩm số mới và ưu đãi đặc biệt qua email.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/50 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <span>&copy; {new Date().getFullYear()} DigitalMart Corp.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                Made with <Heart size={12} className="text-rose-500 animate-pulse" /> in Vietnam
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link href="/policy/privacy" className="hover:text-orange-400 transition-colors hover:underline" prefetch={true}>
                Bảo mật
              </Link>
              <Link href="/policy/terms" className="hover:text-orange-400 transition-colors hover:underline" prefetch={true}>
                Điều khoản
              </Link>
              <Link href="/contact" className="hover:text-orange-400 transition-colors hover:underline" prefetch={true}>
                Liên hệ
              </Link>
              <Link href="/sitemap" className="hover:text-orange-400 transition-colors hover:underline" prefetch={true}>
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </footer>
  );
};

export default memo(Footer);
