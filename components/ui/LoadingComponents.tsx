'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'orange' | 'white' | 'gray';
    withText?: boolean;
}

const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
};

export function LoadingSpinner({
    size = 'md',
    color = 'orange',
    withText = false
}: LoadingSpinnerProps) {
    const borderColor = {
        orange: 'border-orange-600',
        white: 'border-white',
        gray: 'border-gray-400',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className={`relative ${sizeClasses[size]} border-t-4 border-b-4 ${borderColor[color]} rounded-full animate-spin`}></div>
            </div>
            {withText && (
                <p className="text-sm font-semibold text-orange-600 animate-pulse">
                    Loading...
                </p>
            )}
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="loading-overlay">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 rounded-full blur-2xl opacity-40"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.4, 0.6, 0.4],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    <motion.div
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="relative"
                    >
                        <Package className="w-16 h-16 text-orange-600" strokeWidth={2.5} />
                    </motion.div>
                </div>
                <motion.h2
                    className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    Web Giá Rẻ - Portfolio
                </motion.h2>
            </div>
        </div>
    );
}

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'orange';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({
    className = '',
    variant = 'default',
    rounded = 'md'
}: SkeletonProps) {
    const roundedClasses = {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const skeletonClass = variant === 'orange' ? 'skeleton-orange' : 'skeleton';

    return (
        <div className={`${skeletonClass} ${roundedClasses[rounded]} ${className}`}></div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-4 space-y-4">
            <Skeleton className="w-full aspect-[4/3]" rounded="lg" />
            <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-10" rounded="full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
