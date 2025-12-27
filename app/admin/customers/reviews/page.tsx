'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Search,
  Check,
  X,
  MessageCircle,
  MoreHorizontal,
  ThumbsUp,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  Package,
} from 'lucide-react';
import { fetchAllReviews, toggleReviewApproval, deleteReview, type DbReview } from '@/lib/reviews';
import { useToast } from '@/context/ToastContext';

type RatingFilter = number | 'all';

const ReviewsManager = () => {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<RatingFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      addToast('Không thể tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return reviews.filter(r => {
      const matchRating = filterRating === 'all' || r.rating === filterRating;
      const matchSearch =
        !q ||
        r.comment?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q);
      return matchRating && matchSearch;
    });
  }, [reviews, filterRating, searchTerm]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { average: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      total: reviews.length,
    };
  }, [reviews]);

  const handleToggleApproval = async (id: number) => {
    try {
      await toggleReviewApproval(id);
      setReviews(prev =>
        prev.map(r =>
          r.id === id ? { ...r, is_approved: !r.is_approved } : r
        )
      );
      addToast('Đã cập nhật trạng thái', 'success');
    } catch (error) {
      addToast('Lỗi khi cập nhật', 'error');
    }
    setActionMenuId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      addToast('Đã xóa đánh giá', 'success');
    } catch (error) {
      addToast('Lỗi khi xóa', 'error');
    }
    setActionMenuId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      className="space-y-6 animate-fade-in"
      onClick={() => setActionMenuId(null)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Đánh Giá & Phản Hồi
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý ý kiến khách hàng để cải thiện chất lượng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadReviews()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium shadow-sm">
            <Star size={16} className="text-amber-400 fill-current" />
            <span>Trung bình: {stats.average}/5 ({stats.total} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filterRating === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-all ${filterRating === star
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {star} <Star size={12} fill="currentColor" />
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm nội dung đánh giá..."
            className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <MessageCircle size={48} className="mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500">Không có đánh giá nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              onClick={e => e.stopPropagation()}
            >
              {/* Top row */}
              <div className="flex justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  {/* Product Info */}
                  {review.product && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                        <Image
                          src={review.product.image || '/placeholder.png'}
                          alt={review.product.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 line-clamp-1"
                        >
                          {review.product.name}
                        </Link>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < review.rating
                                  ? 'text-amber-400 fill-current'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 relative">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${review.is_approved
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                      }`}
                  >
                    {review.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActionMenuId(review.id)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {actionMenuId === review.id && (
                    <div className="absolute right-0 top-10 z-20 w-40 bg-white border border-slate-100 rounded-xl shadow-lg text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(review.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        {review.is_approved ? <X size={14} /> : <Check size={14} />}
                        {review.is_approved ? 'Bỏ duyệt' : 'Duyệt'}
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 font-semibold"
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User & Review Content */}
              <div className="flex items-start gap-3 mb-3">
                {review.user?.avatar ? (
                  <Image
                    src={review.user.avatar}
                    alt={review.user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">
                      {review.user?.name || 'Ẩn danh'}
                    </p>
                    {review.is_verified_purchase && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        ✓ Đã mua
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {review.comment && (
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed italic">
                      "{review.comment}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <ThumbsUp size={14} /> Hữu ích ({review.helpful_count})
                </span>
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <MessageCircle size={14} /> Phản hồi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
