'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Eye, CheckCircle, X } from 'lucide-react';
import { fetchAllReviews, type DbReview } from '@/lib/reviews';

interface SocialProofNotification {
    id: number;
    type: 'purchase' | 'review' | 'viewing';
    name: string;
    product: string;
    productSlug?: string;
    productImage?: string;
    location: string;
    time: string;
    rating?: number;
}

// Demo users for purchase/viewing notifications
const DEMO_USERS = [
    { name: 'Minh Tuấn', location: 'Hà Nội' },
    { name: 'Đức Anh', location: 'Đà Nẵng' },
    { name: 'Văn Khoa', location: 'Hải Phòng' },
    { name: 'Hồng Nhung', location: 'Cần Thơ' },
    { name: 'Thu Hương', location: 'TP.HCM' },
    { name: 'Quang Minh', location: 'Huế' },
    { name: 'Lan Anh', location: 'Nha Trang' },
];

const getRandomTime = () => {
    const times = ['2 phút trước', '5 phút trước', '8 phút trước', '12 phút trước', '15 phút trước', '20 phút trước'];
    return times[Math.floor(Math.random() * times.length)];
};

const getIcon = (type: SocialProofNotification['type']) => {
    switch (type) {
        case 'purchase': return <ShoppingCart size={14} className="text-green-500" />;
        case 'review': return <Star size={14} className="text-amber-500" />;
        case 'viewing': return <Eye size={14} className="text-blue-500" />;
    }
};

const getBgColor = (type: SocialProofNotification['type']) => {
    switch (type) {
        case 'purchase': return 'bg-green-500';
        case 'review': return 'bg-amber-500';
        case 'viewing': return 'bg-blue-500';
    }
};

const getMessage = (notification: SocialProofNotification) => {
    switch (notification.type) {
        case 'purchase':
            return (
                <>
                    <span className="font-bold text-slate-900">{notification.name}</span>
                    <span className="text-slate-600"> vừa mua </span>
                    <span className="font-bold text-orange-600">{notification.product}</span>
                </>
            );
        case 'review':
            return (
                <>
                    <span className="font-bold text-slate-900">{notification.name}</span>
                    <span className="text-slate-600"> đã đánh giá </span>
                    <span className="font-bold text-orange-600">{notification.product}</span>
                    {notification.rating && (
                        <span className="inline-flex items-center gap-0.5 ml-1">
                            {Array.from({ length: notification.rating }).map((_, i) => (
                                <Star key={i} size={8} className="text-amber-400 fill-amber-400" />
                            ))}
                        </span>
                    )}
                </>
            );
        case 'viewing':
            return (
                <>
                    <span className="font-bold text-blue-600">{notification.name}</span>
                    <span className="text-slate-600"> đang xem </span>
                    <span className="font-bold text-orange-600">{notification.product}</span>
                </>
            );
    }
};

export default function SocialProofNotifications() {
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<SocialProofNotification | null>(null);
    const [index, setIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [notifications, setNotifications] = useState<SocialProofNotification[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Fetch real reviews from backend
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch latest approved reviews with product info
                const reviews = await fetchAllReviews({ isApproved: true, limit: 10 });
                
                const generatedNotifications: SocialProofNotification[] = [];
                
                // Convert reviews to notifications
                reviews.forEach((review: DbReview, idx: number) => {
                    if (review.product && review.user) {
                        generatedNotifications.push({
                            id: review.id,
                            type: 'review',
                            name: review.user.name || 'Người dùng',
                            product: review.product.name,
                            productSlug: review.product.slug,
                            productImage: review.product.image,
                            location: DEMO_USERS[idx % DEMO_USERS.length].location,
                            time: getRandomTime(),
                            rating: review.rating,
                        });
                        
                        // Add fake purchase notification for variety
                        if (idx < 5) {
                            const randomUser = DEMO_USERS[(idx + 3) % DEMO_USERS.length];
                            generatedNotifications.push({
                                id: 1000 + idx,
                                type: 'purchase',
                                name: randomUser.name,
                                product: review.product.name,
                                productSlug: review.product.slug,
                                productImage: review.product.image,
                                location: randomUser.location,
                                time: getRandomTime(),
                            });
                        }
                    }
                });

                // Add viewing notification with real product
                if (reviews.length > 0 && reviews[0].product) {
                    generatedNotifications.push({
                        id: 9999,
                        type: 'viewing',
                        name: `${Math.floor(Math.random() * 20) + 5} người`,
                        product: reviews[0].product.name,
                        productSlug: reviews[0].product.slug,
                        productImage: reviews[0].product.image,
                        location: '',
                        time: 'đang xem',
                    });
                }

                // Shuffle notifications
                const shuffled = generatedNotifications.sort(() => Math.random() - 0.5);
                setNotifications(shuffled);
                setLoaded(true);
            } catch (error) {
                console.error('Error loading social proof data:', error);
                setLoaded(true);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (dismissed || !loaded || notifications.length === 0) return;

        // Show first notification after 5 seconds
        const showTimer = setTimeout(() => {
            setCurrentNotification(notifications[0]);
            setVisible(true);
        }, 5000);

        return () => clearTimeout(showTimer);
    }, [dismissed, loaded, notifications]);

    useEffect(() => {
        if (!visible || dismissed || notifications.length === 0) return;

        // Hide after 5 seconds, then show next after 12 seconds
        const hideTimer = setTimeout(() => {
            setVisible(false);

            const nextTimer = setTimeout(() => {
                const nextIndex = (index + 1) % notifications.length;
                setIndex(nextIndex);
                setCurrentNotification(notifications[nextIndex]);
                setVisible(true);
            }, 12000);

            return () => clearTimeout(nextTimer);
        }, 5000);

        return () => clearTimeout(hideTimer);
    }, [visible, index, dismissed, notifications]);

    const handleDismiss = useCallback(() => {
        setVisible(false);
        setDismissed(true);
    }, []);

    if (!currentNotification || !visible) return null;

    const notificationContent = (
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-start gap-2.5 relative overflow-hidden">
            {/* Colored Accent */}
            <div className={`absolute left-0 top-0 w-1 h-full ${getBgColor(currentNotification.type)}`} />

            {/* Product Image or Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                currentNotification.type === 'purchase' ? 'bg-green-100' :
                currentNotification.type === 'review' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
                {currentNotification.productImage ? (
                    <Image
                        src={currentNotification.productImage}
                        alt={currentNotification.product}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    getIcon(currentNotification.type)
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs leading-snug">
                    {getMessage(currentNotification)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle size={8} className="text-green-500" />
                    {currentNotification.location && `${currentNotification.location} • `}
                    {currentNotification.time}
                </p>
            </div>

            {/* Dismiss */}
            <button
                onClick={handleDismiss}
                className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
                title="Ẩn"
            >
                <X size={12} />
            </button>
        </div>
    );

    return (
        <div
            className="fixed z-50 left-3 right-3 top-16 md:left-4 md:right-auto md:top-auto md:bottom-4 md:max-w-xs animate-social-proof-slide"
        >
            {currentNotification.productSlug ? (
                <Link href={`/product/${currentNotification.productSlug}`}>
                    {notificationContent}
                </Link>
            ) : (
                notificationContent
            )}

            <style jsx global>{`
                @keyframes social-proof-slide {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @media (min-width: 768px) {
                    @keyframes social-proof-slide {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                }
                .animate-social-proof-slide {
                    animation: social-proof-slide 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
