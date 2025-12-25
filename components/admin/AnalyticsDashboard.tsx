'use client';

import React, { memo } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
    Eye, Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
    title: string;
    value: string | number;
    change?: number; // percentage change
    icon: any;
    color: 'orange' | 'blue' | 'green' | 'purple' | 'red';
    suffix?: string;
}

const colorClasses = {
    orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        gradient: 'from-orange-500 to-red-500',
    },
    blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        gradient: 'from-blue-500 to-indigo-500',
    },
    green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        gradient: 'from-green-500 to-emerald-500',
    },
    purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        gradient: 'from-purple-500 to-violet-500',
    },
    red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        gradient: 'from-red-500 to-rose-500',
    },
};

export const StatCard = memo(({
    title,
    value,
    change,
    icon: Icon,
    color,
    suffix = '',
}: StatCardProps) => {
    const isPositive = change !== undefined && change >= 0;
    const colors = colorClasses[color];

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon size={24} className={colors.text} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-black text-slate-900">
                {value}{suffix}
            </p>
        </div>
    );
});
StatCard.displayName = 'StatCard';

// ============================================
// SIMPLE BAR CHART
// ============================================
interface BarChartData {
    label: string;
    value: number;
    color?: string;
}

interface SimpleBarChartProps {
    data: BarChartData[];
    title?: string;
    maxValue?: number;
}

export const SimpleBarChart = memo(({
    data,
    title,
    maxValue,
}: SimpleBarChartProps) => {
    const max = maxValue || Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            {title && <h3 className="font-bold text-lg text-slate-900 mb-6">{title}</h3>}
            <div className="space-y-4">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-bold text-slate-900">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
SimpleBarChart.displayName = 'SimpleBarChart';

// ============================================
// SIMPLE LINE CHART (CSS only)
// ============================================
interface LineChartData {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    data: LineChartData[];
    title?: string;
    color?: string;
}

export const SimpleLineChart = memo(({
    data,
    title,
    color = 'orange',
}: SimpleLineChartProps) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    // Generate SVG path
    const pathPoints = data.map((d, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 100 - ((d.value - min) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    const gradientId = `gradient-${Math.random().toString(36).slice(2)}`;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            {title && <h3 className="font-bold text-lg text-slate-900 mb-4">{title}</h3>}

            <div className="relative h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color === 'orange' ? '#ea580c' : '#3b82f6'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color === 'orange' ? '#ea580c' : '#3b82f6'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <polygon
                        points={`0,100 ${pathPoints} 100,100`}
                        fill={`url(#${gradientId})`}
                    />

                    {/* Line */}
                    <polyline
                        points={pathPoints}
                        fill="none"
                        stroke={color === 'orange' ? '#ea580c' : '#3b82f6'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {data.map((d, idx) => {
                        const x = (idx / (data.length - 1)) * 100;
                        const y = 100 - ((d.value - min) / range) * 80 - 10;
                        return (
                            <circle
                                key={idx}
                                cx={x}
                                cy={y}
                                r="2"
                                fill="white"
                                stroke={color === 'orange' ? '#ea580c' : '#3b82f6'}
                                strokeWidth="1.5"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-500">
                {data.map((d, idx) => (
                    <span key={idx} className={idx === 0 || idx === data.length - 1 ? '' : 'hidden sm:inline'}>
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
});
SimpleLineChart.displayName = 'SimpleLineChart';

// ============================================
// DONUT CHART
// ============================================
interface DonutChartData {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartData[];
    title?: string;
    centerLabel?: string;
    centerValue?: string | number;
}

export const DonutChart = memo(({
    data,
    title,
    centerLabel,
    centerValue,
}: DonutChartProps) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let accumulated = 0;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            {title && <h3 className="font-bold text-lg text-slate-900 mb-4">{title}</h3>}

            <div className="flex items-center gap-6">
                {/* Donut */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {data.map((d, idx) => {
                            const percentage = (d.value / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -accumulated;
                            accumulated += percentage;

                            return (
                                <circle
                                    key={idx}
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={d.color}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </svg>
                    {centerLabel && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-900">{centerValue}</span>
                            <span className="text-xs text-slate-500">{centerLabel}</span>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {data.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-slate-600 flex-1">{d.label}</span>
                            <span className="font-bold text-slate-900">{((d.value / total) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
DonutChart.displayName = 'DonutChart';

// ============================================
// ANALYTICS GRID (Main Dashboard)
// ============================================
interface AnalyticsData {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    customers: number;
    customersChange: number;
    products: number;
    views: number;
    downloads: number;
}

interface AnalyticsDashboardProps {
    data: AnalyticsData;
}

export const AnalyticsDashboard = memo(({ data }: AnalyticsDashboardProps) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Doanh thu"
                value={`${(data.revenue / 1000000).toFixed(1)}M`}
                suffix="₫"
                change={data.revenueChange}
                icon={DollarSign}
                color="green"
            />
            <StatCard
                title="Đơn hàng"
                value={data.orders}
                change={data.ordersChange}
                icon={ShoppingCart}
                color="orange"
            />
            <StatCard
                title="Khách hàng"
                value={data.customers}
                change={data.customersChange}
                icon={Users}
                color="blue"
            />
            <StatCard
                title="Sản phẩm"
                value={data.products}
                icon={Package}
                color="purple"
            />
        </div>
    );
});
AnalyticsDashboard.displayName = 'AnalyticsDashboard';

export default AnalyticsDashboard;
