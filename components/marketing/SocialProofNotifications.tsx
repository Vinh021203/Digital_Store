'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Eye, MessageCircle, Star, X } from 'lucide-react';
import { fetchAllReviews, type DbReview } from '@/lib/reviews';

interface SocialProofNotification {
  id: number;
  type: 'interest' | 'review' | 'viewing';
  name: string;
  product: string;
  productSlug?: string;
  productImage?: string;
  location: string;
  time: string;
  rating?: number;
}

const SAMPLE_USERS = [
  { name: 'Minh T.', location: 'Hà Nội' },
  { name: 'Hương L.', location: 'TP.HCM' },
  { name: 'Anh K.', location: 'Đà Nẵng' },
  { name: 'Hoàng P.', location: 'Hải Phòng' },
  { name: 'Ngọc A.', location: 'Cần Thơ' },
  { name: 'Quân M.', location: 'Bình Dương' },
  { name: 'Linh N.', location: 'Quảng Ninh' },
  { name: 'Duy B.', location: 'Nha Trang' },
  { name: 'Thảo V.', location: 'Huế' },
];

const RECENT_TIMES = ['3 phút trước', '7 phút trước', '11 phút trước', '18 phút trước', 'gần đây'];
const DISPLAY_MS = 9000;
const INITIAL_DELAY_MS = 18000;
const MIN_GAP_MS = 30000;
const MAX_GAP_MS = 60000;

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const randomDelay = () => Math.floor(Math.random() * (MAX_GAP_MS - MIN_GAP_MS + 1)) + MIN_GAP_MS;

const typeConfig = {
  interest: {
    label: 'Yêu cầu tư vấn',
    action: 'vừa gửi yêu cầu cho',
    icon: MessageCircle,
    iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    chipClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dotClass: 'bg-emerald-500',
    lineClass: 'from-emerald-300 via-orange-200 to-transparent',
    barClass: 'from-emerald-400 via-orange-400 to-orange-600',
  },
  review: {
    label: 'Đánh giá mới',
    action: 'đã đánh giá',
    icon: Star,
    iconClass: 'bg-amber-50 text-amber-600 ring-amber-100',
    chipClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    dotClass: 'bg-amber-500',
    lineClass: 'from-amber-300 via-orange-200 to-transparent',
    barClass: 'from-amber-400 via-orange-400 to-orange-600',
  },
  viewing: {
    label: 'Đang quan tâm',
    action: 'đang xem',
    icon: Eye,
    iconClass: 'bg-blue-50 text-blue-600 ring-blue-100',
    chipClass: 'bg-blue-50 text-blue-700 ring-blue-100',
    dotClass: 'bg-blue-500',
    lineClass: 'from-blue-300 via-cyan-200 to-transparent',
    barClass: 'from-blue-400 via-cyan-400 to-orange-500',
  },
} as const;

const buildNotifications = (reviews: DbReview[]) => {
  const items: SocialProofNotification[] = [];

  reviews.forEach((review, idx) => {
    if (!review.product) return;

    const user = SAMPLE_USERS[idx % SAMPLE_USERS.length];
    const reviewerName = review.user?.name?.trim() || user.name;

    if (review.rating >= 4) {
      items.push({
        id: review.id,
        type: 'review',
        name: reviewerName,
        product: review.product.name,
        productSlug: review.product.slug,
        productImage: review.product.image,
        location: user.location,
        time: randomItem(RECENT_TIMES),
        rating: review.rating,
      });
    }

    if (idx < 6) {
      const interestedUser = SAMPLE_USERS[(idx + 3) % SAMPLE_USERS.length];
      items.push({
        id: 1000 + idx,
        type: 'interest',
        name: interestedUser.name,
        product: review.product.name,
        productSlug: review.product.slug,
        productImage: review.product.image,
        location: interestedUser.location,
        time: randomItem(RECENT_TIMES),
      });
    }
  });

  const uniqueProducts = reviews
    .map((review) => review.product)
    .filter(Boolean)
    .filter((product, idx, list) => list.findIndex((item) => item?.id === product?.id) === idx)
    .slice(0, 4);

  uniqueProducts.forEach((product, idx) => {
    if (!product) return;
    items.push({
      id: 9000 + idx,
      type: 'viewing',
      name: `${Math.floor(Math.random() * 9) + 6} người`,
      product: product.name,
      productSlug: product.slug,
      productImage: product.image,
      location: '',
      time: 'đang xem',
    });
  });

  return items.sort(() => Math.random() - 0.5);
};

export default function SocialProofNotifications() {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<SocialProofNotification | null>(null);
  const [notifications, setNotifications] = useState<SocialProofNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const indexRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reviews = await fetchAllReviews({ isApproved: true, limit: 12 });
        setNotifications(buildNotifications(reviews));
      } catch (error) {
        console.error('Error loading social proof data:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (dismissed || !loaded || notifications.length === 0) return;

    const showNext = (delay: number) => {
      const timer = window.setTimeout(() => {
        const next = notifications[indexRef.current % notifications.length];
        setCurrentNotification(next);
        setVisible(true);
        indexRef.current += 1;

        const hideTimer = window.setTimeout(() => {
          setVisible(false);
          showNext(randomDelay());
        }, DISPLAY_MS);

        timersRef.current.push(hideTimer);
      }, delay);

      timersRef.current.push(timer);
    };

    showNext(INITIAL_DELAY_MS);
    return clearTimers;
  }, [clearTimers, dismissed, loaded, notifications]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    clearTimers();
  }, [clearTimers]);

  const notificationContent = useMemo(() => {
    if (!currentNotification) return null;

    const config = typeConfig[currentNotification.type];
    const Icon = config.icon;

    return (
      <div className="pointer-events-auto group relative min-h-[78px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 py-2.5 pl-8 pr-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-white/80 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
        <div className={`absolute bottom-3 left-4 top-3 w-px bg-gradient-to-b ${config.lineClass}`} />
        <span className={`absolute left-[11px] top-3.5 h-2.5 w-2.5 rounded-full ${config.dotClass} shadow-sm ring-4 ring-white`} />
        <span className="absolute bottom-3.5 left-[13px] h-1.5 w-1.5 rounded-full bg-slate-300 ring-2 ring-white" />

        <div className="flex items-center gap-2.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-sm ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-[1.03]">
            {currentNotification.productImage ? (
              <Image
                src={currentNotification.productImage}
                alt={currentNotification.product}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-orange-50 text-orange-600">
                <Icon size={18} />
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-lg bg-white text-current shadow-md ring-1 ${config.iconClass}`}>
              <Icon size={11} strokeWidth={2.6} />
            </span>
          </div>

          <div className="min-w-0 flex-1 pr-5">
            <div className="mb-0.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ring-1 ${config.chipClass}`}>
                {config.label}
              </span>
              {currentNotification.rating && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                  <Star size={10} className="fill-amber-400" />
                  {currentNotification.rating.toFixed(1)}
                </span>
              )}
              <span className="truncate text-[10px] font-bold text-slate-400">{currentNotification.time}</span>
            </div>

            <p className="line-clamp-1 text-[12.5px] font-semibold leading-5 text-slate-600">
              <span className="font-black text-slate-950">{currentNotification.name}</span>
              <span> {config.action} </span>
              <span className="font-black text-orange-700">{currentNotification.product}</span>
            </p>

            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400">
              <CheckCircle2 size={10} className="text-emerald-500" />
              {currentNotification.location ? currentNotification.location : 'Hoạt động gần đây'}
            </p>
          </div>

          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDismiss();
            }}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Ẩn thông báo"
            type="button"
          >
            <X size={13} />
          </button>
        </div>

        <span className={`social-proof-progress absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${config.barClass}`} />
      </div>
    );
  }, [currentNotification, handleDismiss]);

  if (!currentNotification) return null;

  const content = currentNotification.productSlug ? (
    <Link href={`/product/${currentNotification.productSlug}`} className="block">
      {notificationContent}
    </Link>
  ) : (
    notificationContent
  );

  return (
    <div
      className={`pointer-events-none fixed left-3 right-3 top-20 z-[150] transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:left-auto md:right-6 md:top-24 md:w-[360px] ${
        visible
          ? 'translate-y-0 scale-100 opacity-100 blur-0'
          : '-translate-y-3 scale-[0.98] opacity-0 blur-[1px]'
      }`}
    >
      {content}

      <style jsx global>{`
        @keyframes social-proof-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        .social-proof-progress {
          transform-origin: left center;
          animation: social-proof-progress ${DISPLAY_MS}ms linear forwards;
        }
      `}</style>
    </div>
  );
}
