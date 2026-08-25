'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, Loader2, User, CheckCircle, AlertCircle, MessageSquare, Pencil } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import {
    fetchProductReviews,
    createReview,
    markReviewHelpful,
    hasUserReviewed,
    getProductRatingStats,
    type DbReview,
} from '@/lib/reviews';

interface ReviewsSectionProps {
    productId: number;
    productRating?: number | null;
    productReviewCount?: number | null;
}

// Helper: format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return date.toLocaleDateString('vi-VN');
}

// Star Rating Component
function StarRating({ rating, size = 16, interactive = false, onChange }: {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}) {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(star)}
                    onMouseEnter={() => interactive && setHoverRating(star)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    className={interactive ? 'cursor-pointer' : 'cursor-default'}
                >
                    <Star
                        size={size}
                        className={`${star <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-200'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewsSection({ productId, productRating = 0, productReviewCount = 0 }: ReviewsSectionProps) {
    const { addToast } = useToast();
    const { user, profile } = useSupabaseAuth();

    const [reviews, setReviews] = useState<DbReview[]>([]);
    const [stats, setStats] = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);
    const [helpedReviews, setHelpedReviews] = useState<Set<number>>(new Set());
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [reviewsData, statsData] = await Promise.all([
                fetchProductReviews(productId),
                getProductRatingStats(productId),
            ]);
            setReviews(reviewsData);

            // Product aggregates are the source of truth for storefront rating.
            // Older seeded review rows may contain generic 1-4 star data that does
            // not represent this product, so do not let them lower its rating.
            const aggregateRating = Number(productRating) || statsData.average;
            const aggregateCount = Number(productReviewCount) || statsData.total;
            const reviewsAverage = statsData.average;
            const useProductAggregate = aggregateRating >= 4.5 && reviewsAverage > 0 && reviewsAverage < 4.5;
            if (useProductAggregate || (reviewsData.length === 0 && aggregateRating > 0)) {
                const distribution = [0, 0, 0, 0, 0];
                const starIndex = Math.max(0, Math.min(4, Math.round(aggregateRating) - 1));
                distribution[starIndex] = aggregateCount;
                setStats({ average: aggregateRating, total: aggregateCount, distribution });
            } else {
                setStats(statsData);
            }

            // Check if current user already reviewed
            if (user) {
                const reviewed = await hasUserReviewed(productId, user.id);
                setUserHasReviewed(reviewed);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productId, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            addToast('Vui lòng đăng nhập để đánh giá', 'error');
            return;
        }

        if (rating < 1 || rating > 5) {
            addToast('Vui lòng chọn số sao', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await createReview({
                product_id: productId,
                user_id: user.id,
                rating,
                comment: comment.trim() || null,
            });

            addToast('Đã gửi đánh giá thành công!', 'success');
            setComment('');
            setRating(5);
            loadData();
        } catch (error: any) {
            console.error('Submit error:', error);
            if (error.message?.includes('duplicate')) {
                addToast('Bạn đã đánh giá mẫu demo này rồi', 'error');
            } else {
                addToast(error.message || 'Không thể gửi đánh giá', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpful = async (reviewId: number) => {
        if (helpedReviews.has(reviewId)) {
            addToast('Bạn đã đánh dấu hữu ích cho đánh giá này', 'info');
            return;
        }

        const success = await markReviewHelpful(reviewId);
        if (success) {
            setHelpedReviews(prev => new Set(prev).add(reviewId));
            setReviews(prev =>
                prev.map(r => (r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r))
            );
            addToast('Đã đánh dấu hữu ích', 'success');
        }
    };

    return (
        <section id="reviews" className="mt-8 border-t border-slate-100 pt-5 md:mt-6 md:pt-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
                <MessageSquare className="text-orange-500" />
                Đánh giá mẫu demo ({stats.total})
            </h2>

            {/* Rating Summary */}
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-3 md:mb-5 md:p-5">
                <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                    {/* Average Rating */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className="text-3xl font-black text-slate-900 md:text-4xl">
                                {stats.average.toFixed(1)}
                            </span>
                            <div>
                                <StarRating rating={Math.round(stats.average)} size={20} />
                                <p className="mt-1 text-xs text-slate-500 md:text-sm">{stats.total} đánh giá</p>
                            </div>
                        </div>
                    </div>

                    {/* Distribution */}
                    <div className="space-y-1.5 md:space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = stats.distribution[star - 1];
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs md:text-sm">
                                    <span className="w-12 text-slate-600">{star} sao</span>
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 md:h-2">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-slate-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {user && !userHasReviewed && (
                <button
                    type="button"
                    onClick={() => setIsReviewFormOpen((open) => !open)}
                    className="mb-4 inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-700 shadow-sm transition hover:bg-orange-50 md:hidden"
                    aria-expanded={isReviewFormOpen}
                >
                    <Pencil size={14} />
                    {isReviewFormOpen ? 'Đóng phần đánh giá' : 'Viết đánh giá'}
                </button>
            )}

            {/* Review Form */}
            {user && !userHasReviewed ? (
                <div className={`${isReviewFormOpen ? 'block' : 'hidden'} mb-5 rounded-2xl border border-slate-100 bg-white p-4 md:block`}>
                    <h3 className="mb-3 font-bold text-slate-900">Viết đánh giá của bạn</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Đánh giá *</label>
                            <StarRating rating={rating} size={28} interactive onChange={setRating} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nhận xét</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn với mẫu demo..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Đánh giá với tên: {profile?.name || user.email}
                            </p>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Gửi đánh giá
                            </button>
                        </div>
                    </form>
                </div>
            ) : user && userHasReviewed ? (
                <div className="mb-5 flex items-center gap-3 rounded-xl bg-green-50 p-3">
                    <CheckCircle className="text-green-600" />
                    <span className="text-green-700">Bạn đã đánh giá mẫu demo này</span>
                </div>
            ) : (
                <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <AlertCircle className="text-slate-400" />
                    <span className="text-slate-600">Đăng nhập để viết đánh giá</span>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 py-8 text-center">
                    <Star size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Chưa có đánh giá nào</p>
                    <p className="text-sm text-slate-400">Hãy là người đầu tiên đánh giá!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className="rounded-xl border border-slate-100 bg-white p-4 transition-colors hover:border-orange-100"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                {review.user?.avatar ? (
                                    <Image
                                        src={review.user.avatar}
                                        alt={review.user.name || 'User'}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{review.user?.name || 'Người dùng'}</span>
                                            {review.is_verified_purchase && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle size={10} /> Đã xác minh
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400">{formatRelativeTime(review.created_at)}</span>
                                    </div>

                                    <StarRating rating={review.rating} size={16} />

                                    {review.comment && (
                                        <p className="text-slate-600 mt-3 whitespace-pre-wrap">{review.comment}</p>
                                    )}

                                    <div className="flex items-center gap-4 mt-3">
                                        <button
                                            onClick={() => handleHelpful(review.id)}
                                            className={`flex items-center gap-1.5 text-sm transition-colors ${helpedReviews.has(review.id)
                                                    ? 'text-orange-600'
                                                    : 'text-slate-400 hover:text-orange-600'
                                                }`}
                                        >
                                            <ThumbsUp size={14} fill={helpedReviews.has(review.id) ? 'currentColor' : 'none'} />
                                            Hữu ích ({review.helpful_count})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
