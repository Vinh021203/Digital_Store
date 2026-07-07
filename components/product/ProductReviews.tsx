'use client';

import React, { useState, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Camera, X, Send, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';

interface Review {
    id: number;
    user: string;
    avatar?: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
    helpful: number;
    images?: string[];
}

interface ProductReviewsProps {
    productId: number;
    reviews?: Review[];
}

// Mock reviews
const MOCK_REVIEWS: Review[] = [
    {
        id: 1,
        user: 'Nguyễn Văn A',
        rating: 5,
        date: '2024-12-10',
        comment: 'Mẫu demo rất chất lượng, code clean và dễ customize. Support rất nhanh và nhiệt tình. Highly recommended!',
        verified: true,
        helpful: 24,
        images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200']
    },
    {
        id: 2,
        user: 'Trần Thị B',
        rating: 4,
        date: '2024-12-08',
        comment: 'Template đẹp, responsive tốt. Chỉ có một số component chưa hoàn thiện lắm nhưng overall vẫn rất tốt.',
        verified: true,
        helpful: 18
    },
    {
        id: 3,
        user: 'Lê Văn C',
        rating: 5,
        date: '2024-12-05',
        comment: 'Đáng để tham khảo! Mẫu dùng nhanh, không cần chỉnh sửa gì nhiều.',
        verified: false,
        helpful: 12
    },
    {
        id: 4,
        user: 'Phạm Thị D',
        rating: 3,
        date: '2024-12-01',
        comment: 'Mẫu demo ổn, documentation có thể chi tiết hơn. Nhưng support team rất helpful.',
        verified: true,
        helpful: 8
    },
];

export default function ProductReviews({ productId, reviews = MOCK_REVIEWS }: ProductReviewsProps) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);
    const [allReviews, setAllReviews] = useState<Review[]>(reviews);

    // Stats
    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    const ratingCounts = [5, 4, 3, 2, 1].map(r => allReviews.filter(rev => rev.rating === r).length);

    // Filter and sort
    const sortedReviews = [...allReviews]
        .filter(r => !filterRating || r.rating === filterRating)
        .sort((a, b) => {
            switch (sortBy) {
                case 'helpful': return b.helpful - a.helpful;
                case 'highest': return b.rating - a.rating;
                case 'lowest': return a.rating - b.rating;
                default: return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

    const handleSubmitReview = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) {
            addToast('Vui lòng chọn số sao đánh giá', 'error');
            return;
        }
        if (!comment.trim()) {
            addToast('Vui lòng nhập nội dung đánh giá', 'error');
            return;
        }

        const newReview: Review = {
            id: Date.now(),
            user: user?.name || 'Khách',
            rating,
            date: new Date().toISOString().split('T')[0],
            comment: comment.trim(),
            verified: !!user,
            helpful: 0
        };

        setAllReviews(prev => [newReview, ...prev]);
        setRating(0);
        setComment('');
        setShowForm(false);
        addToast('Đánh giá của bạn đã được gửi!', 'success');
    }, [rating, comment, user, addToast]);

    const handleHelpful = useCallback((reviewId: number) => {
        if (helpfulReviews.includes(reviewId)) {
            setHelpfulReviews(prev => prev.filter(id => id !== reviewId));
            setAllReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful - 1 } : r));
        } else {
            setHelpfulReviews(prev => [...prev, reviewId]);
            setAllReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
        }
    }, [helpfulReviews]);

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Average Rating */}
                    <div className="text-center md:border-r md:pr-8 border-slate-100">
                        <div className="text-5xl font-black text-slate-900 mb-2">{averageRating.toFixed(1)}</div>
                        <div className="flex justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={20}
                                    className={star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">{allReviews.length} đánh giá</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star, idx) => {
                            const count = ratingCounts[idx];
                            const percentage = allReviews.length ? (count / allReviews.length) * 100 : 0;
                            return (
                                <button
                                    key={star}
                                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                                    className={`w-full flex items-center gap-3 group hover:bg-slate-50 p-1 rounded-lg transition-colors ${filterRating === star ? 'bg-orange-50' : ''}`}
                                >
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-bold text-slate-700">{star}</span>
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 w-12 text-right">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Write Review Button */}
                    <div className="md:pl-8 md:border-l border-slate-100 flex items-center">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg shadow-orange-200"
                        >
                            Viết đánh giá
                        </button>
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Viết đánh giá của bạn</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* Rating Stars */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Đánh giá của bạn *</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors ${star <= (hoverRating || rating)
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                                {rating > 0 && (
                                    <span className="ml-2 text-sm font-bold text-slate-700 self-center">
                                        {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không tốt' : 'Tệ'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét của bạn *</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về mẫu demo này..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-32"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
                            >
                                <Send size={16} /> Gửi đánh giá
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    {filterRating && (
                        <button
                            onClick={() => setFilterRating(null)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg font-bold"
                        >
                            {filterRating} <Star size={12} fill="currentColor" /> <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="helpful">Hữu ích nhất</option>
                    <option value="highest">Điểm cao nhất</option>
                    <option value="lowest">Điểm thấp nhất</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {sortedReviews.map(review => (
                    <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {review.user.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Header */}
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-bold text-slate-900">{review.user}</span>
                                    {review.verified && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            <CheckCircle size={12} /> Đã xác minh
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400">{review.date}</span>
                                </div>

                                {/* Stars */}
                                <div className="flex gap-0.5 mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={16}
                                            className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                                        />
                                    ))}
                                </div>

                                {/* Comment */}
                                <p className="text-slate-700 leading-relaxed mb-3">{review.comment}</p>

                                {/* Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                        {review.images.map((img, idx) => (
                                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                                <Image src={img} alt="" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Helpful */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleHelpful(review.id)}
                                        className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${helpfulReviews.includes(review.id)
                                                ? 'text-orange-600'
                                                : 'text-slate-500 hover:text-orange-600'
                                            }`}
                                    >
                                        <ThumbsUp size={14} /> Hữu ích ({review.helpful})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {sortedReviews.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <Star size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Chưa có đánh giá nào</p>
                </div>
            )}
        </div>
    );
}
