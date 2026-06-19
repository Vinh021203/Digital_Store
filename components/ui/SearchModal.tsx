'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, ArrowRight, Clock, Package, TrendingUp, Sparkles, Star, FileCode, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchActiveProducts } from '@/lib/products';
import type { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Dashboard', 'Landing Page', 'React', 'Admin', 'E-commerce', 'SaaS'];
const POPULAR_CATEGORIES = ['Themes', 'Templates', 'Landing Pages', 'Mini Apps', 'UI Kits', 'Icons'];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchActiveProducts();
      setAllProducts(data);
      setLoading(false);
    };
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shopwebre_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
      setTimeout(() => setSearchTerm(''), 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      (typeof p.category === 'string' ? p.category : (p.category as any)?.name || '').toLowerCase().includes(term) ||
      p.author?.toLowerCase().includes(term) ||
      p.format?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    ).slice(0, 8);
    setResults(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, allProducts]);

  // Save search to recent
  const saveRecentSearch = useCallback((term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('shopwebre_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleRecentSearch = (term: string) => {
    setSearchTerm(term);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    if (searchTerm.trim()) saveRecentSearch(searchTerm.trim());
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      saveRecentSearch(searchTerm);
      onClose();
      window.location.href = `/product/${results[highlightedIndex].id}`;
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('shopwebre_recent_searches');
  };

  // Group results by format
  const themeResults = results.filter(p => p.format === 'Theme' || p.format === 'Template');
  const landingResults = results.filter(p => p.format === 'Landing' || p.format === 'MiniApp');
  const otherResults = results.filter(p => !['Theme', 'Template', 'Landing', 'MiniApp'].includes(p.format || ''));

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/70 backdrop-blur-md transition-all duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 -translate-y-4 opacity-0'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative border-b border-slate-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500"></div>

          <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <Search className="text-orange-600" size={22} strokeWidth={2.5} />
              {searchTerm && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm themes, templates, landing pages..."
              className="flex-1 text-base sm:text-lg outline-none text-slate-800 placeholder-slate-400 h-10 sm:h-12 bg-transparent font-medium pl-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded">
                ESC
              </kbd>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] sm:max-h-[70vh] overflow-y-auto">
          {!searchTerm && (
            <div className="p-5 sm:p-6 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-orange-600" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tìm kiếm gần đây</h3>
                    </div>
                    <button onClick={clearRecentSearches} className="text-xs text-slate-400 hover:text-red-500">
                      Xóa
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentSearch(term)}
                        className="group flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-xl text-sm font-medium transition-all border border-slate-200 hover:border-orange-300"
                      >
                        <Clock size={13} className="opacity-60" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tìm kiếm phổ biến</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRecentSearch(term)}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-xl text-sm font-bold border border-orange-200 hover:border-orange-400 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package size={14} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Danh mục</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_CATEGORIES.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={`/products?category=${cat.toLowerCase()}`}
                      onClick={handleClose}
                      className="group flex items-center justify-between p-3 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all"
                    >
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{cat}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searchTerm && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              {/* Results */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileCode size={14} className="text-orange-600" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Kết quả ({results.length})
                  </h3>
                </div>
                <div className="space-y-1">
                  {results.map((product, idx) => (
                    <Link
                      key={product.id}
                      href={`/product/${(product as any).slug || product.id}`}
                      onClick={() => { saveRecentSearch(searchTerm); handleClose(); }}
                      className={`group flex items-center gap-3 p-3 rounded-xl transition-all border ${highlightedIndex === idx
                        ? 'bg-orange-50 border-orange-200'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 group-hover:text-orange-600 text-sm truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${product.format === 'Theme' ? 'bg-orange-100 text-orange-700' :
                            product.format === 'Template' ? 'bg-amber-100 text-amber-700' :
                              product.format === 'Landing' ? 'bg-red-100 text-red-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                            {product.format}
                          </span>
                          <span className="text-sm font-bold text-orange-600">{product.price.toLocaleString('vi-VN')}₫</span>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs text-slate-500">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* View All */}
              <div className="p-4 text-center bg-slate-50">
                <Link
                  href={`/products?search=${searchTerm}`}
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-200"
                >
                  <Sparkles size={16} />
                  Xem tất cả kết quả
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {searchTerm && results.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 mb-6">
                Thử với từ khóa khác như <span className="font-bold text-orange-600">"Dashboard"</span> hoặc <span className="font-bold text-orange-600">"Landing Page"</span>
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm font-bold text-orange-600 hover:underline"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
