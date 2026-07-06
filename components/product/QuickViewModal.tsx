'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  X, Star, ShoppingCart, Check, Package, FileCode, Clock,
  ShieldCheck, Download, Users, TrendingUp, Heart, Share2, Key,
  ArrowRightLeft, Eye, Zap, Copy, ExternalLink, MessageCircle
} from 'lucide-react';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSiteMode } from '@/hooks/useSiteSettings';

// Blur placeholder
const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsLCgwMDhEODQ4RDgwMEhQSFhITExMOFRcZGxkWGhQWFhL/2wBDAQMEBAUEBQkFBQkWDwwPFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAJRAAAQMDAwMFAAAAAAAAAAAAAQIDBAAFEQYSIQcTMRQiQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAXEQEBAQEAAAAAAAAAAAAAAAABAgAD/9oADAMBERACEEQ8T//UAJwKkKV0NQAG0ADE8CuKH//Z';

const stripHtml = (value?: string | null) =>
  String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, addToWishlist, isInWishlist, addToCompare, isInCompare } = useCart();
  const { addToast } = useToast();
  const { isCatalogMode } = useSiteMode();
  const [isAdded, setIsAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isLiked = product ? isInWishlist(product.id) : false;
  const isCompared = product ? isInCompare(product.id) : false;

  // Discount calculation
  const discount = React.useMemo(() => {
    if (!product?.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product?.originalPrice, product?.price]);

  // Format badge style
  const getFormatStyle = (format: string) => {
    switch (format) {
      case 'Theme': return 'bg-gradient-to-r from-orange-600 to-red-600';
      case 'Template': return 'bg-gradient-to-r from-amber-600 to-orange-600';
      case 'Landing': return 'bg-gradient-to-r from-red-600 to-rose-600';
      case 'MiniApp': return 'bg-gradient-to-r from-rose-600 to-pink-600';
      case 'Bundle': return 'bg-gradient-to-r from-purple-600 to-violet-600';
      default: return 'bg-orange-600';
    }
  };

  // Close on Escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (isCatalogMode) {
      addToast('Website đang ở chế độ tư vấn. Mình sẽ chuyển bạn sang trang liên hệ.', 'info');
      const productSlug = (product as any).slug || product.id;
      window.location.href = `/contact?product=${encodeURIComponent(String(productSlug))}`;
      return;
    }
    addToCart(product);
    setIsAdded(true);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1500);
  }, [product, addToCart, addToast, onClose, isCatalogMode]);

  const handleWishlist = useCallback(() => {
    if (!product) return;
    addToWishlist(product);
    addToast(isLiked ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích', 'success');
  }, [product, addToWishlist, isLiked, addToast]);

  const handleCompare = useCallback(() => {
    if (!product) return;
    addToCompare(product);
    addToast(isCompared ? 'Đã xóa khỏi so sánh' : 'Đã thêm vào so sánh', 'success');
  }, [product, addToCompare, isCompared, addToast]);

  const handleCopyLink = useCallback(() => {
    if (!product) return;
    navigator.clipboard.writeText(`${window.location.origin}/product/${(product as any).slug || product.id}`);
    setCopiedLink(true);
    addToast('Đã sao chép link sản phẩm', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  }, [product, addToast]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white w-full md:max-w-4xl md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-lg z-10"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-52 md:h-auto bg-slate-100 relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {product.format && (
              <span className={`text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide shadow-md ${getFormatStyle(product.format)}`}>
                <Package size={10} className="inline mr-1" />
                {product.format}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                NEW
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-12 flex gap-1.5">
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full shadow-md transition-all ${isLiked ? 'bg-rose-500 text-white' : 'bg-white/95 text-slate-600 hover:bg-rose-500 hover:text-white'}`}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleCompare}
              className={`p-2 rounded-full shadow-md transition-all ${isCompared ? 'bg-blue-500 text-white' : 'bg-white/95 text-slate-600 hover:bg-blue-500 hover:text-white'}`}
              aria-label="Compare"
            >
              <ArrowRightLeft size={16} />
            </button>
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-full shadow-md transition-all ${copiedLink ? 'bg-green-500 text-white' : 'bg-white/95 text-slate-600 hover:bg-slate-100'}`}
              aria-label="Share"
            >
              {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
            </button>
          </div>

          {/* Demo Button */}
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg font-bold text-sm text-slate-700 hover:bg-orange-500 hover:text-white transition-all shadow-md flex items-center gap-2"
            >
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto">
          <div className="p-5 md:p-6 flex flex-col flex-grow">
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviews || 120})</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight line-clamp-2">
              {product.name}
            </h2>

            {/* Author */}
            <p className="text-sm text-slate-500 mb-4">
              by <span className="font-semibold text-slate-700">{product.author}</span>
            </p>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl md:text-3xl font-black text-orange-600">
                    {product.price.toLocaleString('vi-VN')}₫
                  </div>
                  {product.originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-400 line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-xs font-bold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded">
                        Tiết kiệm {discount}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">License</span>
                  <p className="text-sm font-bold text-slate-700">{(product as any).licenseType || 'Regular'}</p>
                </div>
              </div>
            </div>

	            {/* Description */}
	            <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
	              {stripHtml(product.description) || 'Premium digital product with modern design, clean code, and full documentation. Perfect for your next project.'}
	            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <FeatureItem icon={isCatalogMode ? Eye : Download} text={isCatalogMode ? 'Xem demo trước' : 'Instant Download'} />
              <FeatureItem icon={Key} text="License Key" />
              <FeatureItem icon={ShieldCheck} text="6 tháng hỗ trợ" />
              <FeatureItem icon={FileCode} text={(product as any).fileType || 'Source Code'} />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-orange-600" />
                <span className="font-semibold">{(product as any).sold || '1.2K'}+ downloads</span>
              </div>
              <div className="w-px h-3 bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-green-600" />
                <span className="font-semibold">Popular</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base ${isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 active:scale-[0.98] shadow-lg shadow-orange-200'
                    }`}
                  aria-label={isCatalogMode ? 'Nhận tư vấn' : isAdded ? 'Added' : 'Add to cart'}
                >
                  {isCatalogMode ? (
                    <><MessageCircle size={18} strokeWidth={2} /> Nhận tư vấn</>
                  ) : isAdded ? (
                    <><Check size={18} strokeWidth={2.5} /> Đã thêm vào giỏ</>
                  ) : (
                    <><ShoppingCart size={18} strokeWidth={2} /> Thêm vào giỏ</>
                  )}
                </button>
              </div>

              {/* View Details Link */}
              <Link
                href={`/product/${(product as any).slug || product.id}`}
                className="block text-center text-sm font-semibold text-slate-600 hover:text-orange-600 py-2 transition-colors"
              >
                Xem chi tiết đầy đủ →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Feature Item Component
const FeatureItem = memo(({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50">
    <Icon size={14} className="flex-shrink-0 text-orange-600" strokeWidth={2} />
    <span className="font-semibold truncate">{text}</span>
  </div>
));

FeatureItem.displayName = 'FeatureItem';

export default memo(QuickViewModal);
