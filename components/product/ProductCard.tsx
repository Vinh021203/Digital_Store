'use client';

import React, { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, ShoppingCart, Heart, Share2, Check, ArrowRightLeft,
  Package, PlayCircle, Clock, Eye, Download, MessageCircle
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';
import StarRating from './StarRating';
import { getProductTypeFilledStyle } from '@/lib/productTypeDisplay';

// Blur placeholder for images
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsLCgwMDhEODQ4RDgwMEhQSFhITExMOFRcZGxkWGhQWFhL/2wBDAQMEBAUEBQkFBQkWDwwPFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAJRAAAQMDAwMFAAAAAAAAAAAAAQIDBAAFEQYSIQcTMRQiQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAXEQEBAQEAAAAAAAAAAAAAAAABAgAD/9oADAMBERACEEQ8T//UAJwKkKV0NQAG0ADE8CuKH//Z';


interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onQuickView, viewMode = 'grid' }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToCompare, removeFromCompare, isInCompare, compareList } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { isCatalogMode } = useSiteMode();
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isLiked = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const priceLabel = isCatalogMode ? 'Liên hệ tư vấn' : product.price.toLocaleString('vi-VN') + ' VND';

  // Memoized handlers
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCatalogMode) {
      addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
      if (typeof window !== 'undefined') {
        const productSlug = (product as any).slug || product.id;
        window.location.href = `/contact?product=${encodeURIComponent(String(productSlug))}`;
      }
      return;
    }
    addToCart(product);
    addToast(
      'Đã thêm vào danh sách',
      'success'
    );
  }, [product, addToCart, addToast, isCatalogMode]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(product.id);
      addToast('Đã xóa khỏi yêu thích', 'info');
    } else {
      addToWishlist(product);
      addToast('Đã thêm vào yêu thích', 'success');
    }
  }, [isLiked, product, addToWishlist, removeFromWishlist, addToast]);

  const handleToggleCompare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
      addToast('Đã xóa khỏi so sánh', 'info');
    } else {
      if (compareList.length >= 3) {
        addToast('Chỉ có thể so sánh tối đa 3 mẫu demo', 'warning');
      } else {
        addToCompare(product);
        addToast('Đã thêm vào so sánh', 'success');
      }
    }
  }, [isCompared, product, compareList.length, addToCompare, removeFromCompare, addToast]);

  const handleQuickViewClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  }, [product, onQuickView]);

  const handleCopyLink = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.affiliateCode && typeof window !== 'undefined') {
      const productSlug = (product as any).slug || product.id;
      const link = `${window.location.origin}/product/${productSlug}?ref=${user.affiliateCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      addToast('Đã sao chép link tiếp thị!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [user?.affiliateCode, product.id, addToast]);

  if (viewMode === 'list') {
    return (
      <article className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-row h-full border border-slate-100 hover:border-orange-100">
        {/* Image Container */}
        <Link
          href={`/product/${(product as any).slug || product.id}`}
          className="relative w-1/3 max-w-[280px] aspect-[16/9] overflow-hidden bg-slate-100"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 33vw, 200px"
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={`object-contain transition-transform duration-500 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 rounded bg-pink-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              MỚI
            </span>
          )}
        </Link>
        {/* Content */}
        <div className="p-4 flex flex-col flex-1 relative">
          <div className="flex justify-between items-start">
            <div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-xs text-orange-600 uppercase tracking-wider font-bold hover:text-orange-700 transition-colors mb-1 block"
              >
                {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Uncategorized'}
              </Link>
              <Link
                href={`/product/${(product as any).slug || product.id}`}
                className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 hover:text-orange-600 transition-colors"
              >
                {product.name}
              </Link>
              <p className="text-xs text-slate-500 mb-2">by <span className="font-semibold">{product.author}</span></p>
            </div>
            {/* Desktop Actions */}
            <div className="hidden lg:flex gap-2">
              <button onClick={handleToggleWishlist} className={`p-2 rounded-lg transition-colors ${isLiked ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-black text-orange-700">{priceLabel}</span>
              {!isCatalogMode && product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-orange-500/20 flex items-center gap-2"
            >
              {isCatalogMode ? <MessageCircle size={16} /> : <ShoppingCart size={16} />}
              {isCatalogMode ? 'Tư vấn' : 'Thêm giỏ'}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden flex flex-col h-full hover-lift hover-glow">
      {/* Image Container */}
      <Link
        href={`/product/${(product as any).slug || product.id}`}
        className="block relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50/40"
      >
        {/* Image with Next.js optimization */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={`object-contain transition-transform duration-500 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges and Overlays logic same as before... */}
        <div className="absolute top-2 left-2 flex gap-1">
          {/* Format Badge */}
          {product.format && (
            <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${getProductTypeFilledStyle(product.format)}`}>
              {product.format === 'Theme' || product.format === 'Landing' ? <Package size={9} /> : <PlayCircle size={9} />}
              {product.format}
            </span>
          )}

          {/* New Badge */}
          {product.isNew && (
            <span className="bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
              MỚI
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {!isCatalogMode && discount > 0 && (
          <span className="absolute top-2 right-2 bg-rose-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Desktop Hover Overlay */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-between p-3">
          {/* Rating + Duration */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 justify-end">
            {user?.isAffiliate && (
              <button
                onClick={handleCopyLink}
                className={`p-1.5 rounded-lg shadow-md backdrop-blur-md transition-all ${copied ? 'bg-orange-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-orange-500 hover:text-white'
                  }`}
                title="Copy Link"
                aria-label="Copy affiliate link"
              >
                {copied ? <Check size={14} strokeWidth={2.5} /> : <Share2 size={14} strokeWidth={2.5} />}
              </button>
            )}

            {onQuickView && (
              <button
                onClick={handleQuickViewClick}
                className="p-1.5 rounded-lg shadow-md backdrop-blur-md bg-white/90 text-slate-700 hover:bg-orange-600 hover:text-white transition-all"
                title="Xem nhanh"
                aria-label="Quick view"
              >
                <Eye size={14} strokeWidth={2.5} />
              </button>
            )}

            <button
              onClick={handleToggleCompare}
              className={`p-1.5 rounded-lg shadow-md backdrop-blur-md transition-all ${isCompared ? 'bg-blue-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-blue-500 hover:text-white'
                }`}
              title="So sánh"
              aria-label="Compare"
            >
              <ArrowRightLeft size={14} strokeWidth={2.5} />
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 rounded-lg shadow-md backdrop-blur-md transition-all ${isLiked ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-rose-500 hover:text-white'
                }`}
              title="Yêu thích"
              aria-label="Wishlist"
            >
              <Heart size={14} strokeWidth={2.5} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Mobile Rating Overlay */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-[11px]">{product.rating}</span>
            </div>
          </div>
        </div>

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer bg-[length:1000px_100%]" />
        )}
      </Link>

      {/* Content Section - Ultra Compact */}
      <div className="flex flex-grow flex-col p-3 md:p-3.5">
        {/* Category */}
        <Link
          href={`/products?category=${product.category}`}
          className="text-[10px] md:text-xs text-orange-700 uppercase tracking-wider font-bold hover:text-orange-800 transition-colors mb-1 py-0.5 inline-block"
        >
          {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Uncategorized'}
        </Link>

        {/* Title */}
        <Link
          href={`/product/${(product as any).slug || product.id}`}
          className="line-clamp-2 block min-h-[32px] py-0.5 text-xs font-bold leading-tight text-slate-900 transition-colors hover:text-orange-600 md:min-h-[40px] md:text-sm"
        >
          {product.name}
        </Link>

        {/* Author & Rating */}
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-slate-500 md:text-xs">
            by <span className="font-semibold">{product.author}</span>
          </p>
          <StarRating
            rating={product.rating}
            reviewCount={product.reviews_count || product.reviews}
            size={11}
            className="shrink-0"
          />
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between mt-auto gap-2">
          {/* Price */}
          <div className="flex flex-col min-w-0 flex-shrink">
            <span className="text-sm md:text-base font-black text-orange-700 truncate">
              {priceLabel}
            </span>
            {!isCatalogMode && product.originalPrice && (
              <span className="text-[10px] md:text-xs text-slate-500 line-through truncate">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          {/* Buy Button */}
          <button
            onClick={handleAddToCart}
            className="flex h-10 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-3 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 hover:from-orange-700 hover:to-red-700 hover:shadow-lg"
          >
            {isCatalogMode ? <MessageCircle size={12} /> : <ShoppingCart size={12} />}
            <span className="hidden sm:inline">{isCatalogMode ? 'Tư vấn' : 'Thêm giỏ'}</span>
            <span className="sm:hidden">{isCatalogMode ? 'Tư vấn' : 'Tư vấn'}</span>
          </button>
        </div>

        {/* Mobile Action Icons - No Border */}
        <div className="md:hidden flex items-center gap-1 mt-1.5">
          {user?.isAffiliate && (
            <button
              onClick={handleCopyLink}
              className={`flex-1 py-1 rounded text-xs transition-all ${copied ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-100'
                }`}
              aria-label="Share"
            >
              {copied ? <Check size={11} className="mx-auto" /> : <Share2 size={11} className="mx-auto" />}
            </button>
          )}

          <button
            onClick={handleToggleWishlist}
            className={`flex-1 py-1 rounded transition-all ${isLiked ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            aria-label="Wishlist"
          >
            <Heart size={11} className="mx-auto" fill={isLiked ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleToggleCompare}
            className={`flex-1 py-1 rounded transition-all ${isCompared ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            aria-label="Compare"
          >
            <ArrowRightLeft size={11} className="mx-auto" />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="flex-1 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              aria-label="View"
            >
              <Eye size={11} className="mx-auto" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
