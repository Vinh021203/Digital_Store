'use client';

import React from 'react';

// ============================================
// SKELETON BASE COMPONENT
// ============================================

interface SkeletonProps {
    className?: string;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'lg' }) => {
    const roundedClass = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
    }[rounded];

    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${roundedClass} ${className}`}
            style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
};

// ============================================
// PRODUCT CARD SKELETON
// ============================================

export const ProductCardSkeleton: React.FC<{ viewMode?: 'grid' | 'list' }> = ({ viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-row h-full">
                {/* Image */}
                <div className="w-1/3 max-w-[200px] bg-slate-100">
                    <Skeleton className="w-full h-full min-h-[150px]" rounded="none" />
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-24 mb-4" />
                    <div className="mt-auto flex items-center justify-between">
                        <div>
                            <Skeleton className="h-6 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-10 w-28" rounded="xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full">
            {/* Image */}
            <div className="relative aspect-[3/4] bg-slate-100">
                <Skeleton className="w-full h-full" rounded="none" />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                    <Skeleton className="h-5 w-16" rounded="md" />
                </div>
            </div>
            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Category */}
                <Skeleton className="h-3 w-20 mb-2" />
                {/* Title */}
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                {/* Author */}
                <Skeleton className="h-3 w-24 mb-3" />
                {/* Price & Rating */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    {/* Button */}
                    <Skeleton className="h-10 w-full" rounded="xl" />
                </div>
            </div>
        </div>
    );
};

// ============================================
// PRODUCT GRID SKELETON
// ============================================

export const ProductGridSkeleton: React.FC<{ count?: number; viewMode?: 'grid' | 'list' }> = ({
    count = 8,
    viewMode = 'grid'
}) => {
    return (
        <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'
            : 'flex flex-col gap-4'
        }>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} viewMode={viewMode} />
            ))}
        </div>
    );
};

// ============================================
// BLOG POST SKELETON
// ============================================

export const BlogPostSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cover Image */}
            <Skeleton className="w-full h-48" rounded="none" />
            {/* Content */}
            <div className="p-5">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Skeleton className="w-10 h-10" rounded="full" />
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BlogGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <BlogPostSkeleton key={index} />
            ))}
        </div>
    );
};

// ============================================
// PROFILE SKELETON
// ============================================

export const ProfileHeaderSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Cover */}
            <Skeleton className="w-full h-48" rounded="none" />
            {/* Avatar & Info */}
            <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                    <Skeleton className="w-32 h-32 border-4 border-white" rounded="2xl" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-3" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// TABLE SKELETON
// ============================================

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 5
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        {Array.from({ length: columns }).map((_, index) => (
                            <th key={index} className="py-4 px-4 text-left">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <TableRowSkeleton key={index} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ============================================
// STATS SKELETON
// ============================================

export const StatCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12" rounded="xl" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
};

export const StatsGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <StatCardSkeleton key={index} />
            ))}
        </div>
    );
};

// ============================================
// COMMUNITY POST SKELETON
// ============================================

export const CommunityPostSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10" rounded="full" />
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            {/* Content */}
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            {/* Image */}
            <Skeleton className="w-full h-48 mb-4" rounded="xl" />
            {/* Tags */}
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16" rounded="lg" />
                <Skeleton className="h-6 w-20" rounded="lg" />
            </div>
            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Skeleton className="h-8 w-20" rounded="lg" />
                <Skeleton className="h-8 w-20" rounded="lg" />
                <Skeleton className="h-8 w-20" rounded="lg" />
            </div>
        </div>
    );
};

// ============================================
// NOTIFICATION SKELETON
// ============================================

export const NotificationSkeleton: React.FC = () => {
    return (
        <div className="flex items-start gap-3 p-4 border-b border-slate-100">
            <Skeleton className="w-10 h-10 flex-shrink-0" rounded="full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
};

// ============================================
// SIDEBAR SKELETON
// ============================================

export const SidebarSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8" rounded="lg" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
        </div>
    );
};

// ============================================
// EXPORT ALL
// ============================================

export default {
    Skeleton,
    ProductCardSkeleton,
    ProductGridSkeleton,
    BlogPostSkeleton,
    BlogGridSkeleton,
    ProfileHeaderSkeleton,
    TableSkeleton,
    TableRowSkeleton,
    StatCardSkeleton,
    StatsGridSkeleton,
    CommunityPostSkeleton,
    NotificationSkeleton,
    SidebarSkeleton,
};
